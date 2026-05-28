import { NextResponse } from 'next/server';

import {
  errorResponse,
  parsePrometheusMetrics,
  requestBackendJson,
  requestBackendText,
  type BackendHealthSnapshot,
} from '@/lib/control-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [health, metricsText] = await Promise.all([
      requestBackendJson<BackendHealthSnapshot>('/healthz', { authenticated: false }),
      requestBackendText('/metrics', { authenticated: false }),
    ]);

    return NextResponse.json({
      health,
      metrics: parsePrometheusMetrics(metricsText),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
