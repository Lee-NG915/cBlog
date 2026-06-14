/**
 * E2E-only route: triggers a server-side Sentry capture classified as upstream_5xx.
 *
 * Guard: only responds when SENTRY_E2E_ENABLED=1 (set by run-server-capture.sh).
 * Never active in production deployments.
 */
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { captureStructuredError } from '@castlery/observability/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!process.env.SENTRY_E2E_ENABLED) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const marker = request.nextUrl.searchParams.get('marker') || 'E2E_SERVER_UPSTREAM_TEST';

  // Simulate an upstream API returning 502. The message includes "502" so
  // classifyErrorBucketServer → upstream_5xx (message-based match: /5\d{2}/).
  // The .status property is also set so the statusCode path fires for belt-and-suspenders.
  const upstreamError = new Error(`Upstream API returned 502 — ${marker}`) as Error & { status?: number };
  upstreamError.status = 502;

  captureStructuredError(upstreamError, {
    extra: { marker, simulatedStatusCode: 502 },
  });

  // Flush ensures the event is delivered to mock-ingest before the response
  // is returned (and before the test reads the NDJSON file).
  await Sentry.flush(3000);

  return NextResponse.json({ captured: true, marker });
}
