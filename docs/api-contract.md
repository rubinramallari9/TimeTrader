# API Contract

Base URL: `/api/v1/`
Auth: Bearer JWT token in `Authorization` header
Format: JSON

---

## Authentication

| Method | Endpoint                  | Description           | Auth |
|--------|---------------------------|-----------------------|------|
| POST   | `/auth/register/`         | Register new user     | No   |
| POST   | `/auth/login/`            | Login, returns JWT    | No   |
| POST   | `/auth/logout/`           | Invalidate token      | Yes  |
| POST   | `/auth/token/refresh/`    | Refresh JWT           | No   |
| POST   | `/auth/oauth/google/`     | Google OAuth login    | No   |
| POST   | `/auth/password/reset/`   | Request password reset| No   |
| POST   | `/auth/password/confirm/` | Confirm password reset| No   |

---

## Users

| Method | Endpoint              | Description                | Auth  |
|--------|-----------------------|----------------------------|-------|
| GET    | `/users/me/`          | Get current user profile   | Yes   |
| PATCH  | `/users/me/`          | Update profile             | Yes   |
| GET    | `/users/{id}/`        | Get public profile         | No    |
| GET    | `/users/{id}/listings/` | Get seller listings      | No    |
| GET    | `/users/{id}/reviews/`  | Get seller reviews       | No    |

---

## Listings

| Method | Endpoint                    | Description               | Auth   |
|--------|-----------------------------|---------------------------|--------|
| GET    | `/listings/`                | Browse/search listings    | No     |
| POST   | `/listings/`                | Create listing            | Seller |
| GET    | `/listings/{id}/`           | Get listing detail        | No     |
| PATCH  | `/listings/{id}/`           | Update listing            | Owner  |
| DELETE | `/listings/{id}/`           | Remove listing            | Owner  |
| POST   | `/listings/{id}/images/`    | Upload listing images     | Owner  |
| DELETE | `/listings/{id}/images/{imageId}/` | Delete image      | Owner  |
| POST   | `/listings/{id}/save/`      | Save to favorites         | Yes    |
| DELETE | `/listings/{id}/save/`      | Remove from favorites     | Yes    |
| GET    | `/listings/saved/`          | Get user's saved listings | Yes    |

### Listing Search Query Params
```
GET /api/v1/listings/?brand=Rolex&condition=excellent&min_price=500&max_price=5000
                      &movement_type=automatic&is_authenticated=true
                      &city=New York&sort=price_asc&page=1&page_size=20
```

---

## Watch Authentication

| Method | Endpoint                             | Description                    | Auth  |
|--------|--------------------------------------|--------------------------------|-------|
| POST   | `/authentication/`                   | Submit authentication request  | Yes   |
| GET    | `/authentication/{id}/`              | Get auth request status        | Yes   |
| POST   | `/authentication/{id}/images/`       | Upload images for auth         | Yes   |
| GET    | `/authentication/{id}/certificate/`  | Download certificate PDF       | Yes   |
| GET    | `/authentication/` (admin)           | List all requests              | Admin |
| PATCH  | `/authentication/{id}/review/`       | Admin manual review            | Admin |

### Auth Request Payload
```json
{
  "listing_id": "uuid",
  "images": [
    { "angle": "dial", "file": "<multipart>" },
    { "angle": "caseback", "file": "<multipart>" },
    { "angle": "crown", "file": "<multipart>" },
    { "angle": "serial_number", "file": "<multipart>" }
  ]
}
```

### Auth Response
```json
{
  "id": "uuid",
  "status": "authenticated",
  "ai_score": 0.97,
  "ai_report": {
    "dial_analysis": "Consistent with genuine Rolex Submariner",
    "font_check": "Pass",
    "serial_check": "Pass",
    "overall": "High confidence authentic"
  },
  "certificate_url": "https://cdn.adriel.com/certs/uuid.pdf"
}
```

---

## Stores

| Method | Endpoint                  | Description              | Auth        |
|--------|---------------------------|--------------------------|-------------|
| GET    | `/stores/`                | List/search stores       | No          |
| POST   | `/stores/`                | Create store profile     | Store Owner |
| GET    | `/stores/{slug}/`         | Get store detail         | No          |
| PATCH  | `/stores/{slug}/`         | Update store             | Owner       |
| POST   | `/stores/{slug}/images/`  | Upload store images      | Owner       |
| GET    | `/stores/{slug}/reviews/` | Get store reviews        | No          |
| POST   | `/stores/{slug}/reviews/` | Post review              | Yes         |

---

## Repair Shops

| Method | Endpoint                          | Description              | Auth        |
|--------|-----------------------------------|--------------------------|-------------|
| GET    | `/repairs/`                       | List/search repair shops | No          |
| POST   | `/repairs/`                       | Create shop profile      | Repair Role |
| GET    | `/repairs/{slug}/`                | Get shop detail          | No          |
| PATCH  | `/repairs/{slug}/`                | Update shop              | Owner       |
| GET    | `/repairs/{slug}/services/`       | List services            | No          |
| POST   | `/repairs/{slug}/services/`       | Add service              | Owner       |
| POST   | `/repairs/{slug}/appointments/`   | Book appointment         | Yes         |
| GET    | `/repairs/{slug}/appointments/`   | List appointments        | Owner       |
| PATCH  | `/repairs/{slug}/appointments/{id}/` | Update appointment status | Owner   |

---

## Orders & Payments

| Method | Endpoint                        | Description                    | Auth  |
|--------|---------------------------------|--------------------------------|-------|
| POST   | `/orders/`                      | Create order (Stripe intent)   | Buyer |
| GET    | `/orders/`                      | List user orders               | Yes   |
| GET    | `/orders/{id}/`                 | Get order detail               | Owner |
| POST   | `/orders/{id}/confirm/`         | Confirm delivery               | Buyer |
| POST   | `/orders/{id}/dispute/`         | Raise dispute                  | Buyer |
| POST   | `/payments/webhook/`            | Stripe webhook (no auth)       | No    |

---

## Messaging

| Method | Endpoint                      | Description               | Auth |
|--------|-------------------------------|---------------------------|------|
| GET    | `/messages/conversations/`    | List all conversations    | Yes  |
| GET    | `/messages/conversations/{id}/` | Get messages in thread  | Yes  |
| POST   | `/messages/`                  | Send message              | Yes  |
| PATCH  | `/messages/{id}/read/`        | Mark as read              | Yes  |

**WebSocket:** `ws://api.adriel.com/ws/messages/{conversation_id}/`

---

## Notifications

| Method | Endpoint                     | Description               | Auth |
|--------|------------------------------|---------------------------|------|
| GET    | `/notifications/`            | List notifications        | Yes  |
| PATCH  | `/notifications/{id}/read/`  | Mark as read              | Yes  |
| POST   | `/notifications/read-all/`   | Mark all as read          | Yes  |

---

## Admin

| Method | Endpoint                      | Description               | Auth  |
|--------|-------------------------------|---------------------------|-------|
| GET    | `/admin/dashboard/`           | Platform analytics        | Admin |
| GET    | `/admin/listings/`            | All listings with filters | Admin |
| PATCH  | `/admin/listings/{id}/`       | Moderate listing          | Admin |
| GET    | `/admin/users/`               | All users                 | Admin |
| PATCH  | `/admin/users/{id}/`          | Suspend/verify user       | Admin |

---

## Response Conventions

### Success
```json
{ "data": {}, "message": "Success" }
```

### Paginated
```json
{
  "count": 100,
  "next": "/api/v1/listings/?page=2",
  "previous": null,
  "results": []
}
```

### Error
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Price must be greater than 0",
  "fields": { "price": ["Must be greater than 0"] }
}
```

### HTTP Status Codes
| Code | Meaning               |
|------|-----------------------|
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 422  | Validation Error      |
| 500  | Internal Server Error |
