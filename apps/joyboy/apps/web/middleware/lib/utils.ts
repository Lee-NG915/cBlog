import { NextRequest, userAgent } from 'next/server';
import { SUPPORTED_REGIONS, SUPPORTED_LANGUAGES, SUPPORTED_LOCALES, SKIP_FOR_PLP_CLP } from '../constants';
import type { Theme, DeviceType, DeviceTheme, Region, Locale } from '../types';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { NextResponse } from 'next/server';
import { logger } from '@castlery/observability/server';
import { CATEGORY_MIDDLEWARE_REWRITE_PATHNAME } from '@castlery/config';

export { fallbackLocale, isRegionalSupportedLocale } from '@castlery/monorepo-i18n';

// === Device Detection ===

/**
 * Get device type from user agent with error handling
 */
export function getDeviceFromUserAgent(request: NextRequest): DeviceType {
  try {
    if (request.headers.get('x-is-mobile-viewer') === 'true') {
      return 'mobile';
    } else if (request.headers.get('x-is-tablet-viewer') === 'true') {
      return 'tablet';
    } else if (request.headers.get('x-is-desktop-viewer') === 'true') {
      return 'desktop';
    }
    const { device } = userAgent(request);
    return device.type === 'mobile' ? 'mobile' : 'desktop';
  } catch (error) {
    logger.warn('Failed to parse user agent, defaulting to desktop', { utility: 'device-detection' });
    return 'desktop';
  }
}

// === Cookie 管理工具 ===

/**
 * 🍪 创建标准的 Cookie 管理器
 *
 * 为其他中间件提供统一的 Cookie 访问方式
 * 遵循项目的 cookiePersistence 规范
 *
 * @param request - Next.js 请求对象
 * @param response - Next.js 响应对象（可选）
 * @returns cookiePersistence 对象
 */
export function createCookieManager(request: NextRequest, response?: NextResponse) {
  try {
    return makePersistenceHandles({
      req: request,
      res: response || NextResponse.next(),
    });
  } catch (error) {
    logger.error('Failed to create cookie manager', {
      utility: 'cookie-manager',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * 🍪 安全读取 Cookie 值
 *
 * 使用项目标准的 cookiePersistence API 读取 cookie
 *
 * @param request - Next.js 请求对象
 * @param cookieKey - Cookie 键名
 * @returns Cookie 值或 undefined
 */
export function getCookieValue(request: NextRequest, cookieKey: string): string | undefined {
  try {
    const cookieManager = createCookieManager(request);

    // 根据常见的 cookie 键名进行处理
    switch (cookieKey) {
      case 'castlery_shop':
        return cookieManager.castleryShop.getItem();
      case 'preferredLanguage':
        return cookieManager.preferredLanguage.getItem();
      case 'dyid':
        return cookieManager.dyid.getItem();
      case 'device':
        return cookieManager.device.getItem();
      default:
        logger.warn('Unknown cookie key', { utility: 'cookie-manager', cookieKey });
        return undefined;
    }
  } catch (error) {
    logger.warn('Failed to read cookie', { utility: 'cookie-manager', cookieKey });
    return undefined;
  }
}

/**
 * Generate a unique user ID for A/B testing with better randomness
 */
export function generateUserId(): string {
  try {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const additionalRandom = Math.random().toString(36).substring(2, 15);
    return `user-${randomPart}-${additionalRandom}-${timestamp}`;
  } catch (error) {
    logger.warn('Failed to generate user ID, using simple fallback', { utility: 'user-id-generation' });
    return `user-fallback-${Date.now()}`;
  }
}

// === Theme Detection ===

/**
 * Get theme variant from cookies first, then fallback to request headers
 */
export function getThemeVariant(request: NextRequest, cookieTheme?: string): Theme {
  // 优先使用 cookie 中的 theme 设置
  if (cookieTheme && (cookieTheme === 'new' || cookieTheme === 'old')) {
    return cookieTheme as Theme;
  }

  // 如果 cookie 中没有，则从 header 中读取
  const headerTheme = request.headers.get('x-exp-theme') || 'old';
  return (headerTheme === 'old' ? 'old' : 'new') as Theme;
}

// === URL Path Parsing ===

/**
 * Get region from pathname (e.g., /sg/... -> 'sg')
 */
export function getRegionInPathname(pathname: string): string | undefined {
  return SUPPORTED_REGIONS.find((region) => pathname.startsWith(`/${region}`));
}

/**
 * Get locale from pathname (e.g., /sg/zh/... -> 'zh')
 */
export function getLocaleInPathname(pathname: string): string | undefined {
  const region = getRegionInPathname(pathname);
  if (region) {
    return SUPPORTED_LANGUAGES.find((lang) => pathname.startsWith(`/${region}/${lang}`)) as string | undefined;
  }
  return undefined;
}

/**
 * Extract the actual path without region/locale prefixes
 * Examples: /sg/abc/def -> /abc/def, /sg/zh/abc/def -> /abc/def
 */
export function getExtraPathname(pathname: string): string {
  const region = getRegionInPathname(pathname);
  if (region) {
    const locale = getLocaleInPathname(pathname);
    if (locale) {
      return pathname.replace(`/${region}/${locale}`, '') || '/';
    }
    return pathname.replace(`/${region}`, '') || '/';
  }

  // Check for standalone locale
  const locale = SUPPORTED_LANGUAGES.find((lang) => pathname.startsWith(`/${lang}`));
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }

  return pathname;
}

// === ⚡ 智能跳过机制 ===

/**
 * 🔍 快速路径检查 - 替代 unless 的轻量级解决方案
 *
 * 检查当前路径是否应该跳过特定的中间件逻辑
 *
 * @param originalPathname - 原始路径
 * @param skipPatterns - 需要跳过的路径模式
 * @returns true 表示应该跳过
 */
export function shouldSkipForPatterns(originalPathname: string, skipPatterns: readonly string[]): boolean {
  if (!originalPathname) return false;

  // 标准化路径
  const normalizedPath = originalPathname.toLowerCase();

  return skipPatterns.some((pattern) => {
    // 精确匹配
    if (normalizedPath === pattern) return true;

    // 前缀匹配（处理子路径）
    if (normalizedPath.startsWith(pattern + '/')) return true;

    return false;
  });
}

/**
 * 🎯 PLP/CLP 专用跳过检查
 *
 * 使用项目定义的 SKIP_FOR_PLP_CLP 常量进行快速检查
 *
 * @param request - Next.js 请求对象
 * @returns true 表示应该跳过 PLP/CLP 处理
 */
export function shouldSkipPlpClp(request: NextRequest): boolean {
  try {
    const { originalPathname } = getRequiredParams(request);
    if (!originalPathname) return false;

    const shouldSkip = shouldSkipForPatterns(originalPathname, SKIP_FOR_PLP_CLP);

    if (shouldSkip) {
      logger.debug('🚀 Fast skip for PLP/CLP', { utility: 'skip-check', originalPathname });
    }

    return shouldSkip;
  } catch (error) {
    logger.warn('Error checking skip patterns', { utility: 'skip-check' });
    return false;
  }
}

// === 📋 类型安全的参数获取工具 ===

/**
 * 🎯 必需参数接口 - 这些参数由 withParamResolver 保证存在
 */
export interface RequiredMiddlewareParams {
  deviceType: DeviceType;
  theme: Theme;
  deviceTheme: DeviceTheme;
  region: Region;
  locale: Locale;
  originalPathname: string;
}

/**
 * 🎯 可选参数接口 - 这些参数可能存在
 */
export interface OptionalMiddlewareParams {
  dyid?: string;
  abTestVariant?: string;
  experiment?: string;
  geoCity?: string;
  geoState?: string;
  geoZipcode?: string;
  geoIp?: string;
}

/**
 * 🎯 完整参数接口
 */
export interface MiddlewareParams extends RequiredMiddlewareParams, OptionalMiddlewareParams {}

/**
 * 🔍 获取必需的中间件参数
 *
 * 由于 withParamResolver 始终在第一位，这些参数保证存在
 *
 * @param request - Next.js 请求对象
 * @returns 必需参数对象，带有类型安全保证
 */
export function getRequiredParams(request: NextRequest): RequiredMiddlewareParams {
  return {
    deviceType: request.headers.get('x-device-type') as DeviceType,
    theme: request.headers.get('x-theme') as Theme,
    deviceTheme: request.headers.get('x-device-theme') as DeviceTheme,
    region: request.headers.get('x-region') as Region,
    locale: request.headers.get('x-lng') as Locale,
    originalPathname: request.headers.get('x-original-pathname') as string,
  };
}

/**
 * 🔍 获取可选的中间件参数
 *
 * @param request - Next.js 请求对象
 * @returns 可选参数对象
 */
export function getOptionalParams(request: NextRequest): OptionalMiddlewareParams {
  return {
    dyid: request.headers.get('x-dyid') || undefined,
    abTestVariant: request.headers.get('x-ab-test-variant') || undefined,
    experiment: request.headers.get('x-experiment') || undefined,
    geoCity: request.headers.get('x-geo-city') || undefined,
    geoState: request.headers.get('x-geo-state') || undefined,
    geoZipcode: request.headers.get('x-geo-zipcode') || undefined,
    geoIp: request.headers.get('x-geo-ip') || undefined,
  };
}

/**
 * 🔍 获取所有中间件参数
 *
 * 组合必需和可选参数，提供完整的类型安全访问
 *
 * @param request - Next.js 请求对象
 * @returns 完整参数对象
 */
export function getMiddlewareParams(request: NextRequest): MiddlewareParams {
  return {
    ...getRequiredParams(request),
    ...getOptionalParams(request),
  };
}

/**
 * 🔍 验证必需参数是否存在
 *
 * 用于调试和错误处理
 *
 * @param request - Next.js 请求对象
 * @returns 参数验证结果
 */
export function validateRequiredParams(request: NextRequest): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!request.headers.get('x-device-type')) missing.push('x-device-type');
  if (!request.headers.get('x-theme')) missing.push('x-theme');
  if (!request.headers.get('x-device-theme')) missing.push('x-device-theme');
  if (!request.headers.get('x-region')) missing.push('x-region');
  if (!request.headers.get('x-lng')) missing.push('x-lng');
  if (!request.headers.get('x-original-pathname')) missing.push('x-original-pathname');

  return {
    isValid: missing.length === 0,
    missing,
  };
}

// === URL Building ===

/**
 * 🏗️ 构建内部 URL
 *
 * 从 request.headers 读取解析的参数并构建内部路径格式
 * 这些 headers 由 paramResolverMiddleware 设置
 *
 * @param request - Next.js 请求对象
 * @param path - 目标路径
 * @returns 内部格式的 URL
 */
export function buildInternalUrl(request: NextRequest, path: string): URL {
  const { deviceTheme, region, locale } = getRequiredParams(request);
  const rewritePath = `/${deviceTheme}/${region}/${locale}${path}`;
  const url = request.nextUrl.clone();
  url.pathname = rewritePath;
  return url;
}

// === 地理位置工具函数 ===

/**
 * 🌍 获取地理位置参数
 *
 * 从 request.headers 中获取地理位置信息
 * 这些 headers 由 geoLocationMiddleware 设置
 *
 * @param request - Next.js 请求对象
 * @returns 地理位置参数对象
 */
export function getGeoLocationParams(request: NextRequest): {
  city: string | undefined;
  state: string | undefined;
  zipcode: string | undefined;
  ip: string | undefined;
} {
  return {
    city: request.headers.get('x-geo-city') || undefined,
    state: request.headers.get('x-geo-state') || undefined,
    zipcode: request.headers.get('x-geo-zipcode') || undefined,
    ip: request.headers.get('x-geo-ip') || undefined,
  };
}

/**
 * 🌍 检查地理位置信息是否可用
 *
 * @param request - Next.js 请求对象
 * @returns 是否有地理位置信息
 */
export function hasGeoLocationInfo(request: NextRequest): boolean {
  const geoParams = getGeoLocationParams(request);
  return !!(geoParams.city || geoParams.state || geoParams.zipcode);
}

// === ⚡ 性能优化说明 ===
//
// 注意：旧的 unless 机制已被智能跳过机制替代：
// - shouldSkipPlpClp() 用于 PLP/CLP 快速跳过
// - shouldSkipForPatterns() 用于通用路径跳过
// - 新机制更轻量级，性能更好，维护更简单

/**
 * Simple language negotiation based on Accept-Language header
 * 解析 accept-language 头信息，按照权重排序，返回项目支持的语言
 * @param acceptLanguageHeader accept-language 头信息
 * @param supportedLocales 项目支持的语言列表
 * @returns 返回权重最高的支持语言或空字符串
 * @example `Accept-Language: en-US,en;q=0.9` => `en-US`
 * @example `Accept-Language: fr-CA,fr;q=0.9,en-CA;q=0.8,en;q=0.7` => `fr-CA`
 * @example `Accept-Language: fr-CA;q=0.8,en-CA;q=0.9,en;q=0.7` with supportedLocales=['en-CA', 'en-US'] => `en-CA`
 */
export const acceptLanguageParser = (acceptLanguageHeader: string, supportedLocales: string[] = SUPPORTED_LOCALES) => {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== 'string') return '';

  try {
    const languages = acceptLanguageHeader.split(',').map((lang) => {
      const trimmed = lang.trim();
      const [language, quality] = trimmed.split(';');

      // Extract quality value, default to 1 if not specified
      let weight = 1;
      if (quality) {
        const qMatch = quality.match(/q=([0-9.]+)/);
        if (qMatch) {
          weight = parseFloat(qMatch[1]);
        }
      }

      return {
        language: language.trim(),
        weight,
      };
    });

    // Sort by weight in descending order (highest weight first)
    languages.sort((a, b) => b.weight - a.weight);

    // If no supported locales provided, return the highest priority language
    if (!supportedLocales || supportedLocales.length === 0) {
      return languages[0]?.language || '';
    }

    if (supportedLocales.includes(languages[0]?.language)) {
      return languages[0]?.language;
    }

    // Find the first locale that is supported by the project
    for (const lang of languages) {
      if (supportedLocales.includes(lang.language)) {
        return lang.language;
      }
    }

    return '';
  } catch (error) {
    // Accept-Language 解析失败不影响核心功能，降级为空字符串
    return '';
  }
};

// === Cookie 和 Header 传递工具函数 ===

/**
 * 🍪 复制 response 的 cookies 和 headers 到新的 response
 *
 * 确保中间件链中累积的所有状态（cookies、headers）都被正确传递
 * 这是防止页面切换时 cookie 丢失的关键
 *
 * @param sourceResponse - 源响应对象（包含已设置的 cookies 和 headers）
 * @param targetResponse - 目标响应对象（需要复制状态到的对象）
 * @returns 包含所有状态的目标响应对象
 */
export function copyResponseState(sourceResponse: NextResponse, targetResponse: NextResponse): NextResponse {
  // 复制所有 cookies
  for (const cookie of sourceResponse.cookies.getAll()) {
    targetResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
    });
  }

  return targetResponse;
}

/**
 * 🔄 创建保留状态的 rewrite 响应
 *
 * @param sourceResponse - 源响应对象
 * @param rewriteUrl - 重写目标 URL
 * @param additionalHeaders - 可选的额外 headers
 * @returns 包含所有状态的 rewrite 响应
 */
export function createRewriteWithState(
  sourceResponse: NextResponse,
  rewriteUrl: URL,
  additionalHeaders?: Record<string, string>
): NextResponse {
  const headers = new Headers(sourceResponse.headers);

  // 添加额外的 headers（如果有）
  if (additionalHeaders) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  const rewriteResponse = NextResponse.rewrite(rewriteUrl, { headers });

  // 复制所有 cookies
  return copyResponseState(sourceResponse, rewriteResponse);
}

/**
 * 🔀 创建保留状态的 redirect 响应
 *
 * @param sourceResponse - 源响应对象
 * @param redirectUrl - 重定向目标 URL
 * @param status - HTTP 状态码（301/302等）
 * @returns 包含所有状态的 redirect 响应
 */
export function createRedirectWithState(
  sourceResponse: NextResponse,
  redirectUrl: URL | string,
  status?: number
): NextResponse {
  // const headers = new Headers(sourceResponse.headers);
  const redirectResponse = NextResponse.redirect(redirectUrl, status || 307);
  return redirectResponse;

  // TODO: 先保留，redirect 讨论后应该是不需要再传递 cookie 信息的，应由重定向后的下一次请求进行处理
  // // 手动复制 headers（因为 redirect 可能会覆盖某些 headers）
  // headers.forEach((value, key) => {
  //   redirectResponse.headers.set(key, value);
  // });

  // // 复制所有 cookies
  // return copyResponseState(sourceResponse, redirectResponse);
}

// In utils.ts
export function createCategoryRewriteResponse(response: NextResponse, rewriteUrl: URL): NextResponse {
  // const headers = new Headers(response.headers);
  // Because Next.js filters out all headers starting with x-middleware- before entering App Router to prevent developer interference with framework behavior.
  // Only plp/clp middleware needs to manually backup the header: CATEGORY_MIDDLEWARE_REWRITE_PATHNAME, used in layout/page.tsx for business logic.
  // headers.set(CATEGORY_MIDDLEWARE_REWRITE_PATHNAME, rewriteUrl.pathname);

  // 使用新的工具函数确保 cookies 也被传递
  return createRewriteWithState(response, rewriteUrl, {
    [CATEGORY_MIDDLEWARE_REWRITE_PATHNAME]: rewriteUrl.pathname,
  });
}
