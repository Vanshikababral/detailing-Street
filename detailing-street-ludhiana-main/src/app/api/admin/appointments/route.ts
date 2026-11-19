import { NextRequest, NextResponse } from 'next/server';
import { sendStatusUpdateEmail } from '@/lib/mailer';

const DJANGO_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';

function getForwardHeaders(request: NextRequest, isJson = false): HeadersInit {
  const token = request.cookies.get('admin_session')?.value || '';
  const cookieHeader = request.headers.get('cookie') || (token ? `admin_session=${token}` : '');
  const headers: Record<string, string> = {};
  if (cookieHeader) headers['Cookie'] = cookieHeader;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${DJANGO_URL}/api/appointments/`, {
      cache: 'no-store',
      headers: getForwardHeaders(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${DJANGO_URL}/api/appointments/`, {
      method: 'PATCH',
      headers: getForwardHeaders(request, true),
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success && data.appointment && body.status) {
      sendStatusUpdateEmail({
        bookingId: data.appointment.bookingId,
        customerName: data.appointment.customerName,
        phoneNumber: data.appointment.phoneNumber,
        email: data.appointment.email,
        service: data.appointment.service,
        status: data.appointment.status,
      }).catch((e) => console.error('[Mailer Error]:', e));
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const res = await fetch(`${DJANGO_URL}/api/appointments/?id=${id}`, {
      method: 'DELETE',
      headers: getForwardHeaders(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}
