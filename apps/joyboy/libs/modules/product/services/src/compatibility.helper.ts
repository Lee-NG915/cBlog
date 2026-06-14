import { createAsyncThunk } from '@reduxjs/toolkit';
import { UAParser } from 'ua-parser-js';
import type { DeviceInfo, OSInfo, BrowserInfo, CompatibilityResult } from '@castlery/modules-product-domain';

/**
 * 检查 3D 支持 - 使用增强的设备类型判断
 */
function check3DSupport({
  osInfo,
  browserInfo,
  isIOS,
  isAndroid,
  isMobile,
  isTablet,
  isDesktop,
}: {
  osInfo: OSInfo;
  browserInfo: BrowserInfo;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}) {
  const osVersionNum = parseFloat(osInfo.version || '0');

  // 移动端检测 - 使用增强的设备类型判断
  if (isMobile || isTablet) {
    if (isAndroid) {
      return osVersionNum >= 4.0;
    } else if (isIOS) {
      return osVersionNum >= 8.0;
    }
    return false;
  }

  // 桌面端检测 - 排除 IE
  if (isDesktop) {
    const isIE =
      browserInfo.name === 'IE' || browserInfo.name === 'Internet Explorer' || browserInfo.name?.includes('Trident');

    return !isIE;
  }

  return false;
}

/**
 * 检查 AR 支持 - 使用增强的设备类型判断
 */
function checkARSupport({
  osInfo,
  isIOS,
  isAndroid,
  isMobile,
  isTablet,
  isDesktop,
}: {
  osInfo: OSInfo;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}) {
  const osVersionNum = parseFloat(osInfo.version || '0');

  // 移动端检测 - 使用增强的设备类型判断
  if (isMobile || isTablet) {
    if (isAndroid) {
      return osVersionNum >= 8.0;
    } else if (isIOS) {
      return osVersionNum >= 12.0;
    }
    return false;
  }

  // 桌面端 - 简单返回 true（与原始逻辑保持一致）
  if (isDesktop) {
    return true;
  }

  return false;
}

/**
 * 检查设备兼容性的命令函数 - 客户端执行
 */
export const checkDeviceCompatibilityCommand = () => {
  const userAgent = window.navigator.userAgent;

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // 设备信息处理
  const deviceInfo: DeviceInfo = {
    type: result.device.type === 'mobile' ? 'mobile' : result.device.type === 'tablet' ? 'tablet' : 'desktop',
    vendor: result.device.vendor,
    model: result.device.model,
  };

  // 操作系统信息
  const osInfo: OSInfo = {
    name: result.os.name,
    version: result.os.version,
  };

  // 浏览器信息
  const browserInfo: BrowserInfo = {
    name: result.browser.name,
    version: result.browser.version,
  };

  // 先进行设备类型判断
  const isIOS = Boolean(
    osInfo.name === 'iOS' ||
      deviceInfo.vendor === 'Apple' ||
      deviceInfo.model?.toLowerCase().includes('iphone') ||
      deviceInfo.model?.toLowerCase().includes('ipad') ||
      deviceInfo.model?.toLowerCase().includes('ipod')
  );

  const isAndroid = Boolean(osInfo.name === 'Android');

  const isMobile = Boolean(deviceInfo.type === 'mobile');
  const isTablet = Boolean(deviceInfo.type === 'tablet');
  const isDesktop = Boolean(deviceInfo.type === 'desktop' || !deviceInfo.type);

  // 使用增强的设备类型判断进行兼容性检测
  const supports3D = check3DSupport({
    osInfo,
    browserInfo,
    isIOS,
    isAndroid,
    isMobile,
    isTablet,
    isDesktop,
  });
  const supportsAR = checkARSupport({
    osInfo,
    isIOS,
    isAndroid,
    isMobile,
    isTablet,
    isDesktop,
  });

  // 返回结果给 slice 的 extraReducers 处理
  return {
    supports3D,
    supportsAR,
    deviceInfo: {
      type: deviceInfo.type,
      model: deviceInfo.model,
      vendor: deviceInfo.vendor,
    },
    osInfo: {
      name: osInfo.name,
      version: osInfo.version,
    },
    browserInfo: {
      name: browserInfo.name,
      version: browserInfo.version,
    },
    // 设备类型判断结果
    isIOS,
    isAndroid,
    isMobile,
    isTablet,
    isDesktop,
  };
};
