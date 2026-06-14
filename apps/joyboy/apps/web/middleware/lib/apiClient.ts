/**
 * 🚀 高性能 Middleware API 客户端
 *
 * 专为同机器部署场景优化：
 * - ⚡ 600ms 超时，快速失败
 * - 🛡️ 智能兜底：API 失败立即使用备份数据
 * - 💾 Next.js 原生缓存：force-cache 策略
 * - 🎯 业务友好：预配置核心兜底数据
 */

import type { SaleInfo } from '@castlery/types';
import { logger } from '@castlery/observability/server';
import { EcEnv } from '@castlery/config';
import { FALLBACK_SALES_DATA } from './fallbackData';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface CategoryData {
  url: string;
  permalink: string;
  outdatedUrls?: string[];
}

// TODO 未来再来思考接口的优化 做快速失败太容易触发超时了 因为对应的接口确实在首次请求的时候会太大了
/**
 * Fetch categories for a specific region with fallback
 */
export async function fetchCategories(): Promise<ApiResponse<CategoryData[]>> {
  const url = `${EcEnv.APP_API_BASE_URL}/categories`;

  try {
    const response = await fetch(url, {
      credentials: 'omit',
      keepalive: true,
      next: {
        // 1 分钟
        revalidate: 60,
      },
    });
    const data = await response.json();
    return { data: data.value, error: null };
  } catch (error) {
    logger.warn('Categories API failed', {
      error: error instanceof Error ? error.message : String(error),
      url,
    });
    return { data: null, error: JSON.stringify(error) };
  }
}

/**
 * 读取内嵌的 fallback 数据
 * Edge Runtime 兼容：从编译时打包的常量中读取
 */
function loadFallbackSales(): SaleInfo[] | null {
  try {
    const market = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase() || 'sg';
    const fallbackData = FALLBACK_SALES_DATA[market];

    if (!fallbackData || !fallbackData.value) {
      logger.error('Fallback sales data not found', {
        market,
        availableMarkets: Object.keys(FALLBACK_SALES_DATA),
      });
      return null;
    }

    logger.warn('Using fallback sales data', {
      market,
      count: fallbackData.value.length,
      lastUpdated: fallbackData.lastUpdated,
    });

    return fallbackData.value;
  } catch (error) {
    logger.error('Failed to load fallback sales data', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Fetch sales for a specific region with fallback
 *
 * 降级策略：
 * 1. 尝试调用 API
 * 2. 如果 API 失败或返回 503，使用本地 fallback JSON
 * 3. 如果 fallback 也失败，返回空数组
 */
export async function fetchSales(): Promise<ApiResponse<SaleInfo[]>> {
  const url = `${EcEnv.APP_API_BASE_URL}/sales`;

  try {
    const response = await fetch(url, {
      credentials: 'omit',
      keepalive: true,
      next: {
        revalidate: 60,
      },
    });

    // 检查响应状态
    if (!response.ok) {
      // 503 或其他错误状态，使用 fallback
      logger.warn('Sales API returned error status', {
        status: response.status,
        statusText: response.statusText,
        url,
      });

      const fallbackData = loadFallbackSales();
      if (fallbackData) {
        return { data: fallbackData, error: `API returned ${response.status}, using fallback` };
      }

      return { data: null, error: `API failed with status ${response.status} and no fallback available` };
    }

    const data = await response.json();

    // 检查返回的数据是否有效
    if (!data.value || !Array.isArray(data.value)) {
      logger.warn('Sales API returned invalid data', {
        url,
        hasValue: !!data.value,
        valueType: typeof data.value,
      });

      const fallbackData = loadFallbackSales();
      if (fallbackData) {
        return { data: fallbackData, error: 'API returned invalid data, using fallback' };
      }
    }

    return { data: data.value, error: null };
  } catch (error) {
    logger.error('Sales API request failed', {
      error: error instanceof Error ? error.message : String(error),
      url,
    });

    // 尝试使用 fallback
    const fallbackData = loadFallbackSales();
    if (fallbackData) {
      return { data: fallbackData, error: `API request failed, using fallback: ${error}` };
    }

    return { data: null, error: (error as Error).message };
  }
}
