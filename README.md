# RentEase

RentEase is a furniture and appliance rental platform for students and working professionals who relocate frequently and prefer monthly rentals over ownership.

This repository is being built as a production-oriented client project according to the full RentEase platform scope:

- Customer registration and login
- Product catalog for furniture and appliances
- Product details with dedicated deep links, rent, deposit, and tenure options
- Cart and checkout
- Delivery and pickup scheduling
- Active rental management
- Maintenance support requests
- Rental history
- Admin/vendor inventory, pricing, order, rental, audit trail, and report management
- AWS-ready deployment build

## Current Phase

The earlier landing-page-only work has been removed. The project is now aligned to the full rental-platform requirement with customer, admin, vendor, rental, maintenance, and reporting workflows.

See:

- [Project Requirements](docs/PROJECT_REQUIREMENTS.md)
- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Product Scope](docs/PRODUCT_SCOPE.md)
- [Route and Page Map](docs/ROUTE_MAP.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

## Selected Theme

The chosen visual direction is **Theme 2: Warm Lifestyle Comfort**.

Preview it locally:

```bash
npm.cmd run preview:theme
```

Then open:

```text
http://127.0.0.1:4174
```

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express.js
- API: REST
- Database: MongoDB with Mongoose
- Deployment target: AWS

## Local Environment

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/rentease
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=use-a-unique-32-plus-character-secret-per-environment
VITE_API_URL=http://localhost:5000/api
```

## Validate

```bash
npm.cmd run validate
```

## Frontend

Run the React customer frontend:

```bash
npm.cmd run dev:client
```

Then open:

```text
http://127.0.0.1:5173
```

Production build:

```bash
npm.cmd run build
```

Current frontend foundation includes route-based pages, API-backed catalog browsing, dedicated product detail URLs, customer registration and sign-in, cart management, checkout order creation, active rentals, rental history, return requests, extension actions, maintenance tickets, and a role-gated admin/vendor dashboard with KPI, product create/edit, inventory status, service area, damage claim, order workflow, rental return workflow, maintenance, audit trail, report, and admin user controls.

## Seed Development Data

Start MongoDB locally, confirm `.env` has `MONGODB_URI` and `JWT_SECRET`, then run:

```bash
npm.cmd run seed
```

This seeds development categories, service areas, products, users, cart, order, rental, maintenance ticket, damage claim, and admin KPI report.

The seed script refuses to run with `NODE_ENV=production` unless `ALLOW_PRODUCTION_SEED=true` is explicitly set for an intentional staging/admin operation.

Development accounts:

- Admin: `admin@rentease.local` / `Admin@12345`
- Vendor: `vendor@rentease.local` / `Vendor@12345`
- Customer: `aarav.customer@rentease.local` / `Customer@12345`

## Backend API

Run the Express API:

```bash
npm.cmd start
```

Useful endpoints:

- `GET /api/health`
- `GET /api/routes`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/categories`
- `GET /api/cart`
- `POST /api/orders`
- `GET /api/rentals`
- `POST /api/maintenance`
- `GET /api/admin/overview`
- `GET /api/admin/audit-logs`

Smoke test:

```bash
npm.cmd run smoke
```

Authenticated admin endpoint smoke test:

```bash
npm.cmd run smoke:admin
```
