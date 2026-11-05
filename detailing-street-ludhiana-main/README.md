# Detailing Street Ludhiana

The project has one customer-facing website and one working admin dashboard. Booking, appointment, customer, vehicle, and service records are stored in MongoDB. The Next.js app proxies booking requests to the Django API; Django uses PyMongo for business data.

## Requirements

- Node.js 20.9 or newer
- Python 3.11 or newer
- A reachable MongoDB database

## Local setup

Run each app in its own PowerShell window from the project directory.

### Django API

```powershell
cd .\backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py runserver 127.0.0.1:8000
```

Set `MONGODB_URI` and, optionally, `MONGODB_DATABASE` in the project-root `.env.local` before starting Django. The current default database name is `test` to preserve the database this project already uses. Set `MONGODB_DATABASE` to the intended database name if your collections are elsewhere.

The API health check is at [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/).

### Next.js website and dashboard

```powershell
npm ci
npm run dev
```

Open the website at [http://localhost:3000](http://localhost:3000) and its dashboard at [http://localhost:3000/admin](http://localhost:3000/admin). The dashboard is part of this app; no separate dashboard server is needed.

### Environment variables

Create a local `.env.local` from `.env.example` and fill in your own values. Do not commit credentials.

- `MONGODB_URI` — MongoDB connection string.
- `MONGODB_DATABASE` — optional database name; defaults to `test` for compatibility with the current data.
- `DJANGO_API_BASE_URL` — optional Django API URL; defaults to `http://127.0.0.1:8000`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_NOTIFICATION_EMAIL` — optional email notification settings.

Bookings are stored even when SMTP is not configured; email notifications require valid SMTP credentials.

## Database and tests

MongoDB is the only database. Django has no ORM models, admin/auth tables, or SQLite database; the dummy database backend prevents accidental ORM persistence. No Django migrations are needed. All business records are read and written in MongoDB through PyMongo.

The backend tests mock the MongoDB collection calls, so they do not need a MongoDB connection and never write test records to your real database:

```powershell
cd .\backend
.\.venv\Scripts\python.exe manage.py test bookings.tests
```

## Build

```powershell
npm run build
```

The admin dashboard is hosted within the main Next.js site at `/admin`.
