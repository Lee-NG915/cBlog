import type { StorybookConfig } from '@storybook/nextjs';
/**
 * @see https://github.com/shilman/storybook-rsc-demo
 * @see https://storybook.js.org/blog/storybook-react-server-components
 */

const config: StorybookConfig = {
  stories: [
    '../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../modules/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../../libs/shared/components/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../../apps/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
  ],

  addons: [
    '@storybook/addon-storysource',
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-designs',
    '@storybook/addon-coverage',
    '@storybook/addon-controls',
    '@storybook/addon-mdx-gfm',
    // '@castlery/addon-nest-controls',
    '../../../tools/addon-nest-controls/.storybook/local-preset.js',
  ],

  // features: {},
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  staticDirs: ['../../../apps/pos/public', '../../../apps/web/public', '../public'],

  env: (config) => {
    return {
      ...config,
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE || 'en-SG',
      NEXT_PUBLIC_APPLICATION_ENV: process.env.NEXT_PUBLIC_APPLICATION_ENV || 'sg-test',
      NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST || 'https://api.castlery.com',
      NEXT_PUBLIC_COUNTRY: process.env.NEXT_PUBLIC_COUNTRY || 'SG',
      NEXT_PUBLIC_CHANNEL: process.env.NEXT_PUBLIC_CHANNEL || 'WEB',
      NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX',
      ...(process.env as any),
    };
  },

  docs: {
    autodocs: true,
    defaultName: 'Document',
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // Speeds up Storybook build time
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
      // Makes union prop types like variant and size appear as select controls
      shouldExtractLiteralValuesFromEnum: true,
      // Makes string and boolean types that can be undefined appear as inputs and switches
      shouldRemoveUndefinedFromOptional: true,
      // Filter out third-party props from node_modules except @mui packages
      propFilter: (prop) => (prop.parent ? !/node_modules\/(?!@mui)/.test(prop.parent.fileName) : true),
    },
  },

  features: {
    experimentalRSC: true,
  },

  refs: () => {
    // (config, { configType }) => {
    // if (configType === 'DEVELOPMENT') {
    return {
      web: {
        title: 'WEB Visual',
        url: 'http://localhost:6007',
      },
      pos: {
        title: 'POS Visual',
        url: 'http://localhost:6008',
      },
      fortress: {
        title: 'Fortress Visual',
        url: 'http://localhost:6005',
      },
    };
    // }
    // return {
    //   react: {
    //     title: 'Composed React Storybook running in production',
    //     url: 'https://your-production-react-storybook-url',
    //   },
    //   angular: {
    //     title: 'Composed Angular Storybook running in production',
    //     url: 'https://your-production-angular-storybook-url',
    //   },
    // };
  },
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
