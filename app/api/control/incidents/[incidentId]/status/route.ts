import { NextResponse } from 'next/server';

import {
  errorResponse,
  normalizeIncidentDetail,
  requestBackendJson,
  type BackendIncidentDetail,
} from '@/lib/control-api';
import type { IncidentStatus } from '@/lib/control-types';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ incidentId: string }> },
) {
  try {
    const { incidentId } = await context.params;
    const body = (await request.json()) as { status?: IncidentStatus };

    const incident = await requestBackendJson<BackendIncidentDetail>(
      `/api/incidents/${incidentId}/status`,
      {
        method: 'PATCH',
        body: { status: body.status },
      },
    );

    return NextResponse.json(normalizeIncidentDetail(incident));
  } catch (error) {
    return errorResponse(error);
  }
}
