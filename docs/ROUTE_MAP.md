# Route and Page Map

## Frontend Routes

### Public

- `/` - Warm lifestyle homepage with customer catalog preview.
- `/catalog` - Product catalog with category and city filters.
- `/plans` - General product detail, price, deposit, tenure, availability, rental estimator, and add-to-cart action.
- `/products/:slug` - Dedicated product detail deep link for catalog items.
- Account modal - User login and registration.

### Customer

- `/checkout` - Cart items, quantity, tenure selection, deposit summary, delivery address, city, date, and order confirmation.
- `/rentals` - Active rentals, return pickup, maintenance tickets, and completed rental history.
- `/support` - Service workflow overview and support entry points.

### Admin / Vendor

- `/admin` - KPI dashboard, inventory management, orders, rentals, maintenance queue, service areas, damage claims, reports, and user management.

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products and Categories

- `GET /api/categories`
- `POST /api/admin/categories`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`

### Orders and Rentals

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `GET /api/rentals`
- `PATCH /api/rentals/:id/extend`
- `PATCH /api/rentals/:id/return`

### Maintenance

- `POST /api/maintenance`
- `GET /api/maintenance`
- `PATCH /api/admin/maintenance/:id`

### Admin

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`
- `GET /api/admin/rentals`
- `PATCH /api/admin/rentals/:id`
- `GET /api/admin/reports`
- `GET /api/admin/service-areas`
- `POST /api/admin/service-areas`
- `PATCH /api/admin/service-areas/:id`
- `GET /api/admin/damage-claims`
- `POST /api/admin/damage-claims`
- `PATCH /api/admin/damage-claims/:id`
- `GET /api/admin/audit-logs`
