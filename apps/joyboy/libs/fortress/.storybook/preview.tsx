// 设置全局 story 参数
import { Preview } from '@storybook/react';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { ThemeCompositionProvider, defaultTheme, fortressV2Theme } from '../src';
import { allModes } from './mode';
import './font.scss';
// 导入Chromatic配置
import './chromatic';

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: '切换主题',
    defaultValue: 'fortressV2',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'fortressV1', title: 'V1 主题' },
        { value: 'fortressV2', title: 'V2 主题' },
      ],
      dynamicTitle: true,
    },
  },
  version: {
    name: 'Version',
    description: '组件库版本',
    defaultValue: 'v2',
    toolbar: {
      icon: 'branch',
      items: [
        { value: 'v2', title: 'Version 2' },
        { value: 'v1', title: 'Version 1' },
      ],
    },
  },
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    withThemeFromJSXProvider({
      defaultTheme: 'fortressV2',
      themes: {
        fortressV1: defaultTheme,
        fortressV2: fortressV2Theme,
      },
      Provider: ThemeCompositionProvider,
    }),
  ],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical-by-kind',
      },
    },
    // 启用源代码显示
    docs: {
      source: {
        state: 'open', // 默认展开源代码
        type: 'code', // 显示实际代码而不是dynamic
      },
    },
    controls: {
      expanded: true, // 展开控制面板
    },
    // 确保源代码addon正常工作
    sourceLoaderOptions: {
      injectStoryParameters: true,
    },
    source: {
      type: 'code', // 显示格式化的代码
      language: 'tsx', // 指定语言为TypeScript React
    },
    chromatic: {
      disableSnapshot: false,
      delay: 300, // 添加延迟以确保组件完全渲染
      pauseAnimationAtEnd: true,
      modes: {
        fortressV1: allModes['fortressV1'],
        fortressV2: allModes['fortressV2'],
      },
    },
    viewport: {
      viewports: {
        mobile: { name: 'Small', styles: { width: '540px', height: '800px' } },
        tablet: { name: 'Medium', styles: { width: '768px', height: '800px' } },
        desktop: { name: 'Large', styles: { width: '1024px', height: '1000px' } },
      },
    },
  },
};

export default preview;
