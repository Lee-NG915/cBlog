// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// In Sentry v10, this is called from instrumentation.js instead of auto-executing

import * as Sentry from '@sentry/nextjs';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/server';

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

  // const isProd = process.env.NEXT_PUBLIC_APPLICATION_ENV?.includes('prod') || false;
  const appVersion = process.env.NEXT_PUBLIC_VERSION || '0.0.0';
  const appEnv = process.env.NEXT_PUBLIC_APPLICATION_ENV;

  try {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: appEnv,
      release: `joyboy-pos@${appEnv}@${appVersion}`,
      tracesSampler: (samplingContext) => {
        // Access transaction details from the sampling context
        const { name, parentSampled } = samplingContext;
        // Skip health checks entirely
        if (name && name.includes('health-check')) {
          return 0;
        }
        // If there's a parent sampling decision, inherit it
        if (parentSampled !== undefined) {
          return parentSampled;
        }
        // For everything else, use a low sampling rate
        return 0.001;
      },
      // Default tags
      initialScope: {
        tags: {
          app: 'pos-server',
          version: appVersion,
        },
      },

      // Disable debug by default, enable only when troubleshooting
      debug: false,

      // Uncomment to enable Spotlight in development
      // spotlight: process.env.NODE_ENV === 'development',
    });
  } catch (error) {
    logger.error('Failed to initialize Sentry on server', {
      error,
      environment: appEnv,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'missing',
    });
  }
}
