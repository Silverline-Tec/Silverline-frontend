import { NextResponse } from 'next/server';

import {
  errorResponse,
  normalizeWebhookSummary,
  requestBackendJson,
  type BackendWebhookSummary,
} from '@/lib/control-api';
import type { WebhookCreateInput } from '@/lib/control-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const webhooks = await requestBackendJson<BackendWebhookSummary[]>('/api/webhooks');
    return NextResponse.json(webhooks.map(normalizeWebhookSummary));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebhookCreateInput;
    const webhook = await requestBackendJson<BackendWebhookSummary>('/api/webhooks', {
      method: 'POST',
      body: {
        name: body.name,
        url: body.url,
        event_types: body.eventTypes,
        priorities: body.priorities,
        secret: body.secret,
      },
    });

    return NextResponse.json(normalizeWebhookSummary(webhook), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
