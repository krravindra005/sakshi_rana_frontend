# Frontend Mock Data Audit

This document classifies every mock data file and mock service layer in the frontend repository after completing the Laravel API V2 integration.

| File / Mock Source | Original Purpose | Classification | Resolution |
|---|---|---|---|
| `src/data/mock-ads.ts` | Static advertisement listings array | REPLACE WITH API | Removed active usage in production code; replaced by `GET /api/v2/ads` and `GET /api/v2/search/ads`. Kept as test fallback fixture only. |
| `src/data/mock-categories.ts` | Static categories & subcategories tree | REPLACE WITH API | Replaced by dynamic calls to `GET /api/v2/categories`. |
| `src/data/mock-locations.ts` | Static countries, states, cities, areas | REPLACE WITH API | Replaced by dynamic calls to `GET /api/v2/locations/*`. |
| `src/data/mock-filters.ts` | Static filter definitions and option values | REPLACE WITH API | Replaced by dynamic calls to `GET /api/v2/categories/{slug}/filters`. |
| `src/services/auth.service.ts` | Simulated login/register | REPLACE WITH API | Connected to `POST /api/v2/auth/login`, `POST /api/v2/auth/register`, `GET /api/v2/auth/me`. |
| `src/services/wallet.service.ts` | In-memory balance calculation | REPLACE WITH API | Balance retrieved directly from `GET /api/v2/wallet` and transactions from `GET /api/v2/wallet/transactions`. |
| `src/services/favorites.service.ts` | LocalStorage array | REPLACE WITH API | Favorites persisted on server via `GET/POST/DELETE /api/v2/favorites`. |
| `src/services/payments.service.ts` | Simulated payment delay | REPLACE WITH API | Connected to `POST /api/v2/payments/orders` (Razorpay integration). |
| `src/services/promotions.service.ts` | Hardcoded promotion packages | REPLACE WITH API | Connected to `GET /api/v2/promotion-products` and `POST /api/v2/ads/{ad}/promotions`. |
| `src/services/reports.service.ts` | Console log simulation | REPLACE WITH API | Connected to `POST /api/v2/ads/{ad}/reports`. |
| `src/services/notifications.service.ts` | Static notification list | REPLACE WITH API | Connected to `GET /api/v2/notifications` and `POST /api/v2/notifications/read-all`. |
| `src/services/admin.service.ts` | Static dashboard numbers | REPLACE WITH API | Connected to `GET /api/v2/admin/dashboard`, `GET /api/v2/admin/users`, `GET /api/v2/admin/ads`. |
