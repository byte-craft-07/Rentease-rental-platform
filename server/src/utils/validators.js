const { createHttpError } = require('./httpError');

function requireFields(payload, fields) {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
  if (missing.length) {
    throw createHttpError(400, 'Required fields are missing.', { missing });
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function validateRegisterPayload(payload) {
  requireFields(payload, ['name', 'email', 'password']);
  if (!validateEmail(payload.email)) throw createHttpError(400, 'Enter a valid email address.');
  if (String(payload.password).length < 8) throw createHttpError(400, 'Password must be at least 8 characters.');

  return {
    name: String(payload.name).trim(),
    email: String(payload.email).trim().toLowerCase(),
    phone: payload.phone ? String(payload.phone).trim() : undefined,
    password: String(payload.password),
    city: payload.city ? String(payload.city).trim() : ''
  };
}

function validateLoginPayload(payload) {
  requireFields(payload, ['email', 'password']);
  if (!validateEmail(payload.email)) throw createHttpError(400, 'Enter a valid email address.');

  return {
    email: String(payload.email).trim().toLowerCase(),
    password: String(payload.password)
  };
}

function validateObjectId(id, field = 'id') {
  if (!/^[a-f\d]{24}$/i.test(String(id || ''))) {
    throw createHttpError(400, `Invalid ${field}.`);
  }
  return id;
}

function pickDefined(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
}

module.exports = {
  pickDefined,
  requireFields,
  validateLoginPayload,
  validateObjectId,
  validateRegisterPayload
};
