// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// In Sentry v10, this is called from instrumentation.js instead of auto-executing

import * as Sentry from '@sentry/nextjs';
import { EcEnv } from '@castlery/config';
import { logger, classifyErrorBucketServer } from '@castlery/observability/server';

const DEFAULT_TRACE_SAMPLE_RATE = 0.001;
const CHECKOUT_TRACE_SAMPLE_RATE = 0.2;
const CRITICAL_TRANSACTION_TRACE_SAMPLE_RATE = 1;

function getSamplingName(samplingContext: Record<string, any>): string {
  return [
    samplingContext.name,
    samplingContext.attributes?.['http.target'],
    samplingContext.attributes?.['http.route'],
    samplingContext.normalizedRequest?.url,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function shouldPreferTransactionSampling(samplingContext: Record<string, any>): boolean {
  const samplingName = getSamplingName(samplingContext);
  return /(checkout|payment|grabpay|paypal|zippay|capture|success)/.test(samplingName);
}

function shouldFullySampleTransaction(samplingContext: Record<string, any>): boolean {
  const samplingName = getSamplingName(samplingContext);
  return /(payment|capture|grabpay|paypal|zippay|success)/.test(samplingName);
}

export function initSentry(): void {
  // Skip initialization in development environment
  if (EcEnv.NODE_ENV === 'development') {
    return;
  }

  // Validate required environment variables
  if (!process?.env?.NEXT_PUBLIC_SENTRY_DSN || !process?.env?.NEXT_PUBLIC_APPLICATION_ENV) {
    console.warn(
      'Sentry initialization failed: Missing required environment variables (NEXT_PUBLIC_SENTRY_DSN or NEXT_PUBLIC_APPLICATION_ENV)'
    );
    return;
  }

  const appVersion = process.env.NEXT_PUBLIC_VERSION || '0.0.0';
  const appEnv = process.env.NEXT_PUBLIC_APPLICATION_ENV;
  const gitHash = process.env.NEXT_PUBLIC_GIT_HASH || 'unknown';

  const release = `joyboy-web@${appEnv}@${appVersion}@${gitHash}`;

  try {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: appEnv,
      release,
      integrations: [
        // 只添加自定义集成，默认集成（包括 nativeNodeFetchIntegration）会自动启用
        Sentry.consoleLoggingIntegration({ levels: ['error'] }),
      ],
      enableLogs: true,
      tracesSampler: (samplingContext) => {
        const { name, parentSampled } = samplingContext;
        if (name && name.includes('health-check')) {
          return 0;
        }
        if (parentSampled !== undefined) {
          return parentSampled;
        }
        if (shouldFullySampleTransaction(samplingContext as Record<string, any>)) {
          return CRITICAL_TRANSACTION_TRACE_SAMPLE_RATE;
        }
        if (shouldPreferTransactionSampling(samplingContext as Record<string, any>)) {
          return CHECKOUT_TRACE_SAMPLE_RATE;
        }
        // For everything else, use a low sampling rate
        return DEFAULT_TRACE_SAMPLE_RATE;
      },
      initialScope: {
        tags: {
          app: 'web-server',
          version: appVersion,
        },
      },
      beforeSend(event, hint) {
        const error = hint?.originalException;
        const message = event.message ?? (error instanceof Error ? error.message : String(error ?? ''));
        const errorName = (error instanceof Error ? error.name : undefined) ?? event.exception?.values?.[0]?.type;
        const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
        const statusCode =
          ((event.contexts?.response as Record<string, unknown> | undefined)?.status_code as number | undefined) ??
          (event.extra?.statusCode as number | undefined) ??
          ((hint?.originalException as { status?: number } | null)?.status as number | undefined);

        const mechanism = event.exception?.values?.[0]?.mechanism;
        const isExplicitCapture = mechanism?.handled === true && mechanism?.type === 'generic';
        const { error_bucket, bucket_confidence } = classifyErrorBucketServer({
          message,
          errorName,
          frames: frames.map((f) => ({ filename: f.filename })),
          statusCode,
          isExplicitCapture,
        });

        event.tags = { ...event.tags, error_bucket, bucket_confidence };
        return event;
      },
      debug: false,
    });
  } catch (error) {
    logger.error('Failed to initialize Sentry on server', {
      error,
      environment: appEnv,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'missing',
    });
  }
}
