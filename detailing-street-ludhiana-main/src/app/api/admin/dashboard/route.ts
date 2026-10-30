import { NextResponse } from 'next/server';

const DJANGO_URL = process.env.DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${DJANGO_URL}/api/dashboard/`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 503 });
  }
}
