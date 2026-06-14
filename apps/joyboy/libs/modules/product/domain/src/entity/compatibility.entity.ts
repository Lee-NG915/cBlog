/**
 * 设备信息
 */
export interface DeviceInfo {
  type?: 'mobile' | 'tablet' | 'desktop';
  vendor?: string;
  model?: string;
}

/**
 * 操作系统信息
 */
export interface OSInfo {
  name?: string;
  version?: string;
}

/**
 * 浏览器信息
 */
export interface BrowserInfo {
  name?: string;
  version?: string;
}

/**
 * 兼容性检测结果
 */
export interface CompatibilityResult {
  supports3D: boolean;
  supportsAR: boolean;
  deviceInfo: DeviceInfo;
  osInfo: OSInfo;
  browserInfo: BrowserInfo;
  // 设备类型判断
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  errorMessage?: string;
}
