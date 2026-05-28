import { NextResponse } from 'next/server';

import {
  errorResponse,
  normalizeWebhookSummary,
  requestBackendJson,
  type BackendWebhookSummary,
} from '@/lib/control-api';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ webhookId: string }> },
) {
  try {
    const { webhookId } = await context.params;
    const webhook = await requestBackendJson<BackendWebhookSummary>(
      `/api/webhooks/${webhookId}`,
      {
        method: 'DELETE',
      },
    );

    return NextResponse.json(normalizeWebhookSummary(webhook));
  } catch (error) {
    return errorResponse(error);
  }
}
