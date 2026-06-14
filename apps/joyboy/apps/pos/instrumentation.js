export async function register() {
  // Initialize Sentry for server and edge runtimes
  // In Sentry v10, initialization must happen in instrumentation.js
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Import and call server-side Sentry initialization
      const { initSentry } = await import('./sentry.server.config.ts');
      initSentry();
    } else if (process.env.NEXT_RUNTIME === 'edge') {
      // Import and call edge Sentry initialization
      const { initSentry } = await import('./sentry.edge.config.ts');
      initSentry();
    }
  }
}
