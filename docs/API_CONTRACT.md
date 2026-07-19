# Future Laravel REST API Contract

This document outlines the API contract expected by the marketplace frontend. All endpoints must return JSON responses matching these specifications.

## Standard Enums & Unions

### AdvertisementStatus
- `draft`
- `pending`
- `published`
- `rejected`
- `paused`
- `expired`

### ModerationStatus
- `pending`
- `approved`
- `rejected`
- `changes_requested`

### VerificationStatus
- `unverified`
- `pending`
- `verified`

### TransactionType
- `credit` (deposit)
- `debit` (spend)
- `promotion` (refund or promo credits)
- `refund`

---

## Global API Response Formats

### Single Resource Response
All single resource responses must follow this structure:
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {
    "id": "item-101",
    "name": "Sample Name"
  }
}
```

### Paginated Collection Response
All collections or list views must support standard Laravel JSON resource pagination:
```json
{
  "success": true,
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 20,
    "total": 200
  }
}
```

### Laravel Validation Error Response (422 Unprocessable Entity)
When validation fails, return a 422 error with specific field validation messages:
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "title": [
      "The title field is required.",
      "The title must be at least 10 characters."
    ],
    "contact.phone": [
      "The phone format is invalid."
    ]
  }
}
```

---

## Endpoint Details

### 1. AUTH MODULE

#### `POST /api/auth/register`
- **Auth Requirement**: None
- **Request Body**:
  ```json
  {
    "name": "Elena Vance",
    "email": "elena@example.com",
    "phone": "+91 99999 88888",
    "password": "password123",
    "password_confirmation": "password123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful. Please verify your email.",
    "data": {
      "id": "usr-101",
      "name": "Elena Vance",
      "email": "elena@example.com",
      "phone": "+91 99999 88888",
      "avatar": "https://images.unsplash.com/...jpg",
      "joinedAt": "July 2026",
      "emailVerified": false,
      "phoneVerified": false
    }
  }
  ```

#### `POST /api/auth/login`
- **Auth Requirement**: None
- **Request Body**:
  ```json
  {
    "email": "elena@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "1|LaravelSanctumTokenPlaceholder",
    "data": {
      "id": "usr-101",
      "name": "Elena Vance",
      "email": "elena@example.com",
      "phone": "+91 99999 88888",
      "joinedAt": "July 2026",
      "emailVerified": true,
      "phoneVerified": true
    }
  }
  ```

#### `POST /api/auth/logout`
- **Auth Requirement**: Bearer Token
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### `POST /api/auth/forgot-password`
- **Auth Requirement**: None
- **Request Body**: `{"email": "user@example.com"}`
- **Response**: `{"success": true, "message": "Reset link sent to your email."}`

#### `POST /api/auth/reset-password`
- **Auth Requirement**: None
- **Request Body**: `{"token": "xyz", "email": "user@example.com", "password": "new", "password_confirmation": "new"}`
- **Response**: `{"success": true, "message": "Password reset successfully."}`

#### `POST /api/auth/email/resend`
- **Auth Requirement**: Bearer Token
- **Response**: `{"success": true, "message": "Verification email has been resent."}`

#### `GET /api/auth/email/verify`
- **Query Parameters**: `id`, `hash`, `expires`, `signature` (standard Laravel signed URL parameters)
- **Response**: Redirects or returns `{"success": true, "message": "Email verified successfully."}`

#### `GET /api/auth/me`
- **Auth Requirement**: Bearer Token
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "usr-101",
      "name": "Elena Vance",
      "email": "elena@example.com",
      "phone": "+91 99999 88888",
      "joinedAt": "July 2026",
      "emailVerified": true,
      "phoneVerified": true
    }
  }
  ```

---

### 2. CATEGORIES MODULE

#### `GET /api/categories`
- **Auth Requirement**: None
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cat-1",
        "name": "Call Girls",
        "slug": "call-girls",
        "icon": "Sparkles",
        "coverImage": "https://...",
        "description": "Discover premium call girl companions...",
        "listingCount": 4210,
        "popularCities": ["Delhi", "Mumbai"]
      }
    ]
  }
  ```

#### `GET /api/categories/{slug}`
- **Success Response (200 OK)**: Single category data.

---

### 3. LOCATIONS MODULE

#### `GET /api/locations/countries`
- **Success Response (200 OK)**: List of Countries.

#### `GET /api/locations/regions?country_id=`
- **Success Response (200 OK)**: List of States/Regions in the country.

#### `GET /api/locations/cities?region_id=`
- **Success Response (200 OK)**: List of Cities inside the region/state.

#### `GET /api/locations/areas?city_id=`
- **Success Response (200 OK)**: List of local Areas/Neighborhoods in the city.

---

### 4. DYNAMIC FILTERS MODULE

#### `GET /api/filters?category_id=`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ethnicity",
        "label": "Ethnicity",
        "type": "multi-select"
      },
      {
        "id": "nationality",
        "label": "Nationality",
        "type": "multi-select"
      }
    ]
  }
  ```

#### `GET /api/filters/{id}/options`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {"id": "eth-1", "filterId": "ethnicity", "label": "Indian", "value": "Indian"},
      {"id": "eth-2", "filterId": "ethnicity", "label": "Caucasian", "value": "Caucasian"}
    ]
  }
  ```

---

### 5. ADVERTISEMENTS CRUD MODULE

#### `GET /api/ads`
- **Query Parameters**:
  - `status`: filter by status (`published`, `pending`, etc.)
  - `user_id`: filter by creator ID
- **Response**: Paginated Collection of Advertisements.

#### `GET /api/ads/{slug}`
- **Response**: Single Advertisement Detail.

#### `POST /api/ads`
- **Auth Requirement**: Bearer Token
- **Request Body (FormData / JSON)**:
  ```json
  {
    "category": "cat-1",
    "location": {
      "countryId": "in",
      "regionId": "reg-delhi",
      "cityId": "delhi",
      "areaId": "connaught-place"
    },
    "title": "Elite Independent Companion",
    "description": "Premium companion services in city center...",
    "profileName": "Elena",
    "profileImage": "https://...",
    "images": ["https://...", "https://..."],
    "attributes": {
      "nationality": "Indian",
      "ethnicity": "South Asian",
      "bodyType": "Slim",
      "hairColor": "Black",
      "intendedAudience": "Gentlemen",
      "placeOfService": ["Provider location", "Hotel"]
    },
    "services": ["Social Escort", "Dinner Date"],
    "contact": {
      "phone": "+91 99999 88888",
      "whatsapp": "+91 99999 88888",
      "email": "elena@example.com"
    }
  }
  ```
- **Success Response (201 Created)**: Single Advertisement.

#### `PATCH /api/ads/{id}`
- **Auth Requirement**: Bearer Token (Creator or Admin)
- **Request Body**: Partial Advertisement properties.
- **Success Response (200 OK)**: Updated Single Advertisement.

#### `DELETE /api/ads/{id}`
- **Auth Requirement**: Bearer Token
- **Response**: `{"success": true, "message": "Ad deleted successfully"}`

#### `POST /api/ads/{id}/publish`
- **Auth Requirement**: Bearer Token

#### `POST /api/ads/{id}/pause`
- **Auth Requirement**: Bearer Token

#### `POST /api/ads/{id}/republish`
- **Auth Requirement**: Bearer Token

---

### 6. SEARCH MODULE

#### `GET /api/search/ads`
- **Query Parameters**:
  - `keyword`: search term (string)
  - `categoryId`: string
  - `countryId`: string
  - `regionId`: string
  - `cityId`: string
  - `areaId`: string
  - `nationality`: string (comma-separated or array)
  - `ethnicity`: string
  - `bodyType`: string
  - `hairColor`: string
  - `services`: array/csv
  - `intendedAudience`: string
  - `placeOfService`: array/csv
  - `sort`: `recommended` | `latest` | `most_viewed`
  - `page`: number
  - `per_page`: number
- **Response**: Paginated Collection of Advertisements.

---

### 7. FAVORITES MODULE

#### `GET /api/favorites`
- **Auth Requirement**: Bearer Token
- **Response**: Collection of favorited Advertisements.

#### `POST /api/favorites/{adId}`
- **Auth Requirement**: Bearer Token
- **Response**: `{"success": true, "message": "Added to favorites"}`

#### `DELETE /api/favorites/{adId}`
- **Auth Requirement**: Bearer Token
- **Response**: `{"success": true, "message": "Removed from favorites"}`

---

### 8. REPORTS MODULE

#### `POST /api/ads/{adId}/reports`
- **Auth Requirement**: None / Optional Bearer Token
- **Request Body**:
  ```json
  {
    "reason": "Fake Profile / Stolen Pictures",
    "description": "These pictures belong to a known Instagram influencer."
  }
  ```
- **Response**: `{"success": true, "message": "Report submitted. Thank you for keeping our marketplace safe."}`

---

### 9. PROMOTIONS MODULE

#### `GET /api/promotions`
- **Success Response**: List of active promotional packages available for purchase.

#### `POST /api/ads/{adId}/promotions`
- **Auth Requirement**: Bearer Token
- **Request Body**:
  ```json
  {
    "promotion_id": "promo-featured-7"
  }
  ```
- **Response**: `{"success": true, "message": "Promotion applied successfully. 500 Credits deducted."}`

---

### 10. WALLET MODULE

#### `GET /api/wallet`
- **Auth Requirement**: Bearer Token
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "balance": 1500,
      "currency": "Credits"
    }
  }
  ```

#### `GET /api/wallet/transactions`
- **Auth Requirement**: Bearer Token
- **Response**: Paginated Collection of `WalletTransaction` objects.

---

### 11. PAYMENTS MODULE

#### `POST /api/payments/create-order`
- **Auth Requirement**: Bearer Token
- **Request Body**:
  ```json
  {
    "amount": 1000,
    "paymentMethod": "UPI"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "orderId": "pay_ord_901923",
      "paymentUrl": "https://gateway.example.com/pay/pay_ord_901923",
      "amount": 1000,
      "currency": "INR"
    }
  }
  ```

---

### 12. NOTIFICATIONS MODULE

#### `GET /api/notifications`
- **Auth Requirement**: Bearer Token
- **Response**: Collection of standard notifications for the user.

#### `POST /api/notifications/{id}/read`
- **Auth Requirement**: Bearer Token
- **Response**: `{"success": true, "message": "Notification marked as read"}`
