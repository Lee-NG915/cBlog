// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';

function initSentry(): void {
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

  // const isProd = EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('prod');
  const appVersion = process.env.NEXT_PUBLIC_VERSION || '0.0.0';
  const appEnv = process.env.NEXT_PUBLIC_APPLICATION_ENV;

  try {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: appEnv,
      release: `joyboy-pos@${appEnv}@${appVersion}`,

      // Performance monitoring
      tracesSampleRate: 0.001,

      // Session replay settings
      replaysOnErrorSampleRate: 0.001,
      replaysSessionSampleRate: 0.001,

      // Default tags
      initialScope: {
        tags: {
          app: 'pos-client',
          version: appVersion,
        },
      },

      // Disable in development, enable in debug mode when troubleshooting issues
      debug: false,

      // Filter noise from third-party scripts
      ignoreErrors: [
        // Third-party analytics and marketing tools
        /mulberry/i,
        /getmulberry/i,
        /klaviyo/i,
        /cookieyes/i,
        /friendbuy/i,

        // Common browser issues
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',

        // Browser extension errors
        /chrome-extension:\/\//i,
        /moz-extension:\/\//i,
        /safari-extension:\/\//i,

        // Android WebView interface errors
        'PerformanceMonitoringJavascriptInterface is not defined',

        // iOS WebView errors
        "Can't find variable: webkit",
        'WebKitBlobResource error',
      ],

      // Custom error filtering
      beforeSend(event, hint) {
        const errorMessage = event.message || '';
        const exception = event.exception?.values?.[0];
        const stacktrace = exception?.stacktrace;
        const frames = stacktrace?.frames || [];

        // Filter Android WebView JavascriptInterface errors
        if (
          errorMessage.includes('JavascriptInterface') ||
          errorMessage.includes('PerformanceMonitoringJavascriptInterface')
        ) {
          console.debug('Sentry: Ignoring Android WebView JavascriptInterface error:', errorMessage);
          return null;
        }

        // Filter iOS webkit.messageHandlers errors
        if (
          errorMessage.includes('messageHandlers') ||
          errorMessage.includes('window.webkit.messageHandlers') ||
          (errorMessage.includes('webkit') && errorMessage.includes('undefined is not an object'))
        ) {
          console.debug('Sentry: Ignoring webkit.messageHandlers error:', errorMessage);
          return null;
        }

        // Filter network errors from Mulberry plugin during page unload
        const networkErrors = ['Load failed', 'Network request failed', 'Failed to fetch', 'NetworkError'];
        if (networkErrors.some((pattern) => errorMessage.includes(pattern))) {
          const isMulberryError = frames.some((frame) => {
            const filename = frame.filename || '';
            return filename.includes('mulberry') || filename.includes('getmulberry');
          });

          if (isMulberryError) {
            // Check if error occurred during page unload
            const extraData = (event.extra as any)?.arguments?.[0];
            const isUnloadEvent = extraData?.type === 'unload' || errorMessage.includes('unload');

            if (isUnloadEvent) {
              console.debug('Sentry: Ignoring Mulberry network error during page unload:', errorMessage);
              return null;
            }
            // If not during unload, keep the error as it might be a real issue
          }
        }

        return event;
      },

      // Block errors from third-party URLs
      denyUrls: [
        /getmulberry\.com/i,
        /mulberry/i,
        /klaviyo/i,
        /friendbuy/i,
        /cookieyes/i,

        // Browser extensions
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
        /^safari-extension:\/\//i,
      ],
    });
  } catch (error) {
    logger.error('Failed to initialize Sentry on client', {
      error,
      environment: appEnv,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'missing',
    });
    // console.error('Failed to initialize Sentry:', error);
  }
}

initSentry();
