import base64
import binascii
import hashlib
import hmac
import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv
from rest_framework.authentication import BaseAuthentication


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / '.env.local')
load_dotenv(ROOT_DIR / 'backend' / '.env')

ADMIN_COOKIE_NAME = 'admin_session'
DEFAULT_SESSION_SECRET = 'detailing_street_secure_session_secret_2026_key'


class AdminSessionUser:
    is_authenticated = True
    is_anonymous = False

    def __init__(self, email: str):
        self.email = email


def verify_admin_session(token: str | None) -> str | None:
    if not token or token.count('.') != 1:
        return None

    payload_base64, signature = token.split('.', 1)
    if not re.fullmatch(r'[0-9a-fA-F]{64}', signature):
        return None

    secret = os.environ.get('ADMIN_SESSION_SECRET') or DEFAULT_SESSION_SECRET
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload_base64.encode('ascii'),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature.lower(), expected_signature):
        return None

    try:
        payload_bytes = base64.b64decode(payload_base64, validate=True)
        payload = json.loads(payload_bytes.decode('utf-8'))
    except (binascii.Error, UnicodeDecodeError, json.JSONDecodeError):
        return None

    if not isinstance(payload, dict):
        return None
    email = payload.get('email')
    expires_at = payload.get('exp')
    if (
        not isinstance(email, str)
        or not email.strip()
        or type(expires_at) not in (int, float)
        or time.time() * 1000 > expires_at
    ):
        return None

    configured_email = (
        os.environ.get('ADMIN_EMAIL')
        or os.environ.get('ADMIN_NOTIFICATION_EMAIL')
        or 'kenznajeeb@gmail.com'
    ).strip()
    if email.strip().lower() != configured_email.lower():
        return None

    return email.strip().lower()


class AdminSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get(ADMIN_COOKIE_NAME)
        email = verify_admin_session(token)
        if not email:
            return None
        return AdminSessionUser(email), token

    def authenticate_header(self, request):
        return 'AdminSession'
