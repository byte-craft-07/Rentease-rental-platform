# Technical Documentation

## Stack

RentEase will use the MERN stack:

- MongoDB for persistence.
- Express.js for REST APIs.
- React.js for the frontend.
- Node.js for the server runtime.

## Architecture

RentEase will use a React frontend and an Express REST API backed by MongoDB.

```text
React Client -> Express REST API -> MongoDB
```

## Backend Modules

- Authentication
- Users
- Categories
- Products
- Cart
- Checkout and orders
- Rentals
- Delivery and pickup scheduling
- Maintenance requests
- Service areas
- Damage claims and disputes
- Admin analytics
- Admin audit trail

## MongoDB Collections

- users
- categories
- products
- carts
- orders
- rentals
- maintenanceRequests
- serviceAreas
- damageClaims
- adminReports
- adminAuditLogs

Detailed schema notes live in [Database Design](DATABASE_DESIGN.md).

## REST API Groups

- `/api/auth`
- `/api/users`
- `/api/categories`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/rentals`
- `/api/maintenance`
- `/api/admin`
- `/api/service-areas`

## Backend Foundation Status

Implemented route groups:

- `/api/health`
- `/api/routes`
- `/api/auth`
- `/api/categories`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/rentals`
- `/api/maintenance`
- `/api/admin`

The backend uses shared Express middleware for CORS, Helmet, compression, JSON parsing, request logging, authentication, role authorization, 404 responses, and error handling.

## Frontend Pages

- Home
- Product catalog
- Product detail and rental plan estimator
- Cart and checkout
- My rentals with active contracts and rental history
- Maintenance and return support
- Admin dashboard
- Inventory management
- Order management
- Rental management
- Service area management
- Damage claim management
- Reports

Login and registration are implemented as a protected account modal so customers can sign in or create an account without losing catalog or checkout context.

## Frontend Foundation Status

Implemented:

- Vite React client under `client/`.
- Theme 2 Warm Lifestyle Comfort UI foundation.
- Route-based frontend pages for home, catalog, plans, cart/checkout, rentals, support, and admin.
- API-connected product and category browsing.
- API-backed sign-in and registration modal with local session persistence.
- City, category, and search filtering.
- Product plan estimate panel.
- Product detail controls for tenure and quantity.
- Authenticated cart add, update, remove, and refresh.
- Authenticated checkout that creates an order and rental through the API.
- Customer rentals dashboard with active contracts and historical rentals.
- Rental extension and return pickup request actions.
- Maintenance ticket creation with rental/product ownership validation.
- Recent maintenance ticket list.
- Role-gated admin/vendor dashboard.
- Admin KPI overview for rentals, MRR, utilization, pending orders, maintenance, and damage claims.
- Admin inventory monitoring with retire/reactivate actions.
- Admin orders, rentals, maintenance queue, reports, and user overview panels.
- Admin order workflow actions for confirm, schedule, delivered, completed, and cancelled states.
- Admin rental workflow actions for return pickup scheduling, returned, and cancelled states.
- Admin-only user activate/block controls.
- Admin audit trail panel for recent operator actions.
- Admin product create/edit form for pricing, stock, tenure options, imagery, status, and service coverage.
- Admin service area management with city onboarding and active/inactive controls.
- Admin damage claim review actions for under review, approved, rejected, and settled states.
- Maintenance queue status actions for assign, schedule, and resolve.
- Responsive customer-facing layout.
- Responsive admin layout with mobile-safe tables and stacked maintenance actions.
- Express production server can serve the built React client and preserve SPA deep links such as `/products/:slug`.

## Security Plan

- Passwords hashed with Node crypto or a dedicated hashing library.
- Token-based session flow.
- Role-based route protection.
- Server-side validation for every write endpoint.
- Environment variables for secrets and database URI.
- Production startup fails when required secrets are missing or placeholder secrets are used.
- Development seed data is blocked in `NODE_ENV=production` unless explicitly allowed for an intentional staging/admin operation.
- Payment readiness means checkout data is structured for future payment integration. Real payments should be enabled only after provider selection, settlement/refund flows, and compliance requirements are finalized.

## Deployment Plan

- Build React with Vite.
- Serve production client through Express or deploy static assets separately.
- Host backend on AWS.
- Use MongoDB Atlas or managed MongoDB.
- Store production secrets outside source control.
- Set `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, and `NODE_ENV=production` through the hosting environment.
