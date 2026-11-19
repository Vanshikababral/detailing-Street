import { NextRequest, NextResponse } from 'next/server';

const DJANGO_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value || '';
    const cookieHeader = request.headers.get('cookie') || (token ? `admin_session=${token}` : '');
    const headers: Record<string, string> = {};
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${DJANGO_URL}/api/dashboard/`, {
      cache: 'no-store',
      headers,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}
