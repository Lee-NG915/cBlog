import { EcEnv } from '@castlery/config';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'development') {
    // https://docs.datadoghq.com/tracing/trace_collection/automatic_instrumentation/dd_libraries/nodejs/
    const tracerLib = await import('dd-trace');
    const tracer = tracerLib.default;

    tracer.init({ logInjection: true, runtimeMetrics: true });
    // https://docs.datadoghq.com/tracing/trace_collection/custom_instrumentation/nodejs/otel/#filtering-requests
    tracer.use('http', {
      blocklist: [
        `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/health-check`,
        `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/api/health-check`,
        '/ping',
      ],
    });
    tracer.use('next');

    // const { registerInitialCache } = await import('@neshca/cache-handler/instrumentation');
    // // Assuming that your CacheHandler configuration is in the root of the project and the instrumentation is in the src directory.
    // // Please adjust the path accordingly.
    // // CommonJS CacheHandler configuration is also supported.
    // const CacheHandler = (await import('./cache-handler.js')).default;

    // await registerInitialCache(CacheHandler, {
    //   // By default, it populates the cache with pre-rendered pages, routes, and fetch calls.
    //   // You can disable these features by setting the options to false.
    //   // For example, if you want to populate the cache with only pre-rendered pages, you can set the options as follows:
    //   fetch: false,
    //   routes: false,
    // });
  }

  // Initialize Sentry for server and edge runtimes
  // In Sentry v10, initialization must happen in instrumentation.js
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Import and call server-side Sentry initialization
      const sentryServerConfig = await import('./sentry.server.config.ts');
      const initSentry = sentryServerConfig.initSentry ?? sentryServerConfig.default;
      if (typeof initSentry === 'function') {
        initSentry();
      }
    } else if (process.env.NEXT_RUNTIME === 'edge') {
      // Import and call edge Sentry initialization
      const sentryEdgeConfig = await import('./sentry.edge.config.ts');
      const initSentry = sentryEdgeConfig.initSentry ?? sentryEdgeConfig.default;
      if (typeof initSentry === 'function') {
        initSentry();
      }
    }
  }
}
