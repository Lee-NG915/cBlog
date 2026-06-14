import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../../../libs/modules/checkout/components/src/lib/web-checkout-layout/*.stories.@(ts|tsx)'],
  staticDirs: ['../public'],
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
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  env: (config) => {
    return {
      ...config,
      ...(process.env as any),
    };
  },
  docs: {
    autodocs: true,
    defaultName: 'Document',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  features: {
    experimentalRSC: true,
  },
  webpackFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'react-facebook-login': path.resolve(__dirname, './stubs/react-facebook-login.tsx'),
      },
      fallback: {
        ...config.resolve?.fallback,
        async_hooks: false,
      },
    };
    return config;
  },
};

export default config;
