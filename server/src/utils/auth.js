const crypto = require('crypto');
const { getJwtSecret } = require('../config/env');

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function parseBase64url(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [algorithm, salt, storedHash] = String(passwordHash).split('$');
  if (algorithm !== 'pbkdf2' || !salt || !storedHash) return false;

  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const signature = crypto.createHmac('sha256', getJwtSecret()).update(`${encodedHeader}.${encodedBody}`).digest('base64url');

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyToken(token) {
  const [encodedHeader, encodedBody, signature] = String(token || '').split('.');
  if (!encodedHeader || !encodedBody || !signature) return null;

  const expectedSignature = crypto.createHmac('sha256', getJwtSecret()).update(`${encodedHeader}.${encodedBody}`).digest('base64url');
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  let payload;
  try {
    payload = JSON.parse(parseBase64url(encodedBody));
  } catch {
    return null;
  }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

function publicUser(user) {
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    status: user.status
  };
}

module.exports = {
  hashPassword,
  publicUser,
  signToken,
  verifyPassword,
  verifyToken
};
