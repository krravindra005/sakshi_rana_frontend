# Next.js Frontend Integration Audit

This audit document maps all existing frontend services, mock data stores, and UI pages to the real Laravel REST API V2 endpoints.

| Module | Current Implementation | Mock/Real | Laravel Endpoint | Status |
|---|---|---|---|---|
| **Authentication** | `src/services/auth.service.ts` + localStorage | Mock / Local fallback | `POST /api/v2/auth/register`<br>`POST /api/v2/auth/login`<br>`POST /api/v2/auth/logout`<br>`GET /api/v2/auth/me` | PENDING INTEGRATION |
| **Categories** | `src/services/categories.service.ts` + `mock-categories.ts` | Static JSON | `GET /api/v2/categories`<br>`GET /api/v2/categories/{slug}` | PENDING INTEGRATION |
| **Locations** | `src/services/locations.service.ts` + `mock-locations.ts` | Static JSON | `GET /api/v2/locations/countries`<br>`GET /api/v2/locations/regions`<br>`GET /api/v2/locations/cities`<br>`GET /api/v2/locations/areas` | PENDING INTEGRATION |
| **Dynamic Filters** | `src/services/filters.service.ts` + `mock-filters.ts` | Static JSON | `GET /api/v2/categories/{slug}/filters`<br>`GET /api/v2/filters/{filter}/options` | PENDING INTEGRATION |
| **Advertisements** | `src/services/ads.service.ts` + `mock-ads.ts` | Static Array | `GET /api/v2/ads`<br>`GET /api/v2/ads/{slug}`<br>`POST /api/v2/ads`<br>`GET /api/v2/me/ads`<br>`POST /api/v2/ads/{id}/submit` | PENDING INTEGRATION |
| **Search & Count** | `src/services/search.service.ts` | In-memory JS filter | `GET /api/v2/search/ads`<br>`GET /api/v2/search/ads/count` | PENDING INTEGRATION |
| **Favorites** | `src/services/favorites.service.ts` | localStorage | `GET /api/v2/favorites`<br>`POST /api/v2/favorites/{ad}`<br>`DELETE /api/v2/favorites/{ad}` | PENDING INTEGRATION |
| **Media Upload** | Ad Form File Upload | Simulated | `POST /api/v2/media`<br>`DELETE /api/v2/media/{id}` | PENDING INTEGRATION |
| **Promotions** | `src/services/promotions.service.ts` | Static Array | `GET /api/v2/promotion-products`<br>`POST /api/v2/ads/{ad}/promotions` | PENDING INTEGRATION |
| **Wallet** | `src/services/wallet.service.ts` | In-memory Balance | `GET /api/v2/wallet`<br>`GET /api/v2/wallet/transactions` | PENDING INTEGRATION |
| **Payments** | `src/services/payments.service.ts` | Simulated Delay | `POST /api/v2/payments/orders`<br>`GET /api/v2/payments/{id}` | PENDING INTEGRATION |
| **Reports** | `src/services/reports.service.ts` | Simulated Log | `POST /api/v2/ads/{ad}/reports`<br>`POST /api/v2/users/{user}/reports` | PENDING INTEGRATION |
| **Notifications** | `src/services/notifications.service.ts` | Static Array | `GET /api/v2/notifications`<br>`POST /api/v2/notifications/read-all` | PENDING INTEGRATION |
| **Admin Panel** | `src/services/admin.service.ts` | Mock Metrics | `GET /api/v2/admin/dashboard`<br>`GET /api/v2/admin/ads`<br>`POST /api/v2/admin/ads/{id}/approve`<br>`GET /api/v2/admin/reports` | PENDING INTEGRATION |
| **SEO Metadata** | Component Hardcoded | Static String | `GET /api/v2/landing-pages/category/{category}` | PENDING INTEGRATION |
