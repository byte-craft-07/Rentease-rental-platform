const fs = require('fs');
const path = require('path');
const { createApp } = require('../server/src/app');

async function main() {
  const app = createApp({ dbState: { mode: 'smoke-test' } });
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const health = await fetch(`${baseUrl}/api/health`).then((response) => response.json());
    if (!health.ok || health.service !== 'rentease-api' || health.stack !== 'MERN') {
      throw new Error('Health endpoint returned an unexpected payload.');
    }

    const routes = await fetch(`${baseUrl}/api/routes`).then((response) => response.json());
    const requiredRoutes = ['/api/auth', '/api/products', '/api/cart', '/api/orders', '/api/rentals', '/api/admin'];
    for (const route of requiredRoutes) {
      if (!routes.data.includes(route)) throw new Error(`Route manifest missing ${route}.`);
    }

    const products = await fetch(`${baseUrl}/api/products`).then((response) => response.json());
    if (!Array.isArray(products.data)) {
      throw new Error('Products endpoint did not return a data array.');
    }

    const clientIndexPath = path.resolve(__dirname, '../dist/client/index.html');
    if (fs.existsSync(clientIndexPath)) {
      const deepLink = await fetch(`${baseUrl}/products/smoke-test-product`);
      const html = await deepLink.text();
      if (!deepLink.ok || !html.includes('<div id="root">')) {
        throw new Error('Frontend deep-link fallback did not return the React app shell.');
      }
    }

    console.log('Smoke test passed: API health, route manifest, public product endpoint, and available frontend deep-link fallback are healthy.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
