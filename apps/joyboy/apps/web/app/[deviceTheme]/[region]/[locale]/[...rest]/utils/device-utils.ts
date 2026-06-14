/**
 * 设备信息处理工具函数
 */

export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  theme: 'old' | 'new';
  deviceTheme: string;
  region: string;
  locale: string;
}

export interface ParsedDeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  theme: 'old' | 'new';
  isValid: boolean;
}

/**
 * 解析设备主题字符串
 * @param deviceTheme 设备主题字符串，格式如 "desktop-old", "mobile-new"
 * @returns 解析后的设备信息
 */
export function parseDeviceTheme(deviceTheme: string): ParsedDeviceInfo {
  const [deviceType, theme] = deviceTheme?.split('-') ?? ['desktop', 'old'];

  const validDeviceTypes = ['desktop', 'mobile', 'tablet'] as const;
  const validThemes = ['old', 'new'] as const;

  const currentDeviceType = validDeviceTypes.includes(deviceType as any)
    ? (deviceType as 'desktop' | 'mobile' | 'tablet')
    : 'desktop';

  const currentTheme = validThemes.includes(theme as any) ? (theme as 'old' | 'new') : 'old';

  const isValid = validDeviceTypes.includes(deviceType as any) && validThemes.includes(theme as any);

  return {
    deviceType: currentDeviceType,
    theme: currentTheme,
    isValid,
  };
}

/**
 * 检查是否为移动设备
 * @param deviceType 设备类型
 * @returns 是否为移动设备
 */
export function isMobileDevice(deviceType: string): boolean {
  return deviceType === 'mobile';
}

/**
 * 检查是否为平板设备
 * @param deviceType 设备类型
 * @returns 是否为平板设备
 */
export function isTabletDevice(deviceType: string): boolean {
  return deviceType === 'tablet';
}

/**
 * 检查是否为桌面设备
 * @param deviceType 设备类型
 * @returns 是否为桌面设备
 */
export function isDesktopDevice(deviceType: string): boolean {
  return deviceType === 'desktop';
}

/**
 * 检查是否为新主题
 * @param theme 主题
 * @returns 是否为新主题
 */
export function isNewTheme(theme: string): boolean {
  return theme === 'new';
}

/**
 * 检查是否为旧主题
 * @param theme 主题
 * @returns 是否为旧主题
 */
export function isOldTheme(theme: string): boolean {
  return theme === 'old';
}

/**
 * 获取设备特定的配置
 * @param deviceInfo 设备信息
 * @returns 设备特定的配置
 */
export function getDeviceSpecificConfig(deviceInfo: DeviceInfo) {
  const { deviceType, theme } = deviceInfo;

  const config = {
    // 移动端特定配置
    mobile: {
      imageQuality: 'medium',
      enableTouchGestures: true,
      enableSwipeNavigation: true,
      compactLayout: true,
    },
    // 平板端特定配置
    tablet: {
      imageQuality: 'high',
      enableTouchGestures: true,
      enableSwipeNavigation: false,
      compactLayout: false,
    },
    // 桌面端特定配置
    desktop: {
      imageQuality: 'high',
      enableTouchGestures: false,
      enableSwipeNavigation: false,
      compactLayout: false,
    },
    // 新主题特定配置
    newTheme: {
      enableNewFeatures: true,
      useModernUI: true,
      enableAnimations: true,
    },
    // 旧主题特定配置
    oldTheme: {
      enableNewFeatures: false,
      useModernUI: false,
      enableAnimations: false,
    },
  };

  return {
    ...config[deviceType as keyof typeof config],
    ...(theme === 'new' ? config.newTheme : config.oldTheme),
  };
}

/**
 * 根据设备信息决定是否启用特定功能
 * @param deviceInfo 设备信息
 * @param featureName 功能名称
 * @returns 是否启用该功能
 */
export function shouldEnableFeature(deviceInfo: DeviceInfo, featureName: string): boolean {
  const { deviceType, theme } = deviceInfo;

  const featureConfig = {
    // 示例功能配置
    'advanced-animations': {
      mobile: false,
      tablet: true,
      desktop: true,
      newTheme: true,
      oldTheme: false,
    },
    'touch-gestures': {
      mobile: true,
      tablet: true,
      desktop: false,
      newTheme: true,
      oldTheme: false,
    },
    'high-resolution-images': {
      mobile: false,
      tablet: true,
      desktop: true,
      newTheme: true,
      oldTheme: false,
    },
  };

  const config = featureConfig[featureName as keyof typeof featureConfig];
  if (!config) return false;

  const deviceEnabled = config[deviceType as keyof typeof config] ?? false;
  const themeEnabled = config[theme === 'new' ? 'newTheme' : ('oldTheme' as keyof typeof config)] ?? false;

  return deviceEnabled && themeEnabled;
}

/**
 * 格式化设备信息用于日志记录
 * @param deviceInfo 设备信息
 * @returns 格式化的设备信息字符串
 */
export function formatDeviceInfo(deviceInfo: DeviceInfo): string {
  return `${deviceInfo.deviceType}-${deviceInfo.theme} (${deviceInfo.region}/${deviceInfo.locale})`;
}
