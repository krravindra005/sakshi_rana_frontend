# Backend Integration Checklist & Guide

This checklist is designed for developers transitioning the marketplace frontend to a real Laravel backend. It details every module, the required REST APIs, and which specific frontend pages/components depend on it.

## 1. Authentication API
- [ ] Implement `POST /api/auth/register`
- [ ] Implement `POST /api/auth/login`
- [ ] Implement `POST /api/auth/logout`
- [ ] Implement `POST /api/auth/forgot-password`
- [ ] Implement `POST /api/auth/reset-password`
- [ ] Implement `POST /api/auth/email/resend`
- [ ] Implement `GET /api/auth/email/verify`
- [ ] Implement `GET /api/auth/me`
- **Dependent Frontend Pages & Components**:
  - `Header.tsx` (Sign In button, current user profile card, logout handler)
  - `AuthPage.tsx` (Login, Register, and Verification workflows)
  - `App.tsx` (Authentication gate / protected routes)

## 2. User Profile API
- [ ] Implement `PUT /api/user/profile` (update personal info)
- [ ] Implement `POST /api/user/avatar` (avatar photo upload)
- **Dependent Frontend Pages & Components**:
  - `UserDashboard.tsx` -> `ProfileTab` (updating profile details, setting custom phone numbers)

## 3. Categories API
- [ ] Implement `GET /api/categories` (get list of all categories)
- [ ] Implement `GET /api/categories/{slug}` (get category details by slug)
- **Dependent Frontend Pages & Components**:
  - `Header.tsx` (Mega Category Dropdown list)
  - `CategoryGrid.tsx` (Homepage grid and category select)
  - `HeroSearch.tsx` (Dropdown for quick category search)
  - `PostAdWizard.tsx` (First step category select)
  - `ListingGrid.tsx` (Faceted listing page header and title resolution)

## 4. Locations API
- [ ] Implement `GET /api/locations/countries`
- [ ] Implement `GET /api/locations/regions?country_id=`
- [ ] Implement `GET /api/locations/cities?region_id=`
- [ ] Implement `GET /api/locations/areas?city_id=`
- **Dependent Frontend Pages & Components**:
  - `Header.tsx` (City selecting dropdown list)
  - `HeroSearch.tsx` (Location selectors)
  - `CityBrowse.tsx` (Homepage browse grid)
  - `PostAdWizard.tsx` (Location cascade selection during post form)
  - `ListingGrid.tsx` (Location header and city-specific seo text resolution)

## 5. Dynamic Filters API
- [ ] Implement `GET /api/filters?category_id=`
- [ ] Implement `GET /api/filters/{id}/options`
- **Dependent Frontend Pages & Components**:
  - `AdvancedSearchModal.tsx` (Renders sidebar query facets dynamically depending on selected category)
  - `ListingGrid.tsx` (Renders filters corresponding to current categories)

## 6. Advertisement CRUD
- [ ] Implement `GET /api/ads`
- [ ] Implement `GET /api/ads/{slug}`
- [ ] Implement `POST /api/ads` (Create)
- [ ] Implement `PATCH /api/ads/{id}` (Update)
- [ ] Implement `DELETE /api/ads/{id}` (Delete)
- [ ] Implement status toggle APIs (`/publish`, `/pause`, `/republish`)
- **Dependent Frontend Pages & Components**:
  - `ListingDetail.tsx` (Detailed view of a companion profile, contact details, gallery)
  - `PostAdWizard.tsx` (Creating/publishing new profiles)
  - `UserDashboard.tsx` -> `MyAdsTab` (Listing active/pending ads, publishing draft, pausing, editing, or deleting listings)
  - `LatestAds.tsx` & `FeaturedAds.tsx` (Homepage sections)

## 7. Image Upload
- [ ] Implement `POST /api/media/upload` (handling multipart file uploads, checking dimensions, and returning URLs)
- **Dependent Frontend Pages & Components**:
  - `PostAdWizard.tsx` -> `PhotoUploadStep` (handles drag and drop or manual selection of companion photos)

## 8. Search API
- [ ] Implement `GET /api/search/ads` (highly-performant query handler supporting keywords, locations, categories, dynamic attributes, sorting, and pagination)
- **Dependent Frontend Pages & Components**:
  - `ListingGrid.tsx` (The main search results page with filters and lists)
  - `HeroSearch.tsx` (Direct navigation to specific search results)
  - `AdvancedSearchModal.tsx` (Detailed keyword search)

## 9. Favorites
- [ ] Implement `GET /api/favorites`
- [ ] Implement `POST /api/favorites/{adId}`
- [ ] Implement `DELETE /api/favorites/{adId}`
- **Dependent Frontend Pages & Components**:
  - `ListingDetail.tsx` (Heart toggle on main page)
  - `UserDashboard.tsx` -> `FavoritesTab` (Showing collections of saved companion advertisements)

## 10. Reports
- [ ] Implement `POST /api/ads/{adId}/reports`
- **Dependent Frontend Pages & Components**:
  - `ListingDetail.tsx` -> `ReportModal` (Flags false or underage profiles directly to trust desk)
  - `SafetyGuide.tsx` (Report abuse shortcut)

## 11. Moderation
- [ ] Implement Admin panel controls to manage list moderation statuses (`pending`, `approved`, `rejected`, `changes_requested`)
- **Dependent Frontend Pages & Components**:
  - `UserDashboard.tsx` (Renders warning blocks when advertisements are pending review or require changes)

## 12. Promotions
- [ ] Implement `GET /api/promotions` (pricing list)
- [ ] Implement `POST /api/ads/{adId}/promotions` (purchase/apply promotion)
- **Dependent Frontend Pages & Components**:
  - `UserDashboard.tsx` -> `MyAdsTab` / `WalletTab` (Select promotional boosts like Featured or VIP highlight)

## 13. Wallet
- [ ] Implement `GET /api/wallet`
- [ ] Implement `GET /api/wallet/transactions` (history list)
- **Dependent Frontend Pages & Components**:
  - `Header.tsx` (Balance display in profile dropdown)
  - `UserDashboard.tsx` -> `WalletTab` (Deposit credits, show past transactions, promotion invoices)

## 14. Payments
- [ ] Implement `POST /api/payments/create-order`
- **Dependent Frontend Pages & Components**:
  - `UserDashboard.tsx` -> `WalletTab` (Triggering top-ups and credit gateways)

## 15. Notifications
- [ ] Implement `GET /api/notifications`
- [ ] Implement `POST /api/notifications/{id}/read`
- **Dependent Frontend Pages & Components**:
  - `Header.tsx` / `UserDashboard.tsx` (Alert counts and reading notifications)
