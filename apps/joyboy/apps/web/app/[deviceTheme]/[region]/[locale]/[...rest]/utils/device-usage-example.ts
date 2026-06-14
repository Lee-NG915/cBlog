/**
 * 设备信息使用示例
 *
 * 这个文件展示了如何在实际项目中使用设备信息
 */

import {
  DeviceInfo,
  parseDeviceTheme,
  getDeviceSpecificConfig,
  getTrackingParams,
  shouldEnableFeature,
  formatDeviceInfo,
  isMobileDevice,
  isTabletDevice,
  isDesktopDevice,
  isNewTheme,
  isOldTheme,
} from './device-utils';

// 示例设备信息
const exampleDeviceInfos: DeviceInfo[] = [
  {
    deviceType: 'mobile',
    theme: 'new',
    deviceTheme: 'mobile-new',
    region: 'sg',
    locale: 'en',
  },
  {
    deviceType: 'tablet',
    theme: 'old',
    deviceTheme: 'tablet-old',
    region: 'my',
    locale: 'en',
  },
  {
    deviceType: 'desktop',
    theme: 'new',
    deviceTheme: 'desktop-new',
    region: 'sg',
    locale: 'zh',
  },
];

/**
 * 示例 1：解析设备主题字符串
 */
export function exampleParseDeviceTheme() {
  console.log('=== 示例 1：解析设备主题字符串 ===');

  const deviceThemes = ['mobile-new', 'tablet-old', 'desktop-new', 'invalid-format'];

  deviceThemes.forEach((deviceTheme) => {
    const parsed = parseDeviceTheme(deviceTheme);
    console.log(`${deviceTheme}:`, parsed);
  });
}

/**
 * 示例 2：设备类型检查
 */
export function exampleDeviceTypeChecks() {
  console.log('=== 示例 2：设备类型检查 ===');

  const deviceTypes = ['mobile', 'tablet', 'desktop', 'unknown'];

  deviceTypes.forEach((deviceType) => {
    console.log(`${deviceType}:`, {
      isMobile: isMobileDevice(deviceType),
      isTablet: isTabletDevice(deviceType),
      isDesktop: isDesktopDevice(deviceType),
    });
  });
}

/**
 * 示例 3：主题检查
 */
export function exampleThemeChecks() {
  console.log('=== 示例 3：主题检查 ===');

  const themes = ['old', 'new', 'unknown'];

  themes.forEach((theme) => {
    console.log(`${theme}:`, {
      isOld: isOldTheme(theme),
      isNew: isNewTheme(theme),
    });
  });
}

/**
 * 示例 4：获取设备特定配置
 */
export function exampleDeviceConfig() {
  console.log('=== 示例 4：获取设备特定配置 ===');

  exampleDeviceInfos.forEach((deviceInfo) => {
    const config = getDeviceSpecificConfig(deviceInfo);
    console.log(`${formatDeviceInfo(deviceInfo)}:`, config);
  });
}

/**
 * 示例 5：获取跟踪参数
 */
export function exampleTrackingParams() {
  console.log('=== 示例 5：获取跟踪参数 ===');

  exampleDeviceInfos.forEach((deviceInfo) => {
    const params = getTrackingParams(deviceInfo);
    console.log(`${formatDeviceInfo(deviceInfo)}:`, params);
  });
}

/**
 * 示例 6：功能启用检查
 */
export function exampleFeatureEnabling() {
  console.log('=== 示例 6：功能启用检查 ===');

  const features = ['advanced-animations', 'touch-gestures', 'high-resolution-images'];

  exampleDeviceInfos.forEach((deviceInfo) => {
    console.log(`${formatDeviceInfo(deviceInfo)}:`);
    features.forEach((feature) => {
      const enabled = shouldEnableFeature(deviceInfo, feature);
      console.log(`  ${feature}: ${enabled ? '✅' : '❌'}`);
    });
  });
}

/**
 * 示例 7：实际应用场景
 */
export function exampleRealWorldUsage() {
  console.log('=== 示例 7：实际应用场景 ===');

  exampleDeviceInfos.forEach((deviceInfo) => {
    console.log(`\n设备: ${formatDeviceInfo(deviceInfo)}`);

    // 根据设备类型决定图片质量
    const config = getDeviceSpecificConfig(deviceInfo);
    console.log(`图片质量: ${(config as any).imageQuality}`);

    // 根据设备类型决定是否启用触摸手势
    if ((config as any).enableTouchGestures) {
      console.log('启用触摸手势支持');
    }

    // 根据主题决定是否启用新功能
    if (config.enableNewFeatures) {
      console.log('启用新功能');
    }

    // 根据设备类型决定布局
    if ((config as any).compactLayout) {
      console.log('使用紧凑布局');
    }

    // 检查特定功能是否可用
    if (shouldEnableFeature(deviceInfo, 'advanced-animations')) {
      console.log('启用高级动画');
    }

    if (shouldEnableFeature(deviceInfo, 'high-resolution-images')) {
      console.log('加载高分辨率图片');
    }
  });
}

/**
 * 示例 8：条件渲染逻辑
 */
export function exampleConditionalRendering() {
  console.log('=== 示例 8：条件渲染逻辑 ===');

  exampleDeviceInfos.forEach((deviceInfo) => {
    console.log(`\n设备: ${formatDeviceInfo(deviceInfo)}`);

    // 移动端特定逻辑
    if (isMobileDevice(deviceInfo.deviceType)) {
      console.log('渲染移动端组件');
      console.log('启用触摸手势');
      console.log('使用移动端导航');
    }

    // 平板端特定逻辑
    if (isTabletDevice(deviceInfo.deviceType)) {
      console.log('渲染平板端组件');
      console.log('启用触摸手势');
      console.log('使用平板端布局');
    }

    // 桌面端特定逻辑
    if (isDesktopDevice(deviceInfo.deviceType)) {
      console.log('渲染桌面端组件');
      console.log('启用鼠标交互');
      console.log('使用桌面端布局');
    }

    // 新主题特定逻辑
    if (isNewTheme(deviceInfo.theme)) {
      console.log('使用新主题样式');
      console.log('启用新功能');
      console.log('使用现代 UI 组件');
    }

    // 旧主题特定逻辑
    if (isOldTheme(deviceInfo.theme)) {
      console.log('使用旧主题样式');
      console.log('保持兼容性');
      console.log('使用传统 UI 组件');
    }
  });
}

/**
 * 运行所有示例
 */
export function runAllDeviceExamples() {
  console.log('开始运行设备信息示例...\n');

  exampleParseDeviceTheme();
  console.log('\n');

  exampleDeviceTypeChecks();
  console.log('\n');

  exampleThemeChecks();
  console.log('\n');

  exampleDeviceConfig();
  console.log('\n');

  exampleTrackingParams();
  console.log('\n');

  exampleFeatureEnabling();
  console.log('\n');

  exampleRealWorldUsage();
  console.log('\n');

  exampleConditionalRendering();
  console.log('\n');

  console.log('所有设备信息示例运行完成！');
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllDeviceExamples();
}
