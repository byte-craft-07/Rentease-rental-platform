const express = require('express');
const {
  AdminAuditLog,
  AdminReport,
  Category,
  DamageClaim,
  MaintenanceRequest,
  Order,
  Product,
  Rental,
  ServiceArea,
  User
} = require('../models');
const { allowRoles, requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/httpError');
const { isMongoConnected } = require('../config/db');

const router = express.Router();

router.use(requireAuth, allowRoles('admin', 'vendor'));

async function recordAdminAudit(request, details) {
  if (!isMongoConnected()) return;

  await AdminAuditLog.create({
    actor: request.user._id,
    actorName: request.user.name,
    actorRole: request.user.role,
    action: details.action,
    entityType: details.entityType,
    entityId: details.entityId,
    entityLabel: details.entityLabel || '',
    metadata: details.metadata || {}
  });
}

async function restoreRentalInventory(rental) {
  if (!rental?.items?.length) return;

  await Promise.all(
    rental.items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        [
          {
            $set: {
              availableStock: {
                $min: [{ $add: ['$availableStock', item.quantity] }, '$stock']
              }
            }
          }
        ]
      )
    )
  );
}

router.get(
  '/overview',
  asyncHandler(async (request, response) => {
    if (!isMongoConnected()) {
      response.json({
        data: {
          mode: 'no-db',
          activeRentals: 0,
          monthlyRecurringRevenue: 0,
          productUtilizationRate: 0,
          openMaintenanceRequests: 0,
          pendingOrders: 0,
          damageClaims: 0
        }
      });
      return;
    }

    const [activeRentals, rentals, products, openMaintenanceRequests, pendingOrders, damageClaims] = await Promise.all([
      Rental.countDocuments({ status: { $in: ['active', 'extended', 'return_requested'] } }),
      Rental.find({ status: { $in: ['active', 'extended', 'return_requested'] } }).select('monthlyTotal').lean(),
      Product.find({ status: 'active' }).select('stock availableStock').lean(),
      MaintenanceRequest.countDocuments({ status: { $in: ['open', 'assigned', 'scheduled'] } }),
      Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'scheduled'] } }),
      DamageClaim.countDocuments({ status: { $in: ['open', 'under_review'] } })
    ]);

    const stock = products.reduce((sum, item) => sum + item.stock, 0);
    const availableStock = products.reduce((sum, item) => sum + item.availableStock, 0);
    const usedStock = Math.max(0, stock - availableStock);

    response.json({
      data: {
        mode: 'mongodb',
        activeRentals,
        monthlyRecurringRevenue: rentals.reduce((sum, rental) => sum + rental.monthlyTotal, 0),
        productUtilizationRate: stock ? Math.round((usedStock / stock) * 100) : 0,
        openMaintenanceRequests,
        pendingOrders,
        damageClaims
      }
    });
  })
);

router.get(
  '/users',
  asyncHandler(async (request, response) => {
    const data = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

router.get(
  '/audit-logs',
  asyncHandler(async (request, response) => {
    const data = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(30).lean();
    response.json({ data });
  })
);

router.patch(
  '/users/:id',
  asyncHandler(async (request, response) => {
    if (request.user.role !== 'admin') throw createHttpError(403, 'Only admins can manage user status.');
    if (String(request.user._id) === String(request.params.id) && request.body.status && request.body.status !== 'active') {
      throw createHttpError(400, 'You cannot disable your own admin account.');
    }

    const payload = {};
    if (request.body.status) payload.status = request.body.status;
    if (request.body.role) payload.role = request.body.role;

    const user = await User.findByIdAndUpdate(request.params.id, payload, {
      new: true,
      runValidators: true
    }).select('-passwordHash');

    if (!user) throw createHttpError(404, 'User not found.');

    await recordAdminAudit(request, {
      action: 'user.updated',
      entityType: 'user',
      entityId: user._id,
      entityLabel: user.email,
      metadata: payload
    });

    response.json({ data: user });
  })
);

router.post(
  '/categories',
  asyncHandler(async (request, response) => {
    const category = await Category.create(request.body);
    await recordAdminAudit(request, {
      action: 'category.created',
      entityType: 'category',
      entityId: category._id,
      entityLabel: category.name
    });
    response.status(201).json({ data: category });
  })
);

router.get(
  '/products',
  asyncHandler(async (request, response) => {
    const data = await Product.find().populate('category', 'name slug type').sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

router.post(
  '/products',
  asyncHandler(async (request, response) => {
    const product = await Product.create(request.body);
    await product.populate('category', 'name slug type');
    await recordAdminAudit(request, {
      action: 'product.created',
      entityType: 'product',
      entityId: product._id,
      entityLabel: product.name
    });
    response.status(201).json({ data: product });
  })
);

router.patch(
  '/products/:id',
  asyncHandler(async (request, response) => {
    const product = await Product.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });

    if (!product) throw createHttpError(404, 'Product not found.');

    await product.populate('category', 'name slug type');
    await recordAdminAudit(request, {
      action: 'product.updated',
      entityType: 'product',
      entityId: product._id,
      entityLabel: product.name,
      metadata: { fields: Object.keys(request.body || {}) }
    });
    response.json({ data: product });
  })
);

router.delete(
  '/products/:id',
  asyncHandler(async (request, response) => {
    const product = await Product.findByIdAndUpdate(
      request.params.id,
      { status: 'retired' },
      { new: true, runValidators: true }
    );

    if (!product) throw createHttpError(404, 'Product not found.');

    await product.populate('category', 'name slug type');
    await recordAdminAudit(request, {
      action: 'product.retired',
      entityType: 'product',
      entityId: product._id,
      entityLabel: product.name
    });
    response.json({ data: product });
  })
);

router.get(
  '/service-areas',
  asyncHandler(async (request, response) => {
    const data = await ServiceArea.find().sort({ city: 1 }).lean();
    response.json({ data });
  })
);

router.get(
  '/orders',
  asyncHandler(async (request, response) => {
    const data = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

router.patch(
  '/orders/:id',
  asyncHandler(async (request, response) => {
    const previousOrder = await Order.findById(request.params.id).lean();
    if (!previousOrder) throw createHttpError(404, 'Order not found.');

    const payload = {};
    ['status', 'paymentStatus', 'deliveryDate', 'pickupDate', 'notes'].forEach((field) => {
      if (request.body[field] !== undefined) payload[field] = request.body[field];
    });

    const order = await Order.findByIdAndUpdate(request.params.id, payload, {
      new: true,
      runValidators: true
    }).populate('user', 'name email phone');

    if (request.body.status === 'cancelled' && previousOrder.status !== 'cancelled') {
      const rental = await Rental.findOne({ order: previousOrder._id });
      if (rental && !['returned', 'cancelled'].includes(rental.status)) {
        rental.status = 'cancelled';
        rental.returnRequest.status = rental.returnRequest.status === 'completed' ? 'completed' : 'none';
        await rental.save();
        await restoreRentalInventory(rental);
      }
    }

    await recordAdminAudit(request, {
      action: 'order.updated',
      entityType: 'order',
      entityId: order._id,
      entityLabel: order.orderNumber,
      metadata: payload
    });

    response.json({ data: order });
  })
);

router.get(
  '/rentals',
  asyncHandler(async (request, response) => {
    const data = await Rental.find().populate('user', 'name email phone').sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

router.patch(
  '/rentals/:id',
  asyncHandler(async (request, response) => {
    const previousRental = await Rental.findById(request.params.id);
    if (!previousRental) throw createHttpError(404, 'Rental not found.');

    const payload = {};
    if (request.body.status) payload.status = request.body.status;
    if (request.body.returnStatus) payload['returnRequest.status'] = request.body.returnStatus;
    if (request.body.preferredPickupDate) payload['returnRequest.preferredPickupDate'] = request.body.preferredPickupDate;

    const rental = await Rental.findByIdAndUpdate(request.params.id, payload, {
      new: true,
      runValidators: true
    }).populate('user', 'name email phone');

    const shouldRestoreInventory =
      ['returned', 'cancelled'].includes(rental.status) && !['returned', 'cancelled'].includes(previousRental.status);
    if (shouldRestoreInventory) await restoreRentalInventory(previousRental);

    await recordAdminAudit(request, {
      action: 'rental.updated',
      entityType: 'rental',
      entityId: rental._id,
      entityLabel: rental.rentalNumber,
      metadata: payload
    });

    response.json({ data: rental });
  })
);

router.patch(
  '/maintenance/:id',
  asyncHandler(async (request, response) => {
    const ticket = await MaintenanceRequest.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });

    if (!ticket) throw createHttpError(404, 'Maintenance request not found.');

    await recordAdminAudit(request, {
      action: 'maintenance.updated',
      entityType: 'maintenanceRequest',
      entityId: ticket._id,
      entityLabel: ticket.ticketNumber,
      metadata: { status: ticket.status }
    });

    response.json({ data: ticket });
  })
);

router.post(
  '/service-areas',
  asyncHandler(async (request, response) => {
    const serviceArea = await ServiceArea.create(request.body);
    await recordAdminAudit(request, {
      action: 'serviceArea.created',
      entityType: 'serviceArea',
      entityId: serviceArea._id,
      entityLabel: serviceArea.city
    });
    response.status(201).json({ data: serviceArea });
  })
);

router.get(
  '/damage-claims',
  asyncHandler(async (request, response) => {
    const data = await DamageClaim.find()
      .populate('rental', 'rentalNumber status')
      .populate('user', 'name email phone')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    response.json({ data });
  })
);

router.patch(
  '/service-areas/:id',
  asyncHandler(async (request, response) => {
    const serviceArea = await ServiceArea.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });

    if (!serviceArea) throw createHttpError(404, 'Service area not found.');

    await recordAdminAudit(request, {
      action: 'serviceArea.updated',
      entityType: 'serviceArea',
      entityId: serviceArea._id,
      entityLabel: serviceArea.city,
      metadata: { fields: Object.keys(request.body || {}) }
    });

    response.json({ data: serviceArea });
  })
);

router.post(
  '/damage-claims',
  asyncHandler(async (request, response) => {
    const claim = await DamageClaim.create(request.body);
    await recordAdminAudit(request, {
      action: 'damageClaim.created',
      entityType: 'damageClaim',
      entityId: claim._id,
      entityLabel: claim.claimNumber
    });
    response.status(201).json({ data: claim });
  })
);

router.patch(
  '/damage-claims/:id',
  asyncHandler(async (request, response) => {
    const claim = await DamageClaim.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });

    if (!claim) throw createHttpError(404, 'Damage claim not found.');

    await claim.populate('rental', 'rentalNumber status');
    await claim.populate('user', 'name email phone');
    await claim.populate('product', 'name slug');
    await recordAdminAudit(request, {
      action: 'damageClaim.updated',
      entityType: 'damageClaim',
      entityId: claim._id,
      entityLabel: claim.claimNumber,
      metadata: { status: claim.status }
    });
    response.json({ data: claim });
  })
);

router.get(
  '/reports',
  asyncHandler(async (request, response) => {
    const data = await AdminReport.find().sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

module.exports = router;
