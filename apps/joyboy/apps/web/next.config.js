// @ts-check
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// eslint-disable-next-line @typescript-eslint/no-var-requires

//https://dev.to/rafalsz/scaling-nextjs-with-redis-cache-handler-55lh
//https://medium.com/@mohsenmahoski/next-js-redis-cache-handler-4aa130e9c242

// 全路径缓存: https://nextjs.org/docs/app/building-your-application/caching#full-route-cache
// isr: https://www.youtube.com/watch?v=Bp5WqHN7i2o

const { composePlugins, withNx } = require('@nx/next');
const { execSync } = require('child_process');
const { codeInspectorPlugin } = require('code-inspector-plugin');
const path = require('path');

const withNextBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { version } = require('./package.json');
const { withSentryConfig } = require('@sentry/nextjs');

process.env.NEXT_PUBLIC_VERSION = version;

// E2E can force local static assets to avoid hitting remote CDN bundles.
const isE2ELocalAssets = process.env.E2E_LOCAL_ASSETS === '1';
const assetPrefix =
  process.env.NODE_ENV === 'production' && !isE2ELocalAssets ? `${process.env.ASSETS_PATH}/web` : undefined;
process.env.NEXT_PUBLIC_ASSET_PREFIX = assetPrefix;

//打包分析
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
let gitHash = 'unknown';
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  console.warn('⚠️  Unable to get git commit hash, using "unknown"');
}
process.env.NEXT_PUBLIC_GIT_HASH = gitHash;

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  output: 'standalone',
  assetPrefix,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  images: {
    // TODO https://nextjs.org/docs/app/api-reference/components/image#loaderfile
    // 后续这里要写一个和 cloudinary 参数配合的 loader
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/castlery/**',
      },
      {
        protocol: 'https',
        hostname: 's3-ap-southeast-1.amazonaws.com',
        pathname: '/production-static-images/**',
      },
      {
        protocol: 'https',
        hostname: 's3-ap-southeast-1.amazonaws.com',
        // pathname: '/castlery/image/**',
      },
      {
        protocol: 'https',
        hostname: 'img.castlery.sg',
        // pathname: '/castlery/image/**',
      },
      {
        protocol: 'https',
        hostname: 'production-static-images.s3.amazonaws.com',
        // pathname: '/castlery/image/**',
      },
      {
        protocol: 'https',
        hostname: 'd1qikdlbmwrjn6.cloudfront.net',
        // pathname: '/castlery/image/**',
      },
      {
        protocol: 'https',
        hostname: 'img.castlery.sg',
      },
      {
        protocol: 'https',
        hostname: 'production-static-images.s3-ap-southeast-1.amazonaws.com',
      },
    ],
    deviceSizes: [280, 420, 560, 750, 840, 1000, 1500, 1995],
  },
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    return [
      {
        source: '/:path/blog',
        // source: "/:path*",
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        source: '/:path/blog/:slug*',
        // source: "/:path*",
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/sg/shop-the-look',
        destination: '/sg/shop-the-look/living-room',
        permanent: true, // 这将使用 308 状态码（Next.js 的永久重定向）
      },
      {
        source: '/us/shop-the-look',
        destination: '/us/shop-the-look/living-room',
        permanent: true, // 这将使用 308 状态码（Next.js 的永久重定向）
      },
      {
        source: '/au/shop-the-look',
        destination: '/au/shop-the-look/living-room',
        permanent: true, // 这将使用 308 状态码（Next.js 的永久重定向）
      },
      {
        source: '/ca/shop-the-look',
        destination: '/ca/shop-the-look/living-room',
        permanent: true, // 这将使用 308 状态码（Next.js 的永久重定向）
      },
      {
        source: '/uk/shop-the-look',
        destination: '/uk/shop-the-look/living-room',
        permanent: true, // 这将使用 308 状态码（Next.js 的永久重定向）
      },
      {
        source: '/:region/rewards',
        destination: '/:region/the-castlery-club',
        permanent: true, // 这将使用 308 状态码（Next.js 的永久重定向）
      },
      {
        source: '/:region/account/rewards',
        destination: '/:region/account/the-castlery-club',
        permanent: true, // 这将使用 308 状态码（Next.js 的永久重定向）
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/static/:path*', // 用户请求的路径
        destination: '/:path*',
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    if (isServer && !dev) {
      const scriptPath = path.join(__dirname, './scripts/generate-bloom-filter.js');
      execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    }
    // code-inspector 会在每个 JSX 节点注入元信息，dev 编译/HMR 都有开销；改为按需启用
    // 需要时通过环境变量开启：INSPECTOR=true pnpm web:sg
    if (dev && !isServer && process.env.INSPECTOR === 'true') {
      config.plugins.push(
        codeInspectorPlugin({
          bundler: 'webpack',
          // 忽略 Fortress 组件库内部实现，让 Code Inspector 追踪到业务代码
          // 注：node_modules 默认已被忽略，无需显式配置
          exclude: [/libs\/fortress\/src/],
          editor: 'cursor',
          openIn: 'reuse',
          hotKeys: ['altKey', 'shiftKey'],
          showSwitch: false,
        })
      );
    }

    // https://stackoverflow.com/questions/71484777/module-not-found-cant-resolve-async-hooks
    config.resolve = {
      ...config.resolve,
      fallback: {
        async_hooks: false, // Prevent 'async_hooks' from being included in client-side bundles
      },
    };
    // config.optimization.sideEffects = true;
    return config;
  },

  // cacheHandler: require.resolve('./cache-handler.js'),
  cacheHandler: process.env.NODE_ENV === 'production' ? require.resolve('./cache-handler.js') : undefined,
  cacheMaxMemorySize: 0, // disable default in-memory caching
  // https://nextjs.org/docs/app/building-your-application/configuring/typescript#statically-typed-links
  experimental: {
    // reactCompiler: true,// 升级到react v19+可用, 但是目前react v18.3.1 不支持, 所以暂时不启用
    // typedRoutes 在 dev 模式下每次增量编译都会扫描全部路由生成类型，开销大；仅生产构建启用
    typedRoutes: process.env.NODE_ENV === 'production',
    // 将 client/server webpack 编译分进程并行，缩短冷启动与增量编译时间
    webpackBuildWorker: true,
    instrumentationHook: true,
    // Only third-party npm packages with large barrel files should be listed here.
    // Do NOT add internal @castlery/* monorepo packages — they resolve to source files
    // via tsconfig path aliases and are already watched by webpack directly.
    // Adding internal packages breaks HMR: Next.js caches optimized stubs and stops
    // detecting file changes in libs/.
    optimizePackageImports: [
      '@mui/joy',
      'ramda',
      'react-use',
      'date-fns',
      'swiper',
      'react-hook-form',
      'react-slick',
      'google-libphonenumber',
      'moment-timezone',
      // Kept here to ensure react-i18next and internal i18n consumers share the same
      // React instance — removing this causes "createContext is not a function" at runtime.
      '@castlery/monorepo-i18n',
    ],
    ...(process.env.NODE_ENV !== 'production'
      ? {
          serverActions: {
            allowedOrigins: [
              'www-test.castlery.com',
              'www-new-test.castlery.com',
              '127.0.0.1:7780',
              'localhost:7780',
              'www-test.castlery.co',
              'www-new-test.castlery.co',
            ],
          },
        }
      : {}),
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withNextBundleAnalyzer,
];

const NxConfig = composePlugins(...plugins)(nextConfig);

// Injected content via Sentry wizard below
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'castlery',
  project: 'joyboy-web',

  release: {
    name: `joyboy-web@${process.env.APPLICATION_ENV}@${version}@${gitHash}`,
  },

  authToken: process.env.SENTRY_AUTH_TOKEN,

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: process.env.NODE_ENV === 'production',
  automaticVerifyOnUpload: true,

  webpack: {
    treeshake: {
      removeDebugLogging: true,
      removeTracing: false,
      excludeReplayIframe: true,
      excludeReplayShadowDOM: true,
      excludeReplayCompressionWorker: true,
    },
  },
};

// Skip Sentry in dev: withSentryConfig adds webpack overhead on every incremental compile
module.exports =
  process.env.NODE_ENV === 'production' ? withSentryConfig(NxConfig, sentryWebpackPluginOptions) : NxConfig;

//https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis
