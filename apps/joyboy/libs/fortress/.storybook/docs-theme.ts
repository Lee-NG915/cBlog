// .storybook/docs-theme.ts
import type { ThemeVars } from '@storybook/theming';
import { create } from '@storybook/theming/create';

const docsTheme: ThemeVars = create({
  // 基础模式：light / dark
  base: 'light',

  // 品牌信息
  brandTitle: 'Castlery Fortress',
  brandUrl: 'https://storybook-fortress.castlery.com',
  brandImage: undefined, // Logo 图片（SVG/PNG），留空则展示文字
  brandTarget: '_self',

  colorPrimary: '#c1af86',
  colorSecondary: '#a45b37',

  // colorPrimary: 'red',
  // colorSecondary: '#3C101E',

  // 主色调
  // colorPrimary: '#844025', // 主要强调色（按钮/链接高亮）
  // colorSecondary: '#63404B', // 次级强调色

  // 布局背景与边框
  appBg: '#FFFFFF', // 整个管理界面的背景色
  // appContentBg: 'red', // 预览区域及内容面板背景
  // appBorderColor: '#F6F3E7', // 内容区域边框颜色

  // 顶部工具栏
  // barBg: '#FBF9F4', // 顶部工具条背景
  // barTextColor: '#3C101E',
  // barSelectedColor: '#F9F7EF', // 激活工具的颜色
  // barHoverColor: '#3C101E', // 鼠标悬停时的颜色

  // 文本与链接
  // textColor: '#3C101E', // 默认文本颜色
  // textInverseColor: '#212121', // 反色文本（用于浅底深字）
  // textMutedColor: '#212121', // 次要文本颜色

  // 输入控件
  // inputBg: '#F6F3E7',
  // inputBorder: '#D9C4BB',
  // inputBorderRadius: 4,
  // inputTextColor: '#3C101E',

  // 字体
  fontBase: '"Aime", "Helvetica Neue", Arial, sans-serif',
  fontCode: '"Fira Code", "SFMono-Regular", Consolas, monospace',
});

export default docsTheme;
