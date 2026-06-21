const { createApp } = require('./app');
const { connectDatabase } = require('./config/db');
const { validateEnvironment } = require('./config/env');

const port = Number(process.env.PORT || 5000);

async function start() {
  validateEnvironment();

  const dbState = await connectDatabase();
  const app = createApp({ dbState });

  app.listen(port, () => {
    console.log(`RentEase API running on http://localhost:${port}`);
    console.log(`Database mode: ${dbState.mode}`);
  });
}

start().catch((error) => {
  console.error('Unable to start RentEase API.');
  console.error(error);
  process.exit(1);
});
