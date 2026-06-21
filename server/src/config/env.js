function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function looksLikePlaceholder(value) {
  return /replace|change-me|placeholder|example|secret-here|use-a-unique/i.test(String(value || ''));
}

function validateEnvironment({ requireDatabase = true } = {}) {
  const errors = [];
  const jwtSecret = process.env.JWT_SECRET;
  const corsOrigin = process.env.CORS_ORIGIN || process.env.CLIENT_URL;

  if (requireDatabase && isProduction() && !process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required when NODE_ENV=production.');
  }

  if (isProduction() && !corsOrigin) {
    errors.push('CORS_ORIGIN or CLIENT_URL is required when NODE_ENV=production.');
  }

  if (!jwtSecret && isProduction()) {
    errors.push('JWT_SECRET is required when NODE_ENV=production.');
  }

  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long.');
  }

  if (jwtSecret && looksLikePlaceholder(jwtSecret)) {
    errors.push('JWT_SECRET must not be a placeholder value.');
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (secret) return secret;

  if (isProduction()) {
    throw new Error('JWT_SECRET is required when NODE_ENV=production.');
  }

  return 'rentease-development-only-jwt-secret-never-use-in-production';
}

module.exports = {
  getJwtSecret,
  isProduction,
  validateEnvironment
};
