# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│               Next.js (Vercel CDN + SSR/SSG)                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                         API LAYER                           │
│            Django REST Framework + Django Channels          │
│                    (JWT Authentication)                     │
└──────┬──────────────┬─────────────────┬────────────────────┘
       │              │                 │
┌──────▼──────┐ ┌─────▼──────┐ ┌───────▼───────┐
│ PostgreSQL  │ │   Redis    │ │  Celery       │
│  (primary   │ │ (sessions, │ │  (async jobs: │
│   data)     │ │  cache,    │ │   AI auth,    │
│             │ │  pubsub)   │ │   emails)     │
└─────────────┘ └────────────┘ └───────┬───────┘
                                       │
              ┌────────────────────────┼──────────────────┐
              │                        │                  │
       ┌──────▼──────┐        ┌────────▼──────┐  ┌───────▼───────┐
       │  AWS S3 /   │        │  Gemini API   │  │    Stripe     │
       │ Cloudinary  │        │  (AI Watch    │  │  (Payments)   │
       │  (images)   │        │   Auth)       │  │               │
       └─────────────┘        └───────────────┘  └───────────────┘
```

## Monorepo Structure

```
adriel/
├── frontend/                    # Next.js App
│   ├── app/                     # App Router pages
│   │   ├── (auth)/              # Auth routes (login, register)
│   │   ├── (marketplace)/       # Listing browse/search
│   │   ├── (dashboard)/         # User dashboard
│   │   ├── stores/              # Store directory
│   │   ├── repairs/             # Repair shop directory
│   │   ├── authenticate/        # AI authentication flow
│   │   └── admin/               # Admin panel
│   ├── components/              # Reusable UI components
│   ├── lib/                     # API client, utils
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # TypeScript types
│
├── backend/                     # Django App
│   ├── config/                  # Django settings, urls, wsgi
│   ├── apps/
│   │   ├── users/               # User management
│   │   ├── listings/            # Watch listings
│   │   ├── stores/              # Watch stores
│   │   ├── repairs/             # Repair shops
│   │   ├── authentication/      # AI watch authentication
│   │   ├── transactions/        # Payments & orders
│   │   ├── messaging/           # In-app chat
│   │   └── notifications/       # Email & push
│   ├── requirements.txt
│   └── manage.py
│
├── docs/                        # Planning & architecture docs
└── docker-compose.yml
```

## Key Architectural Decisions

### 1. Monorepo
Both frontend and backend live in the same repository for easier coordination during development.

### 2. App Router (Next.js)
Using Next.js App Router for:
- Server Components → better SEO for listing pages
- Route Groups → clean URL structure
- Streaming → faster perceived load for search results

### 3. Django REST Framework
- Versioned API (`/api/v1/`)
- Token-based auth (JWT via `djangorestframework-simplejwt`)
- Serializers enforce strict input validation

### 4. Async Processing (Celery + Redis)
AI watch authentication is CPU/API-intensive — handled asynchronously:
- User uploads images → job queued in Redis → Celery worker calls Gemini API → result stored → user notified

### 5. Real-time (Django Channels)
WebSocket connections for:
- Buyer-seller messaging
- Authentication status updates
- Auction-style bidding (future)

## Environments

| Environment | Frontend            | Backend               |
|-------------|---------------------|-----------------------|
| Development | localhost:3000      | localhost:8000        |
| Staging     | staging.adriel.com  | api-staging.adriel.com |
| Production  | adriel.com          | api.adriel.com         |
