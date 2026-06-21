const express = require('express');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Rental = require('../models/Rental');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/httpError');
const { requireFields, validateObjectId } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

function createTicketNumber() {
  return `MNT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

router.post(
  '/',
  asyncHandler(async (request, response) => {
    requireFields(request.body, ['type', 'description', 'rental']);

    const rentalId = validateObjectId(request.body.rental, 'rental');
    const rental = await Rental.findOne({
      _id: rentalId,
      user: request.user._id,
      status: { $in: ['active', 'extended', 'return_requested'] }
    }).lean();

    if (!rental) throw createHttpError(404, 'Rental not found.');

    let productId;
    if (request.body.product) {
      productId = validateObjectId(request.body.product, 'product');
      const productBelongsToRental = rental.items.some((item) => String(item.product) === String(productId));
      if (!productBelongsToRental) throw createHttpError(400, 'Product does not belong to this rental.');
    } else if (request.body.type !== 'pickup_support') {
      throw createHttpError(400, 'Product is required for this maintenance request type.');
    }

    const ticket = await MaintenanceRequest.create({
      ticketNumber: createTicketNumber(),
      user: request.user._id,
      rental: rental._id,
      product: productId,
      type: request.body.type,
      priority: request.body.priority || 'medium',
      description: String(request.body.description).trim(),
      images: request.body.images || []
    });

    response.status(201).json({
      data: ticket,
      message: 'Maintenance request created.'
    });
  })
);

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const query = request.user.role === 'admin' || request.user.role === 'vendor' ? {} : { user: request.user._id };
    if (request.query.status) query.status = request.query.status;

    const data = await MaintenanceRequest.find(query).sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

router.get(
  '/:id',
  asyncHandler(async (request, response) => {
    const query = { _id: request.params.id };
    if (request.user.role === 'customer') query.user = request.user._id;

    const ticket = await MaintenanceRequest.findOne(query).lean();
    if (!ticket) throw createHttpError(404, 'Maintenance request not found.');

    response.json({ data: ticket });
  })
);

module.exports = router;
