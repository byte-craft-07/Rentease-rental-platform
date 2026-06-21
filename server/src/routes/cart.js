const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/httpError');
const { validateObjectId } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

function calculateCart(cart) {
  cart.monthlyTotal = cart.items.reduce((sum, item) => sum + item.monthlyRent * item.quantity, 0);
  cart.depositTotal = cart.items.reduce((sum, item) => sum + item.securityDeposit * item.quantity, 0);
  return cart;
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function rentForTenure(product, tenureMonths) {
  const tenureOption = product.tenureOptions.find((option) => option.months === tenureMonths);
  return tenureOption?.monthlyRent || product.monthlyRent;
}

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const cart = await getOrCreateCart(request.user._id);
    await cart.populate('items.product', 'name slug images type monthlyRent securityDeposit availableStock');
    response.json({ data: cart });
  })
);

router.post(
  '/items',
  asyncHandler(async (request, response) => {
    const productId = validateObjectId(request.body.productId, 'productId');
    const quantity = Math.max(1, Number(request.body.quantity || 1));
    const tenureMonths = Math.max(1, Number(request.body.tenureMonths || 3));
    const product = await Product.findOne({ _id: productId, status: 'active' });

    if (!product) throw createHttpError(404, 'Product not found.');
    if (product.availableStock < quantity) throw createHttpError(409, 'Requested quantity is not available.');

    const cart = await getOrCreateCart(request.user._id);
    const existing = cart.items.find((item) => String(item.product) === String(product._id));
    const monthlyRent = rentForTenure(product, tenureMonths);

    if (existing) {
      existing.quantity = quantity;
      existing.tenureMonths = tenureMonths;
      existing.monthlyRent = monthlyRent;
      existing.securityDeposit = product.securityDeposit;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        tenureMonths,
        monthlyRent,
        securityDeposit: product.securityDeposit
      });
    }

    calculateCart(cart);
    await cart.save();
    await cart.populate('items.product', 'name slug images type monthlyRent securityDeposit availableStock');

    response.status(201).json({ data: cart });
  })
);

router.patch(
  '/items/:itemId',
  asyncHandler(async (request, response) => {
    const itemId = validateObjectId(request.params.itemId, 'itemId');
    const cart = await getOrCreateCart(request.user._id);
    const item = cart.items.id(itemId);
    if (!item) throw createHttpError(404, 'Cart item not found.');

    if (request.body.quantity !== undefined) {
      const quantity = Math.max(1, Number(request.body.quantity));
      const product = await Product.findById(item.product);
      if (!product || product.status !== 'active') throw createHttpError(404, 'Product not found.');
      if (product.availableStock < quantity) throw createHttpError(409, 'Requested quantity is not available.');
      item.quantity = quantity;
    }
    if (request.body.tenureMonths !== undefined) {
      const product = await Product.findById(item.product);
      if (!product || product.status !== 'active') throw createHttpError(404, 'Product not found.');
      item.tenureMonths = Math.max(1, Number(request.body.tenureMonths));
      item.monthlyRent = product ? rentForTenure(product, item.tenureMonths) : item.monthlyRent;
    }

    calculateCart(cart);
    await cart.save();
    await cart.populate('items.product', 'name slug images type monthlyRent securityDeposit availableStock');

    response.json({ data: cart });
  })
);

router.delete(
  '/items/:itemId',
  asyncHandler(async (request, response) => {
    const itemId = validateObjectId(request.params.itemId, 'itemId');
    const cart = await getOrCreateCart(request.user._id);
    const item = cart.items.id(itemId);
    if (!item) throw createHttpError(404, 'Cart item not found.');

    item.deleteOne();
    calculateCart(cart);
    await cart.save();
    await cart.populate('items.product', 'name slug images type monthlyRent securityDeposit availableStock');

    response.json({ data: cart });
  })
);

router.delete(
  '/',
  asyncHandler(async (request, response) => {
    const cart = await getOrCreateCart(request.user._id);
    cart.items = [];
    calculateCart(cart);
    await cart.save();
    response.json({ data: cart });
  })
);

module.exports = router;
