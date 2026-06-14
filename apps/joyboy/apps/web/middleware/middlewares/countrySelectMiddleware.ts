import { CustomMiddleware } from '../lib/chain';
import { getRequiredParams, getRegionInPathname, createRewriteWithState, createRedirectWithState } from '../lib/utils';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { logger } from '@castlery/observability/server';
import { SUPPORTED_REGIONS } from '../constants';
import { EcEnv } from '@castlery/config';

/**
 * 🌍 国家选择中间件工厂
 *
 * 统一处理所有国家路径相关逻辑：
 * 1. 第一次访问（无 cookie）→ 显示国家选择页面
 * 2. 有国家路径访问 → 验证是否与应用配置一致，不一致则重定向到应用配置的国家
 * 3. 无国家路径但有有效的 cookie → 直接重定向到 cookie 中的国家路径
 *    - cookie 中的国家在支持列表中：重定向到该国家路径
 *    - cookie 中的国家不在支持列表中：显示国家选择页面
 * 4. 不支持的国家代码 → 显示国家选择页面
 *
 * 🎯 设计优势：
 * - 📋 首次访问显示国家选择页面
 * - 🌐 支持跨国家部署访问（cookie 国家可以与部署国家不同）
 * - 🍪 智能的 cookie 管理和验证机制
 * - 🛑 直接返回 NextResponse.redirect/rewrite() 中断链路
 */
export function countrySelectMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const { pathname } = request.nextUrl;
    const { originalPathname } = getRequiredParams(request);

    // 初始化 cookie 管理器
    const persistenceHandles = makePersistenceHandles({
      req: request,
      res: response,
    });

    // 获取用户已保存的国家偏好
    const savedCountryPreference = persistenceHandles.castleryShop.getItem();

    // 检查当前路径是否包含国家代码
    const regionInPath = getRegionInPathname(pathname);

    if (regionInPath) {
      // === 情况1：路径包含国家代码 ===

      // 验证国家代码是否在支持列表中
      if (!SUPPORTED_REGIONS.includes(regionInPath)) {
        logger.warn('Unsupported country code in path, redirecting to country selector', {
          middleware: 'CountrySelect',
          unsupportedCountry: regionInPath,
          pathname,
          supportedRegions: SUPPORTED_REGIONS,
        });

        // 不支持的国家代码，重定向到国家选择页面
        const { deviceTheme, locale } = getRequiredParams(request);
        const countrySelectUrl = request.nextUrl.clone();
        countrySelectUrl.pathname = `/${deviceTheme}/us/${locale}/country-select`;
        const returnUrl = encodeURIComponent(originalPathname + request.nextUrl.search);
        countrySelectUrl.searchParams.set('returnUrl', returnUrl);
        return createRewriteWithState(response, countrySelectUrl);
      }

      // 🔥 新增：检查路径中的国家代码是否与应用配置的国家一致
      const appConfiguredCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
      if (regionInPath !== appConfiguredCountry) {
        logger.info('Country path mismatch with app config, redirecting to configured country', {
          middleware: 'CountrySelect',
          pathCountry: regionInPath,
          configuredCountry: appConfiguredCountry,
          originalPath: originalPathname,
        });

        // 重定向到应用配置的国家路径
        const redirectUrl = new URL(
          `/${appConfiguredCountry}${originalPathname.replace(`/${regionInPath}`, '')}`,
          request.nextUrl.origin
        );

        // 保持查询参数
        request.nextUrl.searchParams.forEach((value, key) => {
          redirectUrl.searchParams.set(key, value);
        });

        return createRedirectWithState(response, redirectUrl);
      }

      // 国家代码有效且与应用配置一致，保存用户偏好（如果还没保存的话）
      if (!savedCountryPreference || savedCountryPreference !== regionInPath) {
        persistenceHandles.castleryShop.setItem(regionInPath);
        logger.info('Country preference saved from URL', {
          middleware: 'CountrySelect',
          country: regionInPath,
          pathname,
        });
      }

      // 继续正常流程
      return middleware(request, event, response);
    } else {
      // === 情况2：路径不包含国家代码 ===

      if (savedCountryPreference && SUPPORTED_REGIONS.includes(savedCountryPreference)) {
        // 🔥 用户有有效的国家偏好，直接重定向到该国家路径
        // 不需要与应用配置的国家一致，只要在支持列表中即可
        const redirectUrl = new URL(`/${savedCountryPreference}${originalPathname}`, request.nextUrl.origin);

        // 保持查询参数
        request.nextUrl.searchParams.forEach((value, key) => {
          redirectUrl.searchParams.set(key, value);
        });

        logger.info('Redirecting to saved country path', {
          middleware: 'CountrySelect',
          country: savedCountryPreference,
          from: pathname,
          to: redirectUrl.pathname,
        });

        return createRedirectWithState(response, redirectUrl);
      } else {
        // 🔥 用户没有有效的国家偏好（第一次访问或不支持的国家），进入国家选择页面
        logger.info('No valid country preference found, showing country selector', {
          middleware: 'CountrySelect',
          originalPath: originalPathname,
          savedPreference: savedCountryPreference,
          supportedRegions: SUPPORTED_REGIONS,
        });

        const { deviceTheme, locale } = getRequiredParams(request);
        const appConfiguredCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
        const countrySelectUrl = request.nextUrl.clone();
        countrySelectUrl.pathname = `/${deviceTheme}/${appConfiguredCountry}/${locale}/country-select`;

        // 保存原始目标路径，用户选择国家后可以回到这里
        const returnUrl = encodeURIComponent(originalPathname + request.nextUrl.search);
        countrySelectUrl.searchParams.set('returnUrl', returnUrl);

        return createRewriteWithState(response, countrySelectUrl);
      }
    }
  };
}
