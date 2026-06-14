// 配置Chromatic插件使用开发服务器
window.CHROMATIC_CONFIG = {
  projectToken: 'chpt_68cd5d09d39021f',
  onlyChanged: true,
  skipTurboSnap: true,
  exitZeroOnChanges: true,
  // 使用当前运行的开发服务器
  storybookUrl: window.location.origin,
  // 避免重新构建
  buildScriptName: '',
  // 其他选项
  debug: true,
  interactive: false,
};
