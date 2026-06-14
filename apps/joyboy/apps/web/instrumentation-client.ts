// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { EcEnv } from '@castlery/config';
import {
  logger,
  clientBeforeSend,
  CRITICAL_THIRD_PARTY_PATTERNS,
  THIRD_PARTY_PATTERNS,
} from '@castlery/observability/client';

const DEFAULT_TRACE_SAMPLE_RATE = 0.001;
const CHECKOUT_TRACE_SAMPLE_RATE = 0.2;
const CRITICAL_TRANSACTION_TRACE_SAMPLE_RATE = 1;

function getSamplingName(samplingContext: Record<string, any>): string {
  return [
    samplingContext.name,
    samplingContext.attributes?.['http.target'],
    samplingContext.attributes?.['http.route'],
    window?.location?.pathname,
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

function initSentry(): void {
  // Skip initialization in development environment
  if (EcEnv.NODE_ENV === 'development') {
    return;
  }

  // Validate required environment variables
  if (!process?.env?.NEXT_PUBLIC_SENTRY_DSN || !process?.env?.NEXT_PUBLIC_APPLICATION_ENV) {
    logger.warn(
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
        Sentry.browserTracingIntegration({
          shouldCreateSpanForRequest: (url) => {
            return !url.match(/\/health\/?$/);
          },
          enableInp: false,
        }),
        Sentry.httpClientIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ['error'] }),
      ],
      enableLogs: true,
      tracePropagationTargets: ['localhost', /^https:\/\/.*\.castlery\.com/, /^\/api\//],
      // This option is required for capturing headers and cookies.
      sendDefaultPii: false,
      // Performance monitoring
      tracesSampler: (samplingContext) => {
        const { parentSampled } = samplingContext;

        if (parentSampled !== undefined) {
          return parentSampled;
        }

        if (shouldFullySampleTransaction(samplingContext as Record<string, any>)) {
          return CRITICAL_TRANSACTION_TRACE_SAMPLE_RATE;
        }

        if (shouldPreferTransactionSampling(samplingContext as Record<string, any>)) {
          return CHECKOUT_TRACE_SAMPLE_RATE;
        }

        return DEFAULT_TRACE_SAMPLE_RATE;
      },

      // Session replay settings
      replaysOnErrorSampleRate: 0.001,
      replaysSessionSampleRate: 0.001,

      // Default tags
      initialScope: {
        tags: {
          app: 'web-client',
          version: appVersion,
        },
      },

      // Disable in development, enable in debug mode when troubleshooting issues
      // Set to true to see which errors are being filtered in console
      debug: false,

      // Only keep the most specific ignoreErrors patterns that are definitely noise
      // ⚠️ IMPORTANT: Do NOT add critical services here (DynamicYield, Algolia, Stripe, PayPal, CASA, etc.)
      ignoreErrors: [
        // Common browser issues that don't affect user experience
        'Non-Error promise rejection captured',
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',

        // Specific third-party script errors that are known noise
        'Javascript error: Script error. on line 0',

        // Browser extension errors
        /chrome-extension:\/\//i,
        /moz-extension:\/\//i,
        /safari-extension:\/\//i,

        // Common iOS Safari errors
        'WebKitBlobResource error',
        "Can't find variable: webkit",

        // Android WebView interface errors
        'PerformanceMonitoringJavascriptInterface is not defined',

        // Hydration warnings (handled by React, not user-facing errors)
        /Hydration failed/i,
        /There was an error while hydrating/i,
        /Text content does not match server-rendered HTML/i,

        // Aborted requests (user navigated away)
        'AbortError: The operation was aborted',
        'The user aborted a request',

        // Synchronous XHR errors during page dismissal (harmless browser behavior)
        /Synchronous XHR in page dismissal/i,
        /Failed to load.*Synchronous XHR in page dismissal/i,

        // Storage access errors (privacy mode, browser settings, etc.)
        /Failed to read the 'sessionStorage' property from 'Window': Access is denied/i,
        /Failed to read the 'localStorage' property from 'Window': Access is denied/i,
        /SecurityError.*sessionStorage/i,
        /SecurityError.*localStorage/i,

        // Random script errors with no stack trace
        'Script error',

        // Chunk loading errors (usually retry mechanisms handle these)
        /Loading chunk \d+ failed/i,
        /ChunkLoadError/i,

        // Third-party service errors (NON-CRITICAL analytics only)
        /google-analytics/i,
        /googletagmanager/i,
        /gtag/i,

        // ⚠️ NOTE: Stripe/PayPal errors are NOT filtered - they're critical services
        // ⚠️ NOTE: DynamicYield errors are NOT filtered - can cause white screen
        // ⚠️ NOTE: Algolia errors are NOT filtered - affects search functionality
        // ⚠️ NOTE: CASA errors are NOT filtered - must be kept for SC routing

        // Content Security Policy violations from third parties
        /Refused to execute inline script/i,

        // Safari specific issues
        /webkit-masked-url/i,
        /evaluating 'webkit'/i,

        // Ad blockers and privacy extensions
        /adblock/i,
        /privacy-badger/i,
        /ghostery/i,

        // Third-party analytics and marketing tools (based on production data)
        /rudderanalytics/i,
        /klaviyo/i,
        /cookieyes/i,
        /friendbuy/i,
        /mulberry/i,
        /getmulberry/i,
        /ptengine/i,

        // Third-party ad services
        /adsbygoogle/i,
        /teads/i,

        // Browser-specific errors
        /evaluating 'window\.webkit'/i,
        /window\.webkit\.messageHandlers/i,
        /messageHandlers/i,
        /_AutofillCallbackHandler/i,
      ],

      // Custom error filtering with context-aware logic
      beforeSend(event, hint) {
        return clientBeforeSend(event, hint, {
          userAgent: navigator?.userAgent || '',
          isOnline: navigator?.onLine !== false,
          language: navigator?.language || '',
          locationHref: window?.location?.href || '',
          logDebug: (msg, extra) => logger.debug(msg, extra),
        });
      },

      // denyUrls 从 THIRD_PARTY_PATTERNS 派生 — 添加新三方域名只需改 error-bucket.ts，不需要改这里
      // CRITICAL 服务（DY、Algolia、Stripe、PayPal、CASA）在派生时被过滤掉，不进 denyUrls，走 beforeSend 正常流程
      denyUrls: [
        ...THIRD_PARTY_PATTERNS.filter(
          (p) => !CRITICAL_THIRD_PARTY_PATTERNS.some((c) => c === p || p.includes(c) || c.includes(p))
        ).map((p) => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')),
        // URL scheme 级别的屏蔽（无法用域名字符串表达，保留为显式 regex）
        /^chrome:\/\//i,
        /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb localhost port
      ],
    });
  } catch (error) {
    logger.error('Failed to initialize Sentry on client', {
      error,
      environment: appEnv,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'missing',
    });
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

initSentry();
