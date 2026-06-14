// .storybook/preview.tsx
import React from 'react';
// import { ThemeProvider } from '../src/fortress/Theme';
import { Preview } from '@storybook/react';
import { StoreProvider } from '@castlery/shared-components';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { initialize, mswLoader } from 'msw-storybook-addon';
// Registers the msw addon
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { CssBaseline, defaultTheme, fortressV2Theme, ThemeCompositionProvider } from '@castlery/fortress';
// import { EcEnv } from '@castlery/config';
/*ß
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize({});

// export const globalTypes = {
//   theme: {
//     name: 'Theme',
//     description: '切换主题',
//     defaultValue: 'default',
//     toolbar: {
//       icon: 'paintbrush',
//       items: [
//         { value: 'default', title: '默认主题' },
//         { value: 'fortressV2', title: 'V2 主题' },
//       ],
//       dynamicTitle: true,
//     },
//   },
// };

export const IPad11ProViewPort = {
  viewports: {
    ...INITIAL_VIEWPORTS,
    ...MINIMAL_VIEWPORTS,
  },
  defaultViewport: 'ipad11p',
  defaultOrientation: 'landscape',
};

export const decorators = [
  (Story: () => any) => {
    return (
      <StoreProvider>
        <Story />
      </StoreProvider>
    );
  },
  withThemeFromJSXProvider({
    defaultTheme: 'default',
    themes: {
      default: defaultTheme,
      fortressV2: fortressV2Theme,
    },
    Provider: ThemeCompositionProvider,
    GlobalStyles: CssBaseline,
  }),
];

const preview: Preview = {
  loaders: [mswLoader],

  parameters: {
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        ...MINIMAL_VIEWPORTS,
      },
      // defaultViewport: 'ipad11p',
      // defaultOrientation: 'landscape',
    },
    nextjs: {
      appDirectory: true,
    },
    controls: {
      expanded: true,
      matchers: {
        date: /Date$/,
      },
    },
    // actions: { argTypesRegex: '^on[A-Z].*' },
    // TODO 视图类型 确定要查看的 手机 平板 桌面端的大小
  },

  // loaders: [mswLoader],
  decorators,

  tags: ['autodocs'],
};

export default preview;
