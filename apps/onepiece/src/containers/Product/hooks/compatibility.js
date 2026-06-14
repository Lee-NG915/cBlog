import { isIE, isMobile, osName, osVersion } from 'react-device-detect';
import { getUserDevice } from 'utils/device';
/**
 *
 * https://help.sketchfab.com/hc/en-us/articles/203059088-Compatibility
 * Desktop
 *   Sketchfab is compatible with all modern browsers, including:
 *   -  Mozilla Firefox
 *   -  Google Chrome
 *   -  Opera
 *   -  Safari
 *   -  Edge
 *   -  Any other Chromium-based browser
 *   -  Sketchfab is not supported in Internet Explorer.
 *
 * Mobile
 *   - iOS 8+
 *   - Android 4.0+
 */
export function useSupportThreeD() {
  const osVersionNum = parseInt(osVersion);
  let isSupportThreeD = false;

  if (isMobile) {
    if (osName === 'Android') {
      isSupportThreeD = osVersionNum >= 4;
    } else if (osName === 'iOS') {
      isSupportThreeD = osVersionNum >= 8;
    }
  } else if (!isIE) {
    isSupportThreeD = true;
  }

  return isSupportThreeD;
}

/**
 *  https://help.sketchfab.com/hc/en-us/articles/360046289571-App-free-AR#device-compatibility
 *  Viewing 3D models in AR on mobile devices requires relatively recent hardware and software.
 *  iOS: iPhone 7 and newer or iPad 5 and newer, running iOS 12+
 *  Android: Devices with ARCore 1.9 support on Android 8+
 * */
export function useSupportAR() {
  let isSupportAR = false;
  const device = getUserDevice() || 'desktop';
  if (isMobile) {
    const osVersionNum = parseInt(osVersion);

    if (osName === 'Android') {
      isSupportAR = osVersionNum >= 8;
    } else if (osName === 'iOS') {
      isSupportAR = osVersionNum >= 12;
    }
  } else if (device === 'desktop') {
    isSupportAR = true;
  }

  return isSupportAR;
}
