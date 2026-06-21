const express = require('express');
const Rental = require('../models/Rental');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/httpError');
const { validateObjectId } = require('../utils/validators');

const router = express.Router();

router.use(requireAuth);

function validateFutureDate(value, field) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw createHttpError(400, `Enter a valid ${field}.`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) throw createHttpError(400, `${field} cannot be in the past.`);

  return date;
}

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const query = { user: request.user._id };
    if (request.query.status) query.status = request.query.status;

    const data = await Rental.find(query).sort({ createdAt: -1 }).lean();
    response.json({ data });
  })
);

router.patch(
  '/:id/extend',
  asyncHandler(async (request, response) => {
    const rentalId = validateObjectId(request.params.id, 'rental id');
    const months = Math.max(1, Number(request.body.months || 1));
    const rental = await Rental.findOne({ _id: rentalId, user: request.user._id });
    if (!rental) throw createHttpError(404, 'Rental not found.');
    if (!['active', 'extended'].includes(rental.status)) {
      throw createHttpError(409, 'Only active rentals can be extended.');
    }

    rental.endDate.setMonth(rental.endDate.getMonth() + months);
    rental.status = 'extended';
    await rental.save();

    response.json({ data: rental });
  })
);

router.patch(
  '/:id/return',
  asyncHandler(async (request, response) => {
    const rentalId = validateObjectId(request.params.id, 'rental id');
    const rental = await Rental.findOne({ _id: rentalId, user: request.user._id });
    if (!rental) throw createHttpError(404, 'Rental not found.');
    if (!['active', 'extended'].includes(rental.status)) {
      throw createHttpError(409, 'Only active rentals can be returned.');
    }

    rental.status = 'return_requested';
    rental.returnRequest = {
      requestedAt: new Date(),
      preferredPickupDate: validateFutureDate(request.body.preferredPickupDate, 'preferred pickup date'),
      reason: request.body.reason ? String(request.body.reason).trim() : '',
      status: 'requested'
    };
    await rental.save();

    response.json({ data: rental });
  })
);

module.exports = router;
