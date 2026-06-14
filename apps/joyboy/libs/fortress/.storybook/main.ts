import type { StorybookConfig } from '@storybook/react-vite';
import * as dotenv from 'dotenv';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { mergeConfig } from 'vite';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Use import.meta.url to get __dirname equivalent in ESM
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(projectRoot, '../.env') });

const SUPPORTED_PREFIXES = [
  'NEXT_PUBLIC_',
  // 'GOOGLE_',
  // 'DY_',
  // 'REDIS_',
  // 'YOTPO_',
  'NODE_ENV',
  // 'ELASTICSEARCH_',
  'AUTH_',
];

// 基于实际测试，只需要提供 NEXT_PUBLIC_LOCALE 即可
const envDefine: Record<string, string> = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_LOCALE: 'en-SG',
  NEXT_PUBLIC_COUNTRY: 'SG',
};

// 收集其他可能需要的环境变量
for (const [key, val] of Object.entries(process.env)) {
  if (SUPPORTED_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    envDefine[key] = val ?? '';
  }
}

let stories = ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'];

if (process.env.TEST_FAILURES) {
  stories = ['../expected-failures/*.stories.@(js|jsx|ts|tsx)'];
}

const config: StorybookConfig = {
  stories,
  /**
   * storybook8.3 useHook 会报错
   * storybook8.2.9 mdx 文件无法解析
   */
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
    {
      name: '@chromatic-com/storybook',
      options: {
        // 确保Chromatic插件使用我们的配置
        projectToken: 'chpt_68cd5d09d39021f',
        // 关键配置：使用开发服务器而不是构建
        storybookUrl: 'auto', // 自动使用当前运行的开发服务器
        skip: false,
        skipTurboSnap: true, // 禁用TurboSnap
        disableTurboSnapshots: true, // 禁用TurboSnapshots
        exitZeroOnChanges: true,
        preserveMissing: true,
        debug: true,
      },
    },
    '@storybook/addon-interactions',
    '@storybook/addon-designs',
    '@storybook/addon-coverage',
    '@storybook/addon-controls',
    '@storybook/addon-mdx-gfm',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        // viteConfigPath: 'libs/fortress/vite.config.storybook.ts',
        viteConfigPath: path.resolve(projectRoot, '../vite.config.storybook.ts'),
      },
    },
  },
  docs: {
    autodocs: true,
    defaultName: 'Document',
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [nxViteTsPaths()],
      resolve: {
        alias: {
          // 避免将目录当作模块读取导致的 EISDIR 错误
          '@castlery/fortress/Icons': path.resolve(projectRoot, '../src/Icons/index.ts'),
          // Node.js 内置模块 polyfill（Storybook 浏览器环境）
          crypto: path.resolve(projectRoot, 'polyfills.js'),
          stream: path.resolve(projectRoot, 'polyfills.js'),
          buffer: path.resolve(projectRoot, 'polyfills.js'),
          util: path.resolve(projectRoot, 'polyfills.js'),
        },
      },
      define: {
        __dirname: JSON.stringify(process.cwd()), // solve __dirname is not defined
        'process.env': {
          ...envDefine,
        },
        global: 'globalThis',
      },
    }),
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
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
//
