const express = require('express');
const Category = require('../models/Category');
const { asyncHandler } = require('../utils/asyncHandler');
const { isMongoConnected } = require('../config/db');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (request, response) => {
    if (!isMongoConnected()) {
      response.json({ data: [], meta: { mode: 'no-db' } });
      return;
    }

    const data = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
    response.json({ data });
  })
);

module.exports = router;
