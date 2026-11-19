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
  const cookie = request.headers.get('cookie');
  const headers = new Headers();
  if (cookie) headers.set('cookie', cookie);
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
