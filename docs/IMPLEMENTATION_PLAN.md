# Implementation Plan

## Phase 1 - Clean Requirements Base

- Remove previous landing-page-only work.
- Add full platform requirements.
- Add technical documentation.
- Add clean implementation plan.
- Lock MERN stack.
- Lock Theme 2: Warm Lifestyle Comfort.
- Define production-oriented product scope.
- Define frontend and backend route map.

## Phase 2 - Backend Foundation

- Create Express app structure. Done.
- Connect MongoDB. Done.
- Add shared middleware and validators. Done.
- Add role-aware auth utilities. Done.
- Add REST route groups for auth, products, cart, orders, rentals, maintenance, and admin. Done.

## Phase 3 - Data Models

- User: account, role, addresses, status. Done.
- Category: furniture/appliance/bundle/decor grouping. Done.
- Product: rentable inventory, pricing, deposit, tenure, service cities, stock. Done.
- Cart: active customer cart with delivery draft. Done.
- Order: checkout record and delivery schedule. Done.
- Rental: active and historical rental contract. Done.
- MaintenanceRequest: repair, replacement, inspection, pickup support. Done.
- ServiceArea: city and pincode delivery coverage. Done.
- DamageClaim: return and dispute claim tracking. Done.
- AdminReport: cached KPI snapshots. Done.

## Phase 4 - Customer APIs

- Auth. Done.
- Product browsing. Done.
- Cart. Done.
- Checkout. Done.
- Rentals. Done.
- Maintenance. Done.
- Rental history through the rentals API. Done.

## Phase 5 - Admin / Vendor APIs

- Inventory CRUD. Done.
- Pricing and tenure management. Done.
- Orders and rentals monitoring. Done.
- Order delivery status updates. Done.
- Rental return and cancellation status updates with inventory restore. Done.
- Maintenance queue. Done.
- Returns and damage claims. Done.
- Reports and KPIs. Done.
- Service area management. Done.
- Admin user status management. Done.
- Admin/vendor audit log API. Done.

## Phase 6 - Customer Frontend

- React + Vite client foundation. Done.
- Theme 2 customer homepage/catalog shell. Done.
- Route-based page navigation for home, catalog, plans, cart/checkout, rentals, support, and admin. Done.
- API-connected category and product browsing. Done.
- API-backed sign-in modal and local session state. Done.
- Product plan estimate panel. Done.
- API-backed product detail selection. Done.
- API-backed cart add/update/remove flow. Done.
- API-backed checkout form creating order and rental. Done.
- API-backed customer rentals dashboard. Done.
- Customer rental history section. Done.
- Rental extension and return request actions. Done.
- API-backed maintenance ticket creation and ticket list. Done.
- API-backed registration in the account modal. Done.
- Product detail and rental estimate experience in the plans route. Done.
- Dedicated product detail deep links under `/products/:slug`. Done.

## Phase 7 - Admin Frontend

- Role-gated admin/vendor dashboard shell. Done.
- KPI overview for active rentals, MRR, utilization, open maintenance, pending orders, and damage claims. Done.
- Inventory monitoring with retire/reactivate status actions. Done.
- Orders monitoring. Done.
- Rentals monitoring. Done.
- Maintenance queue with assign, schedule, and resolve actions. Done.
- Reports and user overview panels. Done.
- Order workflow actions for confirm, schedule, deliver, complete, and cancel. Done.
- Rental workflow actions for return pickup scheduling, returned, and cancelled states. Done.
- Admin-only user activate/block controls. Done.
- Audit trail panel for recent admin/vendor actions. Done.
- Service area management with add and activate/deactivate actions. Done.
- Product create/edit forms with pricing, stock, tenure, image, and city coverage fields. Done.
- Damage claim workflow actions for review, approve, reject, and settle. Done.

## Phase 8 - Seed Data, Validation, and Deployment

- Seed realistic development products, users, cart, order, rental, support ticket, damage claim, and admin report. Done.
- Add smoke tests. Done.
- Add production environment validation and seed safety guard. Done.
- Add AWS-ready build files.
- Serve built React app from Express with SPA fallback for production deep links. Done.
- Final documentation.
