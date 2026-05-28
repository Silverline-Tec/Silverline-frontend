import { NextResponse } from 'next/server';

import {
  errorResponse,
  normalizeDashboardStats,
  requestBackendJson,
  type BackendDashboardStats,
} from '@/lib/control-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await requestBackendJson<BackendDashboardStats>('/api/stats');
    return NextResponse.json(normalizeDashboardStats(stats));
  } catch (error) {
    return errorResponse(error);
  }
}
