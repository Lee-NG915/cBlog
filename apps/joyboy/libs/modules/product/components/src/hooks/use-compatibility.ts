'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from '@castlery/shared-redux-store';
import { checkDeviceCompatibilityCommand } from '@castlery/modules-product-services';
import { BrowserInfo, DeviceInfo, OSInfo } from '@castlery/modules-product-domain';

export function useCompatibility() {
  const dispatch = useDispatch();
  const [supports3D, setSupports3D] = useState(false);
  const [supportsAR, setSupportsAR] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [osInfo, setOsInfo] = useState<OSInfo | null>(null);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const processCompatibility = async () => {
      const result = checkDeviceCompatibilityCommand();
      setSupports3D(result.supports3D);
      setSupportsAR(result.supportsAR);
      setDeviceInfo(result.deviceInfo);
      setOsInfo(result.osInfo);
      setBrowserInfo(result.browserInfo);
      setIsIOS(result.isIOS);
      setIsAndroid(result.isAndroid);
      setIsMobile(result.isMobile);
      setIsTablet(result.isTablet);
      setIsDesktop(result.isDesktop);
    };
    processCompatibility();
  }, [dispatch]);

  return {
    supports3D,
    supportsAR,
    deviceInfo,
    osInfo,
    browserInfo,
    // 便捷的设备类型判断
    isIOS,
    isAndroid,
    isMobile,
    isTablet,
    isDesktop,
  };
}
