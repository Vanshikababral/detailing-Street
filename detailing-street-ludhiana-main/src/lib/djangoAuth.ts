/**
 * djangoAuth.ts
 *
 * Fetches and caches a Django JWT for server-side Next.js API routes that
 * proxy to the Django backend. The token is generated from the same admin
 * credentials stored in .env.local.
 *
 * Usage inside any /api/admin/* route handler:
 *   const token = await getDjangoToken();
 *   fetch(`${DJANGO_URL}/api/appointments/`, {
 *     headers: { Authorization: `Bearer ${token}` },
 *   });
 */

const DJANGO_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';

let _cachedToken: string | null = null;
let _tokenExpiry = 0;

export async function getDjangoToken(): Promise<string> {
  const now = Date.now();

  // Reuse cached token if it still has > 5 minutes left
  if (_cachedToken && _tokenExpiry - now > 5 * 60 * 1000) {
    return _cachedToken;
  }

  const res = await fetch(`${DJANGO_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Django login failed: ${res.status}`);
  }

  const data = await res.json();
  _cachedToken = data.token as string;
  // Django token expires in 24 h; cache for 23 h
  _tokenExpiry = now + 23 * 60 * 60 * 1000;

  return _cachedToken;
}

export function djangoAuthHeaders(): Record<string, string> {
  // Synchronous version — only safe after getDjangoToken() was already awaited
  if (!_cachedToken) {
    throw new Error('Django token not yet fetched. Call getDjangoToken() first.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${_cachedToken}`,
  };
}
