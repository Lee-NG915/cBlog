import { DeviceType, DeviceTheme, Theme } from '../types';
import { DEFAULT_REGION, SUPPORTED_REGIONS, WEB_SERVER_NAME } from '../constants';
import {
  getDeviceFromUserAgent,
  getRegionInPathname,
  getLocaleInPathname,
  getExtraPathname,
  acceptLanguageParser,
  fallbackLocale,
  isRegionalSupportedLocale,
} from '../lib/utils';
import { NextResponse } from 'next/server';
import { CustomMiddleware } from '../lib/chain';
import { logger } from '@castlery/observability/server';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

function customLocaleDetection({
  acceptLanguageHeader,
  preferredLanguageCookie,
}: {
  acceptLanguageHeader: string;
  preferredLanguageCookie: string;
}) {
  // 1. 优先检测preferredLanguageCookie，如果存在，则直接返回
  if (preferredLanguageCookie) {
    return preferredLanguageCookie;
  }

  // 2. 如果preferredLanguageCookie不存在，则检测acceptLanguageHeader，如果存在，则返回
  const acceptLanguage = acceptLanguageParser(acceptLanguageHeader);
  if (acceptLanguage) {
    return acceptLanguage;
  }

  return undefined;
}

/**
 * 🔍 参数解析中间件工厂
 *
 * 作为链式中间件的第一个，负责：
 * 1. 创建初始的 response 对象
 * 2. 解析 URL 参数 (region, locale, originalPathname)
 * 3. 检测设备类型和主题
 * 4. 管理用户偏好 cookies
 * 5. 将解析的数据设置到 request.headers 中供后续中间件使用
 *
 * 🎯 设计优势：
 * - 📋 通过 headers 传递数据，符合 Next.js 原生模式
 * - 🍪 使用项目标准的 Cookie 管理
 * - 🔄 为 buildInternalUrl 等工具函数提供数据
 * - 🛡️ 完善的错误处理和默认值
 */
export function paramResolverMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event) => {
    // === 第一步：创建初始响应对象 ===
    const response = NextResponse.next();

    // === 第二步：初始化 Cookie 管理 ===
    let cookiePersistence;
    try {
      cookiePersistence = makePersistenceHandles({
        req: request,
        res: response,
      });
    } catch (error) {
      logger.error('Failed to initialize cookie persistence', {
        middleware: 'ParamResolver',
        error: (error as Error).message,
      });
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    // === 第三步：输入验证 ===
    if (!request || !request.nextUrl) {
      logger.error('Invalid request object', { middleware: 'ParamResolver' });
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { pathname } = request.nextUrl;

    if (!pathname || typeof pathname !== 'string') {
      logger.error('Invalid pathname', { middleware: 'ParamResolver' });
      return NextResponse.json({ error: 'Invalid pathname' }, { status: 400 });
    }

    // === 第四步：解析 URL 参数 ===
    const regionInPath = getRegionInPathname(pathname);
    const localeInPath = getLocaleInPathname(pathname);

    let region: string;
    let locale: string;
    let originalPathname: string;

    try {
      if (regionInPath) {
        region = regionInPath;
        originalPathname = getExtraPathname(pathname);
      } else {
        region = cookiePersistence.castleryShop.getItem() || DEFAULT_REGION;
        originalPathname = pathname;
      }

      // Note: Region validation is now handled by countrySelectMiddleware
      // Here we just ensure we have a valid fallback for header setting
      if (!SUPPORTED_REGIONS.includes(region)) {
        region = DEFAULT_REGION;
      }

      if (localeInPath) {
        locale = localeInPath;
      } else {
        const detectedLocale = customLocaleDetection({
          acceptLanguageHeader: request.headers.get('accept-language') || '',
          preferredLanguageCookie: cookiePersistence.preferredLanguage.getItem() || '',
        });
        locale = detectedLocale || fallbackLocale;
      }

      // Validate locales
      if (!isRegionalSupportedLocale(locale, region)) {
        logger.info('Invalid locale detected, using default', {
          middleware: 'ParamResolver',
          invalidLocale: locale,
          region,
          defaultLocale: fallbackLocale,
        });
        locale = fallbackLocale;
      }

      // Ensure originalPathname has a leading slash and is properly formatted
      if (!originalPathname.startsWith('/')) {
        originalPathname = '/' + originalPathname;
      }
    } catch (error) {
      logger.error('Error parsing URL parameters', {
        middleware: 'ParamResolver',
        error: (error as Error).message,
      });
      // Use safe defaults
      region = DEFAULT_REGION;
      locale = fallbackLocale;
      originalPathname = pathname.startsWith('/') ? pathname : '/' + pathname;
    }

    // === 第五步：设备和主题检测 ===
    let deviceType: DeviceType;
    let theme: Theme;

    try {
      deviceType = getDeviceFromUserAgent(request);
      // 在 master_brand_refresh 分支，theme 固定为 'new'
      theme = 'new';
    } catch (error) {
      logger.warn('Error detecting device, using defaults', { middleware: 'ParamResolver' });
      deviceType = 'mobile';
      theme = 'new';
    }

    const deviceTheme = `${deviceType}-${theme}` as DeviceTheme;

    // === 第六步：Dyid 管理 ===
    const dyid = cookiePersistence.dyid.getItem();

    // === 第七步：更新 Cookies（仅当用户明确选择时） ===
    try {
      // Save preferences only when user explicitly provides them in URL
      if (regionInPath) {
        cookiePersistence.castleryShop.setItem(region);
        cookiePersistence.preferredLanguage.setItem(locale);
      }

      // Always update device preference
      cookiePersistence.device.setItem(deviceType);

      // 如果dyid存在，则复制为dyidServer, dy 推荐的方案，避免第三方cookie被禁用带来的问题
      if (dyid) {
        cookiePersistence.dyidServer.setItem(dyid);
      }
      // 设置dyPageLocation，用于 dy 推荐
      // @abby 后续待优化，目前 location 设置有问题
      // const dyPageLocation = WEB_SERVER_NAME + pathname;
      // cookiePersistence.dyPageLocation.setItem(dyPageLocation);
    } catch (error) {
      logger.warn('Failed to update cookies', { middleware: 'ParamResolver' });
    }

    // === 第八步：🚀 关键 - 设置 Request Headers 传递数据 ===
    // 这些 headers 将被后续中间件和 buildInternalUrl 函数使用
    const xLng = locale.split('-')[0];
    try {
      request.headers.set('x-device-type', deviceType);
      request.headers.set('x-theme', theme);
      request.headers.set('x-device-theme', deviceTheme);
      request.headers.set('x-region', region);
      request.headers.set('x-lng', xLng);
      request.headers.set('x-original-pathname', originalPathname);
      if (dyid) {
        request.headers.set('x-dyid', dyid);
      }

      // Debug log removed - too verbose for production
    } catch (error) {
      logger.error('Failed to set request headers', {
        middleware: 'ParamResolver',
        error: (error as Error).message,
      });
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }

    // === 第九步：调用下一个中间件 ===
    return middleware(request, event, response);
  };
}
