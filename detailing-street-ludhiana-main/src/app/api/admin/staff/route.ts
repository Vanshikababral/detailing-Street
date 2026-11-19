import { NextRequest } from 'next/server';
import { proxyStaffApi } from '@/lib/staffApiProxy';

export function GET(request: NextRequest) {
  return proxyStaffApi(request, '/api/staff/', 'GET');
}

export function POST(request: NextRequest) {
  return proxyStaffApi(request, '/api/staff/', 'POST');
}
