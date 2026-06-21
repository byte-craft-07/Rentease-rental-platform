const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const authRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const rentalsRouter = require('./routes/rentals');
const maintenanceRouter = require('./routes/maintenance');
const adminRouter = require('./routes/admin');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

function resolveCorsOrigin() {
  const allowedOrigins = (process.env.CLIENT_URL || process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!allowedOrigins.length) return true;

  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(Object.assign(new Error('Not allowed by CORS.'), { status: 403 }));
  };
}

function createApp({ dbState = { mode: 'unknown' } } = {}) {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: resolveCorsOrigin() }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (request, response) => {
    response.json({
      ok: true,
      service: 'rentease-api',
      stack: 'MERN',
      database: dbState.mode,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/routes', (request, response) => {
    response.json({
      data: [
        '/api/auth',
        '/api/categories',
        '/api/products',
        '/api/cart',
        '/api/orders',
        '/api/rentals',
        '/api/maintenance',
        '/api/admin'
      ]
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/rentals', rentalsRouter);
  app.use('/api/maintenance', maintenanceRouter);
  app.use('/api/admin', adminRouter);

  const clientDistPath = path.resolve(__dirname, '../../dist/client');
  const clientIndexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(clientIndexPath)) {
    app.use(express.static(clientDistPath));
    app.get(/^\/(?!api).*/, (request, response) => {
      response.sendFile(clientIndexPath);
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
