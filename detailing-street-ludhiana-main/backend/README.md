# Detailing Street Django API

Django serves the API used by the Next.js website. PyMongo reads and writes every business record in MongoDB: appointments, customers, vehicles, and services. The backend has no Django ORM models, SQLite database, migrations, or built-in Django Admin.

The Django database setting uses Django's dummy backend. It intentionally rejects ORM database access so application data cannot silently fall back to SQLite.

## Requirements and setup

From the project directory, create and activate a virtual environment and install dependencies:

```powershell
cd .\backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Set `MONGODB_URI` in the project-root `.env.local`; Django loads that file when opening a MongoDB connection. `MONGODB_DATABASE` optionally selects the database name. It defaults to `test` to keep using the database currently selected by the project. Make sure MongoDB network access and credentials allow this machine to connect. Never commit your connection string.

Start the API:

```powershell
python manage.py runserver 127.0.0.1:8000
```

Check the API at <http://127.0.0.1:8000/api/health/>.

## Endpoints

- `GET /api/health/` — API health status.
- `POST /api/book-appointment/` — validates a booking, upserts its customer by phone number, and stores the appointment. A vehicle is added or updated only when registration, make, and model are all provided.
- `GET`, `PATCH`, and `DELETE /api/appointments/` — appointment operations backed by MongoDB.
- `GET /api/dashboard/` — business metrics read from MongoDB collections.

The working Next.js dashboard at <http://localhost:3000/admin> uses the MongoDB-backed API. Services are a separate catalog; add the starter entries from the Services page and set their prices there. Reports is currently a placeholder, not a live report.

## Tests

Tests replace MongoDB collection calls with in-memory mocks. They run without a MongoDB connection and do not create a SQLite test database:

```powershell
python manage.py test bookings.tests
```

## Production

Use a protected MongoDB connection string and database, set `DJANGO_DEBUG=False`, provide a strong `DJANGO_SECRET_KEY`, configure `DJANGO_ALLOWED_HOSTS`, and set the appropriate `CORS_ALLOWED_ORIGINS`. Run Django behind a production-grade application server; do not expose `runserver` to the public internet.
