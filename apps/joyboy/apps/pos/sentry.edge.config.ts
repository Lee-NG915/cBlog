// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note: This config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// In Sentry v10, this is called from instrumentation.js instead of auto-executing

import * as Sentry from '@sentry/nextjs';
import { EcEnv } from '@castlery/config';

export function initSentry() {
  if (EcEnv.NODE_ENV === 'development') {
    // console.info('Sentry Not Initialized in Development Environment.');
    return;
  }
  if (!process?.env?.NEXT_PUBLIC_SENTRY_DSN && !process?.env?.NEXT_PUBLIC_APPLICATION_ENV) {
    console.warn('Sentry DSN or Application Environment is not provided.');
    return;
  }
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APPLICATION_ENV,
    release: `joyboy-pos@${process.env.NEXT_PUBLIC_APPLICATION_ENV}@${process.env.NEXT_PUBLIC_VERSION || '0.0.0'}`,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
