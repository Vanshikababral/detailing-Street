import { NextRequest, NextResponse } from 'next/server';
import { sendStatusUpdateEmail } from '@/lib/mailer';

const DJANGO_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${DJANGO_URL}/api/appointments/`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${DJANGO_URL}/api/appointments/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success && data.appointment) {
      sendStatusUpdateEmail({
        bookingId: data.appointment.bookingId,
        customerName: data.appointment.customerName,
        phoneNumber: data.appointment.phoneNumber,
        email: data.appointment.email,
        service: data.appointment.service,
        status: data.appointment.status,
      }).catch((e) => console.error('[Mailer Error]:', e));
    }

    return NextResponse.json(data);
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
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}
