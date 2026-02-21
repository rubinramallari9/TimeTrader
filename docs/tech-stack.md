# Tech Stack Decisions

## Frontend — Next.js 14+

**Why Next.js App Router:**
- Server Components for listing pages → crawlable HTML for SEO
- Route Groups for clean URL structure without affecting paths
- Built-in image optimization (`next/image`) essential for watch photos
- Streaming for faster search result rendering

**UI:**
- Tailwind CSS — utility-first, fast iteration
- shadcn/ui — accessible, unstyled components (customizable)
- Lucide Icons

**State:**
- Server state: TanStack Query (react-query) for data fetching/caching
- Client state: Zustand (lightweight, simple)

**Forms:**
- React Hook Form + Zod for validation

---

## Backend — Django 5+ & DRF

**Why Django:**
- Django ORM — complex relational queries (listings + auth + orders)
- Django REST Framework — battle-tested API layer
- Django Admin — free admin panel for moderation
- Django Channels — WebSocket support built-in

**Key packages:**
| Package                         | Purpose                    |
|---------------------------------|----------------------------|
| djangorestframework             | API layer                  |
| djangorestframework-simplejwt   | JWT authentication         |
| django-channels                 | WebSockets                 |
| celery                          | Async task queue           |
| django-storages                 | S3 file storage            |
| django-filter                   | Listing search/filtering   |
| Pillow                          | Image processing           |
| psycopg2-binary                 | PostgreSQL adapter         |
| redis                           | Celery broker + cache      |
| stripe                          | Payment processing         |
| google-generativeai             | Gemini AI API client       |
| reportlab                       | PDF certificate generation |
| django-cors-headers             | CORS for frontend          |

---

## Database

### PostgreSQL 15+
- Primary data store
- JSONB columns for flexible AI reports and opening hours
- UUID primary keys throughout
- Indexes on: brand, condition, price, status, created_at

### Redis
- Celery message broker
- Session storage
- API response caching (listings, store profiles)
- WebSocket pub/sub (Django Channels channel layer)

---

## AI Watch Authentication

**Provider: Google Gemini Vision API**
- Model: `gemini-2.5-flash` (cost-effective, fast)
- Input: 4–6 images per watch (dial, caseback, crown, serial, bracelet)
- Output: Structured JSON analysis + authenticity score
- Async: Celery job → result stored in DB → WebSocket notification

**Prompt Strategy:**
- System prompt defines watch authentication criteria
- Images sent as multimodal input
- Response parsed into structured `ai_report` JSONB field

---

## Payments — Stripe

- Payment Intents API for secure checkout
- Escrow-style: funds held until buyer confirms receipt
- Webhooks for payment event handling
- Connect (future): direct payouts to sellers
- Test mode for development

---

## File Storage

**Development:** Local filesystem
**Production:** AWS S3 or Cloudinary

| Use Case         | Strategy                              |
|------------------|---------------------------------------|
| Watch images     | S3 + CloudFront CDN                   |
| Auth images      | Private S3 bucket (not public)        |
| Certificates     | S3 with signed URLs                   |
| Store/shop logos | S3 + CloudFront CDN                   |

---

## Authentication

- **JWT** (access token: 15min, refresh: 7 days)
- **OAuth2:** Google (social-django)
- **Email verification** on registration
- **Role-based permissions** via custom DRF permission classes

---

## Deployment

| Service         | Platform              |
|-----------------|-----------------------|
| Frontend        | Vercel                |
| Backend API     | Railway or AWS ECS    |
| PostgreSQL      | Railway / AWS RDS     |
| Redis           | Railway / AWS Elasticache |
| Media storage   | AWS S3                |
| Email           | AWS SES / Sendgrid    |
| Monitoring      | Sentry                |

---

## Third-Party Services Summary

| Service      | Purpose               | Cost Model             |
|--------------|-----------------------|------------------------|
| Stripe       | Payments              | 2.9% + 30¢ per tx      |
| Gemini API   | Watch AI auth         | ~$0.10/1M tokens       |
| AWS S3       | File storage          | ~$0.023/GB/month       |
| Sendgrid     | Transactional email   | Free up to 100/day     |
| Google OAuth | Social login          | Free                   |
| Sentry       | Error monitoring      | Free up to 5k errors   |
| Vercel       | Frontend hosting      | Free tier available    |
