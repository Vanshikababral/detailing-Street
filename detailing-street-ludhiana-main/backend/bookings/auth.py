"""
Custom JWT authentication for the Django admin API.

No SQL database is needed — tokens are signed with ADMIN_SESSION_SECRET
from the environment (same secret the Next.js frontend uses).
"""

import datetime
import os
from pathlib import Path

from dotenv import load_dotenv
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Load env from project-root .env.local (same file Next.js reads)
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / '.env.local')

SECRET = os.environ.get('ADMIN_SESSION_SECRET', 'detailing_street_secure_session_secret_2026_key')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '').strip().lower()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '').strip()
TOKEN_EXPIRY_HOURS = 24


class AdminUser:
    """Minimal user-like object so DRF's IsAuthenticated check passes."""
    is_authenticated = True
    is_anonymous = False

    def __init__(self, email: str):
        self.email = email

    def __str__(self):
        return self.email


class JWTAuthentication(BaseAuthentication):
    """
    Reads: Authorization: Bearer <token>
    Returns an AdminUser if the token is valid, None otherwise.
    """

    def authenticate(self, request):
        import jwt  # deferred import to avoid any circular import at module level

        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None  # Not our scheme — let other authenticators try

        token = auth_header[7:]
        try:
            payload = jwt.decode(token, SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired. Please log in again.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')

        return (AdminUser(payload.get('email', '')), None)

    def authenticate_header(self, request):
        return 'Bearer realm="admin"'
