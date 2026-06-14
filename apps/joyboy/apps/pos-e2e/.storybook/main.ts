import type { StorybookConfig } from '@storybook/nextjs';
const config: StorybookConfig = {
  stories: [
    '../../../apps/pos/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../../libs/modules/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
    '../../../libs/shared/components/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
  ],
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
  features: {
    experimentalRSC: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  webpackFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        async_hooks: false,
      },
    };
    return config;
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
