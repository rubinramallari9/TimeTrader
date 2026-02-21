# Adriel - Watch Marketplace

A full-stack watch marketplace where buyers and sellers meet, watch stores and repair shops are listed, and watches are authenticated using AI.

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend     | Django 5+, Django REST Framework       |
| Database    | PostgreSQL + Redis                     |
| Auth        | JWT + OAuth2 (Google, Apple)           |
| AI Auth     | Gemini Vision API                      |
| Payments    | Stripe                                 |
| Storage     | AWS S3 / Cloudinary                    |
| Real-time   | Django Channels + WebSockets           |
| Deploy      | Vercel (frontend) + Railway/AWS (backend) |

## Project Structure

```
adriel/
├── frontend/        # Next.js application
├── backend/         # Django application
├── docs/            # Architecture & planning docs
└── docker-compose.yml
```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [API Contract](docs/api-contract.md)
- [Tech Stack Decisions](docs/tech-stack.md)

## User Roles

| Role        | Description                                      |
|-------------|--------------------------------------------------|
| Buyer       | Browse, search, purchase, and request authentication |
| Seller      | List watches for sale, manage listings           |
| Store Owner | Advertise watch store, manage inventory          |
| Repair Shop | List repair services, accept appointments        |
| Admin       | Moderate content, manage authentications, analytics |

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 15+
- Redis

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Docker (full stack)
```bash
docker-compose up
```
