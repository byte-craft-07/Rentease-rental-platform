const express = require('express');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/httpError');
const { isMongoConnected } = require('../config/db');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (request, response) => {
    if (!isMongoConnected()) {
      response.json({ data: [], meta: { mode: 'no-db' } });
      return;
    }

    const query = { status: 'active' };
    if (request.query.type) query.type = request.query.type;
    if (request.query.city) query.serviceCities = request.query.city;
    if (request.query.q) query.$text = { $search: request.query.q };

    const data = await Product.find(query).populate('category', 'name slug type').sort({ monthlyRent: 1 }).lean();
    response.json({ data });
  })
);

router.get(
  '/:idOrSlug',
  asyncHandler(async (request, response) => {
    if (!isMongoConnected()) {
      throw createHttpError(503, 'Product details require MongoDB connection.');
    }

    const idOrSlug = request.params.idOrSlug;
    const query = /^[a-f\d]{24}$/i.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
    const product = await Product.findOne({ ...query, status: 'active' }).populate('category', 'name slug type').lean();

    if (!product) throw createHttpError(404, 'Product not found.');

    response.json({ data: product });
  })
);

module.exports = router;
