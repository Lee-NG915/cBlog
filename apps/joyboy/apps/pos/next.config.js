//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const { codeInspectorPlugin } = require('code-inspector-plugin');
const { withSentryConfig } = require('@sentry/nextjs');

const { version } = require('./package.json');
process.env.NEXT_PUBLIC_VERSION = version;

const assetPrefix = process.env.NODE_ENV === 'production' ? process.env.ASSETS_PATH : undefined;

/** 与 release / 运行时环境变量一致：*-test、*-uat 视为测试环境部署（production build 下也注入 Code Inspector） */
const posApplicationEnv = (process.env.APPLICATION_ENV || process.env.NEXT_PUBLIC_APPLICATION_ENV || '').toLowerCase();
const isPosTestEnvironmentDeploy =
  process.env.NODE_ENV === 'production' && (posApplicationEnv.includes('-test') || posApplicationEnv.includes('-uat'));

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  output: 'standalone',
  assetPrefix,
  webpack: (config, { dev, isServer }) => {
    const enableCodeInspectorClient = !isServer && (dev || isPosTestEnvironmentDeploy);
    if (enableCodeInspectorClient) {
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
    return config;
  },
  nx: {
    // Set this to true if you would like to to use SVGR
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
  // i18n: {
  //   locales: ['en','sg'],
  //   defaultLocale: 'en',
  // },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // i18n: {
  //   locales: ['en','sg'],
  //   defaultLocale: 'en',
  // },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    instrumentationHook: true,
    // 与 web 保持一致：优化 barrel 导入，减小 client bundle
    optimizePackageImports: [
      // Third-party packages
      '@mui/joy',
      'ramda',
      'react-use',
      'date-fns',
      'swiper',
      'react-hook-form',
      'react-slick',
      'google-libphonenumber',
      'moment-timezone',
      // Monorepo internal packages (from tsconfig.base.json paths)
      '@castlery/cms',
      '@castlery/config',
      '@castlery/data-tracking-events',
      '@castlery/fortress',
      '@castlery/fortress/Icons',
      '@castlery/modules-checkout-components',
      '@castlery/modules-checkout-domain',
      '@castlery/modules-checkout-services',
      '@castlery/modules-cms-components',
      '@castlery/modules-cms-domain',
      '@castlery/modules-cms-services',
      '@castlery/modules-composite-components',
      '@castlery/modules-composite-services',
      '@castlery/modules-dy-components',
      '@castlery/modules-dy-domain',
      '@castlery/modules-dy-services',
      '@castlery/modules-order-components',
      '@castlery/modules-order-domain',
      '@castlery/modules-order-services',
      '@castlery/modules-payment-components',
      '@castlery/modules-payment-domain',
      '@castlery/modules-payment-services',
      '@castlery/modules-posthog-components',
      '@castlery/modules-posthog-services',
      '@castlery/modules-product-components',
      '@castlery/modules-product-domain',
      '@castlery/modules-product-services',
      '@castlery/modules-promotion-components',
      '@castlery/modules-promotion-domain',
      '@castlery/modules-promotion-services',
      '@castlery/modules-retails-components',
      '@castlery/modules-retails-domain',
      '@castlery/modules-retails-services',
      '@castlery/modules-search-components',
      '@castlery/modules-search-domain',
      '@castlery/modules-tracking-components',
      '@castlery/modules-tracking-domain',
      '@castlery/modules-tracking-services',
      '@castlery/modules-user-components',
      '@castlery/modules-user-domain',
      '@castlery/modules-user-services',
      '@castlery/modules-others-components',
      '@castlery/modules-others-domain',
      '@castlery/modules-others-services',
      '@castlery/monorepo-features',
      '@castlery/monorepo-i18n',
      '@castlery/observability',
      '@castlery/plugin',
      '@castlery/seo',
      '@castlery/shared-components',
      '@castlery/shared-next-font',
      '@castlery/shared-persistence-kit',
      '@castlery/shared-redux-core',
      '@castlery/shared-redux-extra',
      '@castlery/shared-redux-services',
      '@castlery/shared-redux-store',
      '@castlery/shared-services',
      '@castlery/storyblok-addon',
      '@castlery/storyblok-to-storybook',
      '@castlery/storybook-host',
      '@castlery/types',
      '@castlery/utils',
    ],
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

const NxConfig = composePlugins(...plugins)(nextConfig);

// Injected content via Sentry wizard below
// In Sentry v10, all options are merged into the second parameter
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'castlery',
  project: 'joyboy-pos',
  // In Sentry v10, release is an object instead of a string
  release: {
    name: `joyboy-pos@${process.env.APPLICATION_ENV}@${version}`,
  },
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  // In Sentry v10, use webpack.treeshake.removeDebugLogging instead of disableLogger
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};
module.exports = withSentryConfig(NxConfig, sentryWebpackPluginOptions);
