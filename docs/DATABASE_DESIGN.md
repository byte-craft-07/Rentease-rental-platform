# Database Design

RentEase uses MongoDB with Mongoose. The database is designed around rental marketplace operations: users browse products, add items to cart, place rental orders, manage rentals, request maintenance, and admins manage inventory, service areas, damages, and reports.

## Collections

### users

Stores customer, admin, and vendor/operator accounts.

Key fields:
- `name`
- `email`
- `phone`
- `passwordHash`
- `role`: `customer`, `admin`, `vendor`
- `addresses`
- `city`
- `status`

### categories

Stores product grouping such as furniture, appliances, bedroom, dining, work setup, and bundles.

Key fields:
- `name`
- `slug`
- `type`: `furniture`, `appliance`, `bundle`, `decor`
- `description`
- `imageUrl`
- `isActive`

### products

Stores rentable furniture and appliance inventory.

Key fields:
- `name`
- `slug`
- `category`
- `type`
- `monthlyRent`
- `securityDeposit`
- `tenureOptions`
- `stock`
- `availableStock`
- `serviceCities`
- `images`
- `specifications`
- `maintenanceIncluded`
- `status`

### carts

Stores one active cart per customer.

Key fields:
- `user`
- `items`
- `selectedCity`
- `deliveryAddress`
- `deliveryDate`
- `totals`

### orders

Stores checkout records and delivery/pickup scheduling.

Key fields:
- `orderNumber`
- `user`
- `items`
- `deliveryAddress`
- `deliveryDate`
- `paymentStatus`
- `status`
- `monthlyTotal`
- `depositTotal`

### rentals

Stores active and historical rental contracts created from orders.

Key fields:
- `rentalNumber`
- `order`
- `user`
- `items`
- `startDate`
- `endDate`
- `status`
- `monthlyTotal`
- `nextBillingDate`
- `returnRequest`

### maintenanceRequests

Stores customer support and repair requests.

Key fields:
- `ticketNumber`
- `user`
- `rental`
- `product`
- `type`
- `priority`
- `status`
- `description`
- `scheduledVisit`
- `resolution`

### serviceAreas

Stores delivery coverage and operating cities.

Key fields:
- `city`
- `state`
- `pincodes`
- `deliveryFee`
- `pickupFee`
- `isActive`

### damageClaims

Stores damage, return, and dispute cases.

Key fields:
- `claimNumber`
- `rental`
- `user`
- `product`
- `description`
- `claimAmount`
- `status`
- `evidence`

### adminReports

Stores optional cached analytics snapshots.

Key fields:
- `period`
- `metrics`
- `generatedBy`
- `generatedAt`

### adminAuditLogs

Stores admin and vendor action history for production accountability.

Key fields:
- `actor`
- `actorName`
- `actorRole`
- `action`
- `entityType`
- `entityId`
- `entityLabel`
- `metadata`

## Important Indexes

- `users.email` unique
- `users.phone` unique sparse
- `categories.slug` unique
- `products.slug` unique
- `products.category`
- `products.serviceCities`
- `orders.orderNumber` unique
- `rentals.rentalNumber` unique
- `maintenanceRequests.ticketNumber` unique
- `damageClaims.claimNumber` unique
- `serviceAreas.city` unique
- `adminAuditLogs.createdAt`
- `adminAuditLogs.actor`

## Development Seed Data

Use the repeatable seed script to populate a local MongoDB database:

```bash
npm.cmd run seed
```

The seed covers:
- development admin, vendor, and customer users
- product categories matching the selected Warm Lifestyle Comfort theme
- rentable furniture, appliances, decor, and bundle products
- service areas for Bengaluru, Pune, Hyderabad, Delhi NCR, and Mumbai
- customer cart, scheduled order, active rental, maintenance ticket, damage claim, and monthly admin KPI report

The seed script is not a production data migration. It refuses to run with `NODE_ENV=production` unless `ALLOW_PRODUCTION_SEED=true` is explicitly set for a controlled staging/admin operation.
