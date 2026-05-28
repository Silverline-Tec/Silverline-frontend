import { NextRequest, NextResponse } from 'next/server';

import {
  errorResponse,
  normalizeIncidentSummary,
  pickSearchParams,
  requestBackendJson,
  type BackendIncidentSummary,
} from '@/lib/control-api';

export const dynamic = 'force-dynamic';

const ALLOWED_QUERY_KEYS = [
  'node_id',
  'event_type',
  'status',
  'priority',
  'from_ts',
  'to_ts',
  'limit',
  'offset',
];

export async function GET(request: NextRequest) {
  try {
    const incidents = await requestBackendJson<BackendIncidentSummary[]>('/api/incidents', {
      searchParams: pickSearchParams(request.nextUrl.searchParams, ALLOWED_QUERY_KEYS),
    });

    return NextResponse.json(incidents.map(normalizeIncidentSummary));
  } catch (error) {
    return errorResponse(error);
  }
}
