const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Rental = require('../models/Rental');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/httpError');
const { requireFields } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

function createNumber(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function validateDeliveryAddress(address) {
  if (!address || typeof address !== 'object') {
    throw createHttpError(400, 'Delivery address is required.');
  }

  requireFields(address, ['line1', 'city', 'state', 'pincode']);

  return {
    line1: String(address.line1).trim(),
    line2: address.line2 ? String(address.line2).trim() : '',
    city: String(address.city).trim(),
    state: String(address.state).trim(),
    pincode: String(address.pincode).trim(),
    landmark: address.landmark ? String(address.landmark).trim() : ''
  };
}

function validateDeliveryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw createHttpError(400, 'Enter a valid delivery date.');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) throw createHttpError(400, 'Delivery date cannot be in the past.');

  return date;
}

router.post(
  '/',
  asyncHandler(async (request, response) => {
    requireFields(request.body, ['deliveryAddress', 'deliveryDate']);

    const cart = await Cart.findOne({ user: request.user._id }).populate('items.product');
    if (!cart || !cart.items.length) throw createHttpError(400, 'Cart is empty.');

    const deliveryAddress = validateDeliveryAddress(request.body.deliveryAddress);
    const deliveryDate = validateDeliveryDate(request.body.deliveryDate);

    const unavailableItems = cart.items.filter(
      (item) => !item.product || item.product.status !== 'active' || item.product.availableStock < item.quantity
    );
    if (unavailableItems.length) {
      throw createHttpError(409, 'Some cart items are no longer available. Please review your cart.');
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      productName: item.product.name,
      quantity: item.quantity,
      tenureMonths: item.tenureMonths,
      monthlyRent: item.monthlyRent,
      securityDeposit: item.securityDeposit
    }));

    const longestTenure = Math.max(...orderItems.map((item) => item.tenureMonths));
    const startDate = deliveryDate;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + longestTenure);
    const decrementedItems = [];
    let order;

    try {
      for (const item of orderItems) {
        const result = await Product.updateOne(
          { _id: item.product, status: 'active', availableStock: { $gte: item.quantity } },
          { $inc: { availableStock: -item.quantity } }
        );

        if (result.modifiedCount !== 1) {
          throw createHttpError(409, 'Some cart items are no longer available. Please review your cart.');
        }

        decrementedItems.push(item);
      }

      order = await Order.create({
        orderNumber: createNumber('ORD'),
        user: request.user._id,
        items: orderItems,
        deliveryAddress,
        deliveryDate,
        monthlyTotal: cart.monthlyTotal,
        depositTotal: cart.depositTotal,
        deliveryFee: Number(request.body.deliveryFee || 0),
        paymentStatus: 'pending',
        status: 'placed',
        notes: request.body.notes ? String(request.body.notes).trim() : ''
      });

      const rental = await Rental.create({
        rentalNumber: createNumber('RNT'),
        order: order._id,
        user: request.user._id,
        items: orderItems.map((item) => ({
          product: item.product,
          productName: item.productName,
          quantity: item.quantity,
          monthlyRent: item.monthlyRent,
          securityDeposit: item.securityDeposit
        })),
        startDate,
        endDate,
        nextBillingDate: startDate,
        monthlyTotal: cart.monthlyTotal,
        depositTotal: cart.depositTotal,
        status: 'active'
      });

      cart.items = [];
      cart.monthlyTotal = 0;
      cart.depositTotal = 0;
      await cart.save();

      response.status(201).json({ data: { order, rental } });
    } catch (error) {
      if (decrementedItems.length) {
        await Promise.all(
          decrementedItems.map((item) => Product.updateOne({ _id: item.product }, { $inc: { availableStock: item.quantity } }))
        );
      }
      if (order?._id) await Order.deleteOne({ _id: order._id });
      throw error;
    }
  })
);

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const data = await Order.find({ user: request.user._id }).sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

router.get(
  '/:id',
  asyncHandler(async (request, response) => {
    const order = await Order.findOne({ _id: request.params.id, user: request.user._id }).lean();
    if (!order) throw createHttpError(404, 'Order not found.');
    response.json({ data: order });
  })
);

module.exports = router;
