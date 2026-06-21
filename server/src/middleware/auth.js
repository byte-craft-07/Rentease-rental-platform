const User = require('../models/User');
const { createHttpError } = require('../utils/httpError');
const { verifyToken } = require('../utils/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { isMongoConnected } = require('../config/db');

const requireAuth = asyncHandler(async (request, response, next) => {
  if (!isMongoConnected()) throw createHttpError(503, 'Authentication requires MongoDB connection.');

  const header = request.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = verifyToken(token);

  if (!payload?.sub) throw createHttpError(401, 'Login required.');

  const user = await User.findById(payload.sub).lean();
  if (!user || user.status !== 'active') throw createHttpError(401, 'Login required.');

  request.user = user;
  next();
});

function allowRoles(...roles) {
  return (request, response, next) => {
    if (!request.user) {
      next(createHttpError(401, 'Login required.'));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(createHttpError(403, 'You do not have permission for this action.'));
      return;
    }

    next();
  };
}

module.exports = {
  allowRoles,
  requireAuth
};
