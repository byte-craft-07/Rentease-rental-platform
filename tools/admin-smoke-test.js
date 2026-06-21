const mongoose = require('mongoose');
const { createApp } = require('../server/src/app');
const { connectDatabase } = require('../server/src/config/db');

async function expectJson(response, label) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${label} failed with ${response.status}: ${payload.message || 'Unexpected response.'}`);
  }

  return payload;
}

async function main() {
  const dbState = await connectDatabase();
  const app = createApp({ dbState });
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    const login = await expectJson(
      await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@rentease.local',
          password: 'Admin@12345'
        })
      }),
      'Admin login'
    );

    const authHeaders = {
      Accept: 'application/json',
      Authorization: `Bearer ${login.data.token}`
    };

    const checks = [
      ['Admin products', '/admin/products'],
      ['Admin users', '/admin/users'],
      ['Admin orders', '/admin/orders'],
      ['Admin rentals', '/admin/rentals'],
      ['Admin service areas', '/admin/service-areas'],
      ['Admin damage claims', '/admin/damage-claims'],
      ['Admin audit logs', '/admin/audit-logs'],
      ['Admin overview', '/admin/overview']
    ];

    for (const [label, path] of checks) {
      const payload = await expectJson(await fetch(`${baseUrl}${path}`, { headers: authHeaders }), label);
      if (payload.data === undefined) throw new Error(`${label} did not return a data property.`);
    }

    console.log('Admin smoke test passed: protected admin products, users, orders, rentals, service areas, damage claims, audit logs, and overview endpoints are healthy.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
