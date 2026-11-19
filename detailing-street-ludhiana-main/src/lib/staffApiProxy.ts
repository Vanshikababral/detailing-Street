import { NextRequest, NextResponse } from 'next/server';

type StaffApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function proxyStaffApi(
  request: NextRequest,
  path: string,
  method: StaffApiMethod
) {
  const djangoBaseUrl = (process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000')
    .replace(/\/+$/, '');
  const query = method === 'GET' ? request.nextUrl.search : '';
  const token = request.cookies.get('admin_session')?.value || '';
  const cookie = request.headers.get('cookie') || (token ? `admin_session=${token}` : '');
  const headers = new Headers();
  headers.set('x-admin-secret', process.env.ADMIN_SESSION_SECRET || 'detailing_street_secure_session_secret_2026_key');
  if (cookie) headers.set('cookie', cookie);
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (method !== 'GET' && method !== 'DELETE') {
    headers.set('content-type', request.headers.get('content-type') || 'application/json');
  }

  try {
    const response = await fetch(`${djangoBaseUrl}${path}${query}`, {
      method,
      headers,
      body: method === 'GET' || method === 'DELETE' ? undefined : await request.text(),
      cache: 'no-store',
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Django staff API request failed:', error);
    return NextResponse.json(
      { success: false, error: 'The staff service is unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
