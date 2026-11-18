export const ADMIN_COOKIE_NAME = 'admin_session';

export interface AdminSessionPayload {
  email: string;
  role: string;
  exp: number;
}

/**
 * Retrieves the dynamic admin credentials from environment variables.
 * If ADMIN_EMAIL or ADMIN_NOTIFICATION_EMAIL is updated in .env / .env.local,
 * the required login email dynamically updates immediately.
 */
export function getAdminCredentials() {
  const email = (
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    'kenznajeeb@gmail.com'
  ).trim();

  const password = (
    process.env.ADMIN_PASSWORD ||
    'Admin@123'
  ).trim();

  return { email, password };
}

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  'detailing_street_secure_session_secret_2026_key';

function toBase64(str: string): string {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, 'utf-8').toString('base64');
}

function fromBase64(str: string): string {
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(str)));
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const buf = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function getCryptoKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages
  );
}

/**
 * Creates a signed, tamper-proof session token valid for 7 days.
 */
export async function createAdminSessionToken(email: string, role = 'Owner'): Promise<string> {
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = toBase64(payloadJson);

  const key = await getCryptoKey(SESSION_SECRET, ['sign']);
  const encoder = new TextEncoder();
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadBase64));
  const sigHex = bufferToHex(sigBuffer);

  return `${payloadBase64}.${sigHex}`;
}

/**
 * Verifies the token signature, checks expiration, and validates that the token
 * matches the current dynamic admin email in the environment.
 */
export async function verifyAdminSessionToken(token?: string | null): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, sigHex] = parts;

  try {
    const key = await getCryptoKey(SESSION_SECRET, ['verify']);
    const encoder = new TextEncoder();
    const sigBytes = hexToBytes(sigHex);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes as unknown as BufferSource, encoder.encode(payloadBase64));
    if (!isValid) return null;

    const payloadJson = fromBase64(payloadBase64);
    const payload: AdminSessionPayload = JSON.parse(payloadJson);

    if (!payload.exp || Date.now() > payload.exp) return null;

    // Dynamic verification: If the email was changed in .env, require session email to match the current configured admin email
    const creds = getAdminCredentials();
    if (payload.email.toLowerCase() !== creds.email.toLowerCase()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

