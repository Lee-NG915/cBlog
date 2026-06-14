// .storybook/preview.tsx
import React from 'react';
// import { ThemeProvider } from '../src/fortress/Theme';
import { Preview } from '@storybook/react';
import { StoreProvider } from '@castlery/shared-components';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { mswLoader, initialize } from 'msw-storybook-addon';
import { CssBaseline, defaultTheme, fortressV2Theme, ThemeCompositionProvider } from '@castlery/fortress';
// Registers the msw addon
// import { EcEnv } from '@castlery/config';
/*
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
  parameters: {
    viewport: {
      ...INITIAL_VIEWPORTS,
      ...MINIMAL_VIEWPORTS,
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
  },

  loaders: [mswLoader],
  // decorators: [
  //   // mswDecorator,
  //   (Story) => {
  //     return (
  //       <StoreProvider>
  //         <ThemeProvider>
  //           <Story />
  //         </ThemeProvider>
  //       </StoreProvider>
  //     );
  //   },
  // ],
  decorators,

  tags: ['autodocs'],
};

export default preview;
