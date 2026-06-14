// 配置Chromatic工具栏
import { addons } from '@storybook/manager-api';
import docsTheme from './docs-theme';

addons.setConfig({
  // 其他配置...
  theme: docsTheme,

  // Chromatic配置
  chromatic: {
    projectToken: 'chpt_68cd5d09d39021f',
    storybookUrl: 'auto', // 自动使用当前运行的开发服务器
    skipTurboSnap: true,
    disableTurboSnapshots: true,
    exitZeroOnChanges: true,
    preserveMissing: true,
    debug: true,
  },
});
