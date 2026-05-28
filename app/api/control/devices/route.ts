import { NextResponse } from 'next/server';

import {
  errorResponse,
  normalizeDeviceSummary,
  requestBackendJson,
  type BackendDeviceSummary,
} from '@/lib/control-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const devices = await requestBackendJson<BackendDeviceSummary[]>('/api/devices');
    return NextResponse.json(devices.map(normalizeDeviceSummary));
  } catch (error) {
    return errorResponse(error);
  }
}
