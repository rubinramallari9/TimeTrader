# Database Schema

## Entity Relationship Overview

```
User ──< Listing ──< ListingImage
 │          │
 │          └──< AuthenticationRequest ──< AuthenticationImage
 │
 ├──< Store ──< StoreImage
 │       └──< Review
 │
 ├──< RepairShop ──< RepairService
 │         └──< Appointment
 │
 ├──< Order ──< OrderItem
 │       └── Payment
 │
 ├──< Message (sender)
 ├──< Message (receiver)
 │
 └──< Notification
```

---

## Tables

### users
| Column           | Type         | Notes                              |
|------------------|--------------|------------------------------------|
| id               | UUID (PK)    |                                    |
| email            | VARCHAR(255) | unique                             |
| username         | VARCHAR(100) | unique                             |
| password_hash    | VARCHAR      |                                    |
| role             | ENUM         | buyer, seller, store, repair, admin |
| first_name       | VARCHAR(100) |                                    |
| last_name        | VARCHAR(100) |                                    |
| avatar_url       | TEXT         | S3/Cloudinary URL                  |
| phone            | VARCHAR(20)  | nullable                           |
| is_verified      | BOOLEAN      | default false                      |
| is_active        | BOOLEAN      | default true                       |
| stripe_customer_id | VARCHAR   | nullable                           |
| created_at       | TIMESTAMP    |                                    |
| updated_at       | TIMESTAMP    |                                    |

### listings
| Column            | Type         | Notes                               |
|-------------------|--------------|-------------------------------------|
| id                | UUID (PK)    |                                     |
| seller_id         | UUID (FK)    | → users.id                          |
| title             | VARCHAR(255) |                                     |
| brand             | VARCHAR(100) | Rolex, Omega, etc.                  |
| model             | VARCHAR(100) |                                     |
| reference_number  | VARCHAR(100) | nullable                            |
| year              | INTEGER      | nullable                            |
| condition         | ENUM         | new, excellent, good, fair, poor    |
| movement_type     | ENUM         | automatic, manual, quartz, solar    |
| case_material     | VARCHAR(100) | stainless steel, gold, titanium     |
| case_diameter_mm  | DECIMAL(5,2) | nullable                            |
| price             | DECIMAL(12,2)|                                     |
| currency          | VARCHAR(3)   | default USD                         |
| description       | TEXT         |                                     |
| status            | ENUM         | active, sold, pending, removed      |
| is_authenticated  | BOOLEAN      | default false                       |
| authentication_id | UUID (FK)    | nullable → authentication_requests.id |
| views_count       | INTEGER      | default 0                           |
| location_city     | VARCHAR(100) | nullable                            |
| location_country  | VARCHAR(100) | nullable                            |
| created_at        | TIMESTAMP    |                                     |
| updated_at        | TIMESTAMP    |                                     |

### listing_images
| Column      | Type      | Notes              |
|-------------|-----------|--------------------|
| id          | UUID (PK) |                    |
| listing_id  | UUID (FK) | → listings.id      |
| url         | TEXT      | S3/Cloudinary URL  |
| is_primary  | BOOLEAN   | default false      |
| order       | INTEGER   | display order      |
| created_at  | TIMESTAMP |                    |

### authentication_requests
| Column            | Type      | Notes                                    |
|-------------------|-----------|------------------------------------------|
| id                | UUID (PK) |                                          |
| listing_id        | UUID (FK) | → listings.id                            |
| requested_by      | UUID (FK) | → users.id                               |
| status            | ENUM      | pending, processing, authenticated, rejected, manual_review |
| ai_score          | DECIMAL(5,4) | 0.0 to 1.0 confidence score           |
| ai_report         | JSONB     | full AI analysis result                  |
| admin_reviewed_by | UUID (FK) | nullable → users.id                      |
| admin_notes       | TEXT      | nullable                                 |
| certificate_url   | TEXT      | nullable, PDF link                       |
| created_at        | TIMESTAMP |                                          |
| updated_at        | TIMESTAMP |                                          |

### authentication_images
| Column           | Type      | Notes                              |
|------------------|-----------|------------------------------------|
| id               | UUID (PK) |                                    |
| auth_request_id  | UUID (FK) | → authentication_requests.id       |
| url              | TEXT      | S3/Cloudinary URL                  |
| angle            | ENUM      | dial, caseback, crown, bracelet, serial_number, box_papers |
| created_at       | TIMESTAMP |                                    |

### stores
| Column         | Type         | Notes                      |
|----------------|--------------|----------------------------|
| id             | UUID (PK)    |                            |
| owner_id       | UUID (FK)    | → users.id                 |
| name           | VARCHAR(255) |                            |
| slug           | VARCHAR(255) | unique, URL-friendly       |
| description    | TEXT         |                            |
| logo_url       | TEXT         |                            |
| website        | TEXT         | nullable                   |
| phone          | VARCHAR(20)  |                            |
| email          | VARCHAR(255) |                            |
| address        | TEXT         |                            |
| city           | VARCHAR(100) |                            |
| country        | VARCHAR(100) |                            |
| latitude       | DECIMAL(9,6) | nullable, for maps         |
| longitude      | DECIMAL(9,6) | nullable, for maps         |
| opening_hours  | JSONB        | {mon: "9-17", ...}         |
| is_featured    | BOOLEAN      | default false (paid promo) |
| is_verified    | BOOLEAN      | default false              |
| created_at     | TIMESTAMP    |                            |

### repair_shops
| Column         | Type         | Notes                      |
|----------------|--------------|----------------------------|
| id             | UUID (PK)    |                            |
| owner_id       | UUID (FK)    | → users.id                 |
| name           | VARCHAR(255) |                            |
| slug           | VARCHAR(255) | unique                     |
| description    | TEXT         |                            |
| logo_url       | TEXT         |                            |
| phone          | VARCHAR(20)  |                            |
| email          | VARCHAR(255) |                            |
| address        | TEXT         |                            |
| city           | VARCHAR(100) |                            |
| country        | VARCHAR(100) |                            |
| latitude       | DECIMAL(9,6) | nullable                   |
| longitude      | DECIMAL(9,6) | nullable                   |
| is_featured    | BOOLEAN      | default false              |
| is_verified    | BOOLEAN      | default false              |
| created_at     | TIMESTAMP    |                            |

### repair_services
| Column         | Type         | Notes                      |
|----------------|--------------|----------------------------|
| id             | UUID (PK)    |                            |
| shop_id        | UUID (FK)    | → repair_shops.id          |
| name           | VARCHAR(255) | e.g. "Full Service"        |
| description    | TEXT         |                            |
| price_from     | DECIMAL(10,2)| nullable                   |
| price_to       | DECIMAL(10,2)| nullable                   |
| duration_days  | INTEGER      | estimated turnaround       |
| created_at     | TIMESTAMP    |                            |

### appointments
| Column         | Type      | Notes                          |
|----------------|-----------|--------------------------------|
| id             | UUID (PK) |                                |
| shop_id        | UUID (FK) | → repair_shops.id              |
| service_id     | UUID (FK) | → repair_services.id           |
| customer_id    | UUID (FK) | → users.id                     |
| scheduled_at   | TIMESTAMP |                                |
| status         | ENUM      | pending, confirmed, completed, cancelled |
| notes          | TEXT      | nullable                       |
| created_at     | TIMESTAMP |                                |

### orders
| Column          | Type         | Notes                       |
|-----------------|--------------|-----------------------------|
| id              | UUID (PK)    |                             |
| buyer_id        | UUID (FK)    | → users.id                  |
| seller_id       | UUID (FK)    | → users.id                  |
| listing_id      | UUID (FK)    | → listings.id               |
| amount          | DECIMAL(12,2)|                             |
| currency        | VARCHAR(3)   |                             |
| status          | ENUM         | pending, paid, shipped, delivered, disputed, refunded |
| stripe_payment_intent_id | VARCHAR | nullable              |
| shipping_address | JSONB       |                             |
| tracking_number | VARCHAR(100) | nullable                    |
| created_at      | TIMESTAMP    |                             |
| updated_at      | TIMESTAMP    |                             |

### messages
| Column      | Type      | Notes              |
|-------------|-----------|--------------------|
| id          | UUID (PK) |                    |
| sender_id   | UUID (FK) | → users.id         |
| receiver_id | UUID (FK) | → users.id         |
| listing_id  | UUID (FK) | nullable → listings.id |
| content     | TEXT      |                    |
| is_read     | BOOLEAN   | default false      |
| created_at  | TIMESTAMP |                    |

### reviews
| Column      | Type      | Notes                           |
|-------------|-----------|---------------------------------|
| id          | UUID (PK) |                                 |
| author_id   | UUID (FK) | → users.id                      |
| store_id    | UUID (FK) | nullable → stores.id            |
| shop_id     | UUID (FK) | nullable → repair_shops.id      |
| seller_id   | UUID (FK) | nullable → users.id             |
| rating      | INTEGER   | 1-5                             |
| content     | TEXT      |                                 |
| created_at  | TIMESTAMP |                                 |

### notifications
| Column      | Type      | Notes                              |
|-------------|-----------|------------------------------------|
| id          | UUID (PK) |                                    |
| user_id     | UUID (FK) | → users.id                         |
| type        | VARCHAR   | new_message, auth_complete, sale, etc. |
| title       | VARCHAR   |                                    |
| body        | TEXT      |                                    |
| data        | JSONB     | extra context                      |
| is_read     | BOOLEAN   | default false                      |
| created_at  | TIMESTAMP |                                    |

### saved_listings (favorites)
| Column      | Type      | Notes          |
|-------------|-----------|----------------|
| id          | UUID (PK) |                |
| user_id     | UUID (FK) | → users.id     |
| listing_id  | UUID (FK) | → listings.id  |
| created_at  | TIMESTAMP |                |
