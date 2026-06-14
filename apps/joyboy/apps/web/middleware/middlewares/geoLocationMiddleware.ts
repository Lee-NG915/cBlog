import { CustomMiddleware } from '../lib/chain';
import { logger } from '@castlery/observability/server';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { EcEnv, currentDefaultCity, currentRegionIdMap } from '@castlery/config';

/**
 * 🌍 地理位置中间件工厂
 *
 * 负责处理地理位置信息的获取和设置：
 * 1. 从 headers、query 参数、cookies 中获取位置信息
 * 2. 设置城市和IP地址的 cookies
 * 3. 优先级处理：region_id > cookie > header > default
 *
 * 🎯 设计优势：
 * - 📍 智能位置检测：多源数据融合
 * - 🍪 Cookie 管理：使用项目标准的持久化工具
 * - 🛡️ 容错处理：完善的错误处理和默认值
 * - 🔄 透明传递：不中断中间件链
 */
export function geoLocationMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    try {
      let cookiePersistence;
      try {
        cookiePersistence = makePersistenceHandles({
          req: request,
          res: response,
        });
      } catch (error) {
        logger.error('Failed to initialize cookie persistence', {
          middleware: 'GeoLocation',
          error: error instanceof Error ? error.message : String(error),
        });
        // 继续执行，不中断链路
        return middleware(request, event, response);
      }

      const region_id = request.nextUrl.searchParams.get('region_id') || '';

      const ip_address =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        request.headers.get('x-client-ip') ||
        '';

      const country_code = request.headers.get('x-viewer-country');
      const city = request.headers.get('x-viewer-city');
      const zip_code = request.headers.get('x-viewer-postal-code');
      const region_code = request.headers.get('x-viewer-country-region');

      const trackingData = {
        ip_address,
        city,
        country_code,
        zip_code,
        region_code,
        region_id,
      };

      if (country_code !== null && country_code !== undefined && country_code !== '') {
        cookiePersistence.webCountryCode.setItem(country_code || '');
      }
      const filteredTrackingData = Object.fromEntries(
        Object.entries(trackingData).filter(([key, value]) => value !== null && value !== undefined && value !== '')
      );

      if (Object.keys(filteredTrackingData).length > 0) {
        cookiePersistence.webUserCity.setItem(JSON.stringify(filteredTrackingData));
        logger.debug('Filtered user city tracking data saved to cookie', {
          middleware: 'GeoLocation',
          originalData: trackingData,
          filteredData: filteredTrackingData,
        });
      } else {
        logger.debug('No valid tracking data to save after filtering', {
          middleware: 'GeoLocation',
          originalData: trackingData,
        });
      }

      const regionIdNumber = parseInt(region_id, 10);
      const locationFromRegionId = !isNaN(regionIdNumber)
        ? (currentRegionIdMap[regionIdNumber as keyof typeof currentRegionIdMap] as
            | {
                zipcode: string;
                city: string;
                state: string;
              }
            | undefined)
        : undefined;

      const locationFromHeader = {
        city: city || '',
        state: region_code || '',
        zipcode: zip_code || '',
      };

      const hasCityCookie = cookiePersistence.webCity.getItem();
      let locationFromCookie: { zipcode: string; city: string; state: string } | undefined;

      if (hasCityCookie) {
        try {
          locationFromCookie = JSON.parse(hasCityCookie);
          logger.debug('Found existing city cookie', {
            middleware: 'GeoLocation',
            locationFromCookie,
          });
        } catch (error) {
          logger.warn('Failed to parse city cookie', {
            middleware: 'GeoLocation',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const location = locationFromRegionId?.zipcode
        ? locationFromRegionId
        : locationFromCookie?.zipcode
        ? locationFromCookie
        : locationFromHeader?.zipcode && country_code === EcEnv.NEXT_PUBLIC_COUNTRY
        ? locationFromHeader
        : currentDefaultCity;

      try {
        cookiePersistence.webCity.setItem(JSON.stringify(location));

        if (ip_address) {
          cookiePersistence.ipAddress.setItem(ip_address);
        }

        logger.debug('Geo location cookies updated successfully', {
          middleware: 'GeoLocation',
          location,
          source: locationFromRegionId?.zipcode
            ? 'region_id'
            : locationFromCookie?.zipcode
            ? 'cookie'
            : locationFromHeader?.zipcode && country_code === EcEnv.NEXT_PUBLIC_COUNTRY
            ? 'header'
            : 'default',
          region_id,
          wasExisting: !!hasCityCookie,
        });
      } catch (error) {
        logger.warn('Failed to update geo location cookies', {
          middleware: 'GeoLocation',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      try {
        request.headers.set('x-geo-city', location.city);
        request.headers.set('x-geo-state', location.state);
        request.headers.set('x-geo-zipcode', location.zipcode);
        if (ip_address) {
          request.headers.set('x-geo-ip', ip_address);
        }

        logger.debug('Geo location headers set', {
          middleware: 'GeoLocation',
          city: location.city,
          state: location.state,
          zipcode: location.zipcode,
        });
      } catch (error) {
        logger.warn('Failed to set geo location headers', {
          middleware: 'GeoLocation',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (error) {
      logger.error('Unexpected error in geo location middleware', {
        middleware: 'GeoLocation',
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return middleware(request, event, response);
  };
}
