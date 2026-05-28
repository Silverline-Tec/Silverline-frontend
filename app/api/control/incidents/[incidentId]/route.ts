import { NextResponse } from 'next/server';

import {
  errorResponse,
  normalizeIncidentDetail,
  requestBackendJson,
  type BackendIncidentDetail,
} from '@/lib/control-api';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ incidentId: string }> },
) {
  try {
    const { incidentId } = await context.params;
    const incident = await requestBackendJson<BackendIncidentDetail>(
      `/api/incidents/${incidentId}`,
    );

    return NextResponse.json(normalizeIncidentDetail(incident));
  } catch (error) {
    return errorResponse(error);
  }
}
