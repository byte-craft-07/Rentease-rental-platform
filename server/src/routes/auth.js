const express = require('express');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { createHttpError } = require('../utils/httpError');
const { hashPassword, publicUser, signToken, verifyPassword } = require('../utils/auth');
const { validateLoginPayload, validateRegisterPayload } = require('../utils/validators');
const { requireAuth } = require('../middleware/auth');
const { isMongoConnected } = require('../config/db');

const router = express.Router();

router.post(
  '/register',
  asyncHandler(async (request, response) => {
    if (!isMongoConnected()) throw createHttpError(503, 'Registration requires MongoDB connection.');

    const payload = validateRegisterPayload(request.body);
    const existingUser = await User.findOne({ email: payload.email }).lean();
    if (existingUser) throw createHttpError(409, 'An account with this email already exists.');

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      city: payload.city,
      passwordHash: hashPassword(payload.password),
      role: 'customer'
    });

    response.status(201).json({
      data: {
        user: publicUser(user),
        token: signToken({ sub: String(user._id), role: user.role })
      }
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (request, response) => {
    if (!isMongoConnected()) throw createHttpError(503, 'Login requires MongoDB connection.');

    const payload = validateLoginPayload(request.body);
    const user = await User.findOne({ email: payload.email });

    if (!user || !verifyPassword(payload.password, user.passwordHash)) {
      throw createHttpError(401, 'Invalid email or password.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    response.json({
      data: {
        user: publicUser(user),
        token: signToken({ sub: String(user._id), role: user.role })
      }
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json({ data: { user: publicUser(request.user) } });
  })
);

module.exports = router;
