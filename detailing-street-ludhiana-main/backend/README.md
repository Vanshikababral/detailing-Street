# Detailing Street Ludhiana Django backend

This backend is isolated from the existing Next.js website. It provides Django Admin, a health endpoint, a public appointment submission endpoint, and staff-only appointment read endpoints. The existing Next.js website is not connected to this API.

Appointments are stored in the local SQLite database and managed at <http://127.0.0.1:8000/admin/>. Each record gets a unique reference such as `DS-20261028-A1B2C3D4E5F6`; admins can search, filter, and update appointment status there.

## API endpoints

### `GET /api/health/`

Returns the backend health status:

```json
{
  "status": "ok",
  "service": "detailing-street-ludhiana-api"
}
```

### `POST /api/book-appointment/`

Accepts the same camelCase field names used by the existing form. Customer name, phone number, and service are required. Email, car model, date, time, and message are optional. Dates use `YYYY-MM-DD`; times accept the form's 12-hour format, such as `9:00 AM`.

Example request:

```json
{
  "customerName": "Aman Singh",
  "phoneNumber": "9876543210",
  "email": "aman@example.com",
  "carModel": "Hyundai Creta 2023",
  "service": "Ceramic Coating",
  "preferredDate": "2026-10-29",
  "preferredTime": "9:00 AM",
  "message": "Please call before confirming."
}
```

Successful requests return HTTP `201 Created`:

```json
{
  "success": true,
  "bookingId": "DS-20261028-A1B2C3D4E5F6",
  "message": "Booking DS-20261028-A1B2C3D4E5F6 submitted! Our team will contact you shortly."
}
```

Invalid requests return HTTP `400` with errors keyed by the relevant request field. Message text is limited to 2,000 characters.

### `GET /api/appointments/` and `GET /api/appointments/<id>/`

These endpoints return appointment records, including customer contact details, and require an authenticated Django staff user. Public users and authenticated non-staff users are denied. Staff can sign into Django Admin to create a session before making requests with that session.

## Windows PowerShell setup

From the project root, enter the backend directory:

```powershell
cd .\backend
```

Create and activate the virtual environment (it is already created in this workspace):

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
python -m pip install -r requirements.txt
```

Set environment variables in the current PowerShell window. Generate a local secret instead of putting a real secret in source files:

```powershell
$env:DJANGO_SECRET_KEY = (python -c "import secrets; print(secrets.token_urlsafe(50))")
$env:DJANGO_DEBUG = "True"
$env:DJANGO_ALLOWED_HOSTS = "127.0.0.1,localhost"
```

`backend/.env.example` documents the variable names and safe development values. Django does not read that file automatically; the commands above set the variables for this PowerShell session only. Set them again in a new terminal, or configure them through a local secret manager. Do not commit real secret keys.

Initialize the development database and create an administrator:

```powershell
python manage.py migrate
python manage.py createsuperuser
```

Start the backend:

```powershell
python manage.py runserver
```

Open <http://127.0.0.1:8000/api/health/> in a browser. Django Admin is at <http://127.0.0.1:8000/admin/>.

If PowerShell prevents virtual environment activation, call its Python executable directly instead, for example:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
```

## Production settings

The defaults are for local development only. Production must use `DJANGO_DEBUG=False`, a separately generated and protected `DJANGO_SECRET_KEY`, and `DJANGO_ALLOWED_HOSTS` set to the exact production hostnames. The application refuses to start with debug disabled and no configured secret key. Do not expose the development server directly to the public internet.
