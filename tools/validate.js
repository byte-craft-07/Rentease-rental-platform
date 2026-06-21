const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'WEBSITE_IDEA.md',
  'README.md',
  'docs/PROJECT_REQUIREMENTS.md',
  'docs/TECHNICAL_DOCUMENTATION.md',
  'docs/DATABASE_DESIGN.md',
  'docs/DESIGN_SYSTEM.md',
  'docs/PRODUCT_SCOPE.md',
  'docs/ROUTE_MAP.md',
  'docs/IMPLEMENTATION_PLAN.md',
  'resources/content/content-outline.md',
  'client/index.html',
  'client/vite.config.js',
  'client/src/App.jsx',
  'client/src/main.jsx',
  'client/src/api/client.js',
  'client/src/styles.css',
  'preview/rentease-warm-lifestyle-preview.html',
  'preview/rentease-urban-preview.html',
  'server/src/app.js',
  'server/src/index.js',
  'server/src/config/db.js',
  'server/src/config/env.js',
  'server/src/data/seedData.js',
  'client/vite.config.js',
  'server/src/middleware/auth.js',
  'server/src/middleware/errorHandler.js',
  'server/src/middleware/notFound.js',
  'server/src/models/AdminAuditLog.js',
  'server/src/models/AdminReport.js',
  'server/src/models/Cart.js',
  'server/src/models/Category.js',
  'server/src/models/DamageClaim.js',
  'server/src/models/MaintenanceRequest.js',
  'server/src/models/Order.js',
  'server/src/models/Product.js',
  'server/src/models/Rental.js',
  'server/src/models/ServiceArea.js',
  'server/src/models/User.js',
  'server/src/models/index.js',
  'server/src/routes/admin.js',
  'server/src/routes/auth.js',
  'server/src/routes/cart.js',
  'server/src/routes/categories.js',
  'server/src/routes/maintenance.js',
  'server/src/routes/orders.js',
  'server/src/routes/products.js',
  'server/src/routes/rentals.js',
  'server/src/utils/asyncHandler.js',
  'server/src/utils/auth.js',
  'server/src/utils/httpError.js',
  'server/src/utils/validators.js',
  'tools/preview-server.js',
  'tools/seed-db.js',
  'tools/smoke-test.js',
  '.env.example',
  'package.json'
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
}

const idea = fs.existsSync(path.join(root, 'WEBSITE_IDEA.md'))
  ? fs.readFileSync(path.join(root, 'WEBSITE_IDEA.md'), 'utf8')
  : '';

[
  'User registration and login',
  'Product catalog',
  'Cart and checkout',
  'Active rental management',
  'Maintenance support',
  'Admin and vendor dashboard',
  'Theme 2: Warm Lifestyle Comfort',
  'MERN'
].forEach((marker) => {
  if (!idea.includes(marker)) failures.push(`Requirement missing from WEBSITE_IDEA.md: ${marker}`);
});

const design = fs.existsSync(path.join(root, 'docs/DESIGN_SYSTEM.md'))
  ? fs.readFileSync(path.join(root, 'docs/DESIGN_SYSTEM.md'), 'utf8')
  : '';

[
  '#FAF6EF',
  '#FFFDF8',
  '#2F241F',
  '#C56A3D',
  '#7A8B5A'
].forEach((marker) => {
  if (!design.includes(marker)) failures.push(`Design system missing selected theme marker: ${marker}`);
});

[
  'server/src/app.js',
  'server/src/index.js',
  'server/src/config/db.js',
  'server/src/config/env.js',
  'server/src/data/seedData.js',
  'server/src/middleware/auth.js',
  'server/src/middleware/errorHandler.js',
  'server/src/middleware/notFound.js',
  'server/src/models/AdminAuditLog.js',
  'server/src/models/AdminReport.js',
  'server/src/models/Cart.js',
  'server/src/models/Category.js',
  'server/src/models/DamageClaim.js',
  'server/src/models/MaintenanceRequest.js',
  'server/src/models/Order.js',
  'server/src/models/Product.js',
  'server/src/models/Rental.js',
  'server/src/models/ServiceArea.js',
  'server/src/models/User.js',
  'server/src/models/index.js',
  'server/src/routes/admin.js',
  'server/src/routes/auth.js',
  'server/src/routes/cart.js',
  'server/src/routes/categories.js',
  'server/src/routes/maintenance.js',
  'server/src/routes/orders.js',
  'server/src/routes/products.js',
  'server/src/routes/rentals.js',
  'server/src/utils/asyncHandler.js',
  'server/src/utils/auth.js',
  'server/src/utils/httpError.js',
  'server/src/utils/validators.js',
  'tools/preview-server.js',
  'tools/seed-db.js',
  'tools/smoke-test.js'
].forEach((file) => {
  try {
    require('child_process').execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
  } catch (error) {
    failures.push(`JavaScript syntax check failed for ${file}: ${error.message}`);
  }
});

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Validation passed: clean RentEase requirements base is ready.');
