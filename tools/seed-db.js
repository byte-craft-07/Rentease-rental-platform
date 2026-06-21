require('dotenv').config();

const mongoose = require('mongoose');
const { categories, products, serviceAreas, users } = require('../server/src/data/seedData');
const { isProduction, validateEnvironment } = require('../server/src/config/env');
const {
  AdminReport,
  Cart,
  Category,
  DamageClaim,
  MaintenanceRequest,
  Order,
  Product,
  Rental,
  ServiceArea,
  User
} = require('../server/src/models');
const { hashPassword } = require('../server/src/utils/auth');

function addDays(days, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function monthWindow(date = new Date()) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

  return { startDate, endDate };
}

function orderItem(product, quantity, tenureMonths) {
  return {
    product: product._id,
    productName: product.name,
    quantity,
    tenureMonths,
    monthlyRent: product.monthlyRent,
    securityDeposit: product.securityDeposit
  };
}

function rentalItem(product, quantity) {
  return {
    product: product._id,
    productName: product.name,
    quantity,
    monthlyRent: product.monthlyRent,
    securityDeposit: product.securityDeposit,
    conditionAtDelivery: 'excellent'
  };
}

function calculateTotals(items) {
  return items.reduce(
    (totals, item) => ({
      monthlyTotal: totals.monthlyTotal + item.monthlyRent * item.quantity,
      depositTotal: totals.depositTotal + item.securityDeposit * item.quantity
    }),
    { monthlyTotal: 0, depositTotal: 0 }
  );
}

async function upsertCategories() {
  const categoryMap = new Map();

  for (const category of categories) {
    const document = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
    );
    categoryMap.set(category.slug, document);
  }

  return categoryMap;
}

async function upsertServiceAreas() {
  for (const serviceArea of serviceAreas) {
    await ServiceArea.findOneAndUpdate(
      { city: serviceArea.city },
      { $set: serviceArea },
      { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
    );
  }
}

async function upsertUsers() {
  const userMap = new Map();

  for (const user of users) {
    const { password, ...userDocument } = user;
    const document = await User.findOneAndUpdate(
      { email: user.email },
      { $set: { ...userDocument, passwordHash: hashPassword(password) } },
      { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
    );
    userMap.set(user.email, document);
  }

  return userMap;
}

async function upsertProducts(categoryMap) {
  const productMap = new Map();

  for (const product of products) {
    const { categorySlug, ...productDocument } = product;
    const category = categoryMap.get(categorySlug);

    if (!category) {
      throw new Error(`Missing category for product ${product.slug}: ${categorySlug}`);
    }

    const document = await Product.findOneAndUpdate(
      { slug: product.slug },
      { $set: { ...productDocument, category: category._id } },
      { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
    );
    productMap.set(product.slug, document);
  }

  return productMap;
}

async function upsertCart(user, productMap) {
  const items = [
    {
      product: productMap.get('mia-3-seater-sofa')._id,
      quantity: 1,
      tenureMonths: 6,
      monthlyRent: productMap.get('mia-3-seater-sofa').monthlyRent,
      securityDeposit: productMap.get('mia-3-seater-sofa').securityDeposit
    },
    {
      product: productMap.get('compact-microwave-oven')._id,
      quantity: 1,
      tenureMonths: 6,
      monthlyRent: productMap.get('compact-microwave-oven').monthlyRent,
      securityDeposit: productMap.get('compact-microwave-oven').securityDeposit
    }
  ];
  const totals = calculateTotals(items);

  await Cart.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        user: user._id,
        items,
        selectedCity: 'Bengaluru',
        deliveryAddress: {
          line1: 'Flat 302, Cedar Heights',
          line2: 'Koramangala 5th Block',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560095',
          landmark: 'Opposite Forum Mall'
        },
        deliveryDate: addDays(4, 11),
        monthlyTotal: totals.monthlyTotal,
        depositTotal: totals.depositTotal
      }
    },
    { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
  );
}

async function upsertOrder(user, productMap) {
  const items = [
    orderItem(productMap.get('lg-260l-refrigerator'), 1, 6),
    orderItem(productMap.get('work-desk-kit'), 1, 6),
    orderItem(productMap.get('evergreen-decor-pack'), 1, 6)
  ];
  const totals = calculateTotals(items);

  return Order.findOneAndUpdate(
    { orderNumber: 'ORD-DEMO-1001' },
    {
      $set: {
        orderNumber: 'ORD-DEMO-1001',
        user: user._id,
        items,
        deliveryAddress: {
          line1: 'Flat 302, Cedar Heights',
          line2: 'Koramangala 5th Block',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560095',
          landmark: 'Opposite Forum Mall'
        },
        deliveryDate: addDays(3, 14),
        pickupDate: addDays(180, 10),
        monthlyTotal: totals.monthlyTotal,
        depositTotal: totals.depositTotal,
        deliveryFee: 249,
        paymentStatus: 'authorized',
        status: 'scheduled',
        notes: 'Development seed order for customer checkout and admin order monitoring.'
      }
    },
    { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
  );
}

async function upsertRental(user, order, productMap) {
  const items = [
    rentalItem(productMap.get('lg-260l-refrigerator'), 1),
    rentalItem(productMap.get('work-desk-kit'), 1),
    rentalItem(productMap.get('evergreen-decor-pack'), 1)
  ];
  const totals = calculateTotals(items);

  return Rental.findOneAndUpdate(
    { rentalNumber: 'RNT-DEMO-1001' },
    {
      $set: {
        rentalNumber: 'RNT-DEMO-1001',
        order: order._id,
        user: user._id,
        items,
        startDate: addDays(-24, 9),
        endDate: addDays(156, 9),
        nextBillingDate: addDays(6, 9),
        monthlyTotal: totals.monthlyTotal,
        depositTotal: totals.depositTotal,
        status: 'active',
        returnRequest: {
          status: 'none'
        }
      }
    },
    { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
  );
}

async function upsertMaintenance(user, rental, productMap) {
  return MaintenanceRequest.findOneAndUpdate(
    { ticketNumber: 'MNT-DEMO-1001' },
    {
      $set: {
        ticketNumber: 'MNT-DEMO-1001',
        user: user._id,
        rental: rental._id,
        product: productMap.get('lg-260l-refrigerator')._id,
        type: 'inspection',
        priority: 'medium',
        status: 'scheduled',
        description: 'Customer reported unusual cooling sound. Technician visit scheduled.',
        images: [],
        scheduledVisit: {
          date: addDays(2, 16),
          timeSlot: '4 PM - 6 PM',
          technicianName: 'Nikhil Rao'
        },
        resolution: {
          notes: '',
          cost: 0
        }
      }
    },
    { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
  );
}

async function upsertDamageClaim(user, rental, productMap) {
  return DamageClaim.findOneAndUpdate(
    { claimNumber: 'DMG-DEMO-1001' },
    {
      $set: {
        claimNumber: 'DMG-DEMO-1001',
        rental: rental._id,
        user: user._id,
        product: productMap.get('work-desk-kit')._id,
        description: 'Minor desk corner chip found during scheduled quality audit.',
        claimAmount: 450,
        status: 'under_review',
        evidence: [],
        resolutionNotes: 'Admin review pending with vendor partner.'
      }
    },
    { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
  );
}

async function upsertAdminReport(admin) {
  const { startDate, endDate } = monthWindow();
  const [activeRentals, rentals, productsForUtilization, openMaintenanceRequests, pendingReturns, damageClaims] =
    await Promise.all([
      Rental.countDocuments({ status: { $in: ['active', 'extended', 'return_requested'] } }),
      Rental.find({ status: { $in: ['active', 'extended', 'return_requested'] } }).select('monthlyTotal').lean(),
      Product.find({ status: 'active' }).select('stock availableStock').lean(),
      MaintenanceRequest.countDocuments({ status: { $in: ['open', 'assigned', 'scheduled'] } }),
      Rental.countDocuments({ status: 'return_requested' }),
      DamageClaim.find({ status: { $in: ['open', 'under_review', 'approved'] } }).select('claimAmount').lean()
    ]);

  const stock = productsForUtilization.reduce((sum, product) => sum + product.stock, 0);
  const availableStock = productsForUtilization.reduce((sum, product) => sum + product.availableStock, 0);
  const usedStock = Math.max(0, stock - availableStock);

  await AdminReport.findOneAndUpdate(
    {
      'period.type': 'monthly',
      'period.startDate': startDate,
      'period.endDate': endDate
    },
    {
      $set: {
        period: {
          type: 'monthly',
          startDate,
          endDate
        },
        metrics: {
          activeRentals,
          monthlyRecurringRevenue: rentals.reduce((sum, rental) => sum + rental.monthlyTotal, 0),
          productUtilizationRate: stock ? Math.round((usedStock / stock) * 100) : 0,
          customerRetentionRate: 82,
          averageMaintenanceResolutionHours: 18,
          openMaintenanceRequests,
          pendingReturns,
          damageClaimAmount: damageClaims.reduce((sum, claim) => sum + claim.claimAmount, 0)
        },
        generatedBy: admin._id,
        notes: 'Development monthly KPI snapshot for admin analytics verification.'
      }
    },
    { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true }
  );
}

async function summary() {
  const [
    userCount,
    categoryCount,
    productCount,
    cartCount,
    orderCount,
    rentalCount,
    maintenanceCount,
    serviceAreaCount,
    damageClaimCount,
    reportCount
  ] = await Promise.all([
    User.countDocuments(),
    Category.countDocuments(),
    Product.countDocuments(),
    Cart.countDocuments(),
    Order.countDocuments(),
    Rental.countDocuments(),
    MaintenanceRequest.countDocuments(),
    ServiceArea.countDocuments(),
    DamageClaim.countDocuments(),
    AdminReport.countDocuments()
  ]);

  return {
    users: userCount,
    categories: categoryCount,
    products: productCount,
    carts: cartCount,
    orders: orderCount,
    rentals: rentalCount,
    maintenanceRequests: maintenanceCount,
    serviceAreas: serviceAreaCount,
    damageClaims: damageClaimCount,
    adminReports: reportCount
  };
}

async function main() {
  if (isProduction() && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error('Refusing to seed with NODE_ENV=production. Set ALLOW_PRODUCTION_SEED=true only for an intentional staging/admin operation.');
  }

  validateEnvironment();

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to .env before running the seed script.');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  const categoryMap = await upsertCategories();
  await upsertServiceAreas();
  const userMap = await upsertUsers();
  const productMap = await upsertProducts(categoryMap);

  const admin = userMap.get('admin@rentease.local');
  const customer = userMap.get('aarav.customer@rentease.local');

  await upsertCart(customer, productMap);
  const order = await upsertOrder(customer, productMap);
  const rental = await upsertRental(customer, order, productMap);
  await upsertMaintenance(customer, rental, productMap);
  await upsertDamageClaim(customer, rental, productMap);
  await upsertAdminReport(admin);

  const counts = await summary();

  console.log('RentEase development seed completed.');
  console.table(counts);
  console.log('Development login accounts:');
  console.log('- admin@rentease.local / Admin@12345');
  console.log('- vendor@rentease.local / Vendor@12345');
  console.log('- aarav.customer@rentease.local / Customer@12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
