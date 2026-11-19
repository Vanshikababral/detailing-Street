import { NextRequest } from 'next/server';
import { proxyStaffApi } from '@/lib/staffApiProxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function forward(
  request: NextRequest,
  context: RouteContext,
  method: 'PUT' | 'PATCH' | 'DELETE'
) {
  const { id } = await context.params;
  return proxyStaffApi(request, `/api/staff/${encodeURIComponent(id)}/`, method);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return forward(request, context, 'PUT');
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return forward(request, context, 'PATCH');
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return forward(request, context, 'DELETE');
}
