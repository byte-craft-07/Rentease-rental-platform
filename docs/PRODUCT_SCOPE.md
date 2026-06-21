# Product Scope

## Goal

Build a production-oriented RentEase web platform for furniture and appliance rentals. The first release should cover the complete customer rental journey and the operational admin/vendor workflows needed to serve a real city-level rental business.

## Release 1 Customer Flow

1. User registers or logs in.
2. User browses furniture and appliance categories.
3. User opens a product detail page.
4. User reviews monthly rent, security deposit, tenure options, availability, and delivery eligibility.
5. User adds products to cart.
6. User checks out by selecting tenure, delivery date, and delivery address.
7. User sees the created rental order.
8. User manages active rentals.
9. User requests maintenance support.
10. User views rental history.

## Release 1 Admin / Vendor Flow

1. Admin logs in.
2. Admin views dashboard KPIs.
3. Admin adds and edits product inventory.
4. Admin sets rent, deposit, stock, tenure options, and service city.
5. Admin monitors orders and active rentals.
6. Admin manages delivery and pickup schedules.
7. Admin handles maintenance requests.
8. Admin tracks returns, damages, and disputes.
9. Admin views reports.

## Release 1 Boundaries

- Online payment gateway integration is payment-ready but not enabled until a payment provider, settlement flow, refund policy, and compliance checklist are confirmed.
- Native mobile applications are planned for a later release.
- AI-based pricing is planned for a later release after enough inventory and demand data exists.
- Cross-border rentals are outside the current business model.
- Second-hand resale marketplace is outside the current business model.
- Logistics partner integration is deferred until the client confirms the delivery provider and API contract.

## Development Seed Data

- Furniture: bed, sofa, table, dining set, work desk, chair.
- Appliances: fridge, washing machine, TV, microwave.
- Service cities: Bengaluru, Pune, Hyderabad, Delhi NCR, Mumbai.
- Development-only customer, admin, and vendor accounts.
- Development-only active rental, maintenance request, and damage claim.

## Success Criteria

- Customer can complete catalog to checkout flow.
- Customer can see active rentals and request maintenance.
- Admin can manage inventory and monitor rental operations.
- MongoDB stores durable data for products, users, orders, rentals, and maintenance.
- Security-sensitive configuration fails fast in production when required secrets are missing.
- UI follows Theme 2: Warm Lifestyle Comfort.
