// app/api/maintenance/route.ts
import { EcEnv } from '@castlery/config';
import { promises as dns } from 'dns';
import { captureStructuredError } from '@castlery/observability/server';

export const revalidate = 60; // 60秒自动重新验证

// dev and test environment is on test domain
// uat and prod is on production domain
const isTest = EcEnv.NEXT_PUBLIC_APPLICATION_ENV?.includes('test') || false;
const isUat = EcEnv.NEXT_PUBLIC_APPLICATION_ENV?.includes('uat') || false;

const country = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase() || 'us';
// test-sg-maintenance-status.castlery.com
const domain = isTest
  ? `test-${country}-maintenance-status.castlery.com`
  : `${country}-maintenance-status.castlery.com`;

// DNS查询超时时间: 2秒
// DNS queries should complete in 1-2s normally, 3s provides buffer for degraded conditions
const DNS_TIMEOUT_MS = 2000;

// 内存缓存配置
// In-memory cache to prevent repeated DNS queries when Redis is down
const CACHE_SUCCESS_TTL = 60 * 1000; // 成功时缓存60秒
const CACHE_FAILURE_TTL = 30 * 1000; // 失败时缓存30秒，避免频繁重试

interface CacheEntry {
  value: boolean;
  timestamp: number;
  isError: boolean;
}

let memoryCache: CacheEntry | null = null;

/**
 * 检查缓存是否有效
 * Check if cache is still valid
 */
function isCacheValid(cache: CacheEntry | null): boolean {
  if (!cache) return false;
  const now = Date.now();
  const ttl = cache.isError ? CACHE_FAILURE_TTL : CACHE_SUCCESS_TTL;
  return now - cache.timestamp < ttl;
}

/**
 * 带超时的DNS查询
 * DNS query with timeout to prevent hanging when DNS/Redis is down
 */
async function resolveTxtWithTimeout(domain: string, timeoutMs: number): Promise<string[][] | null> {
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      // Sentry.captureException(new Error('DNS query timeout'));
      resolve(null);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([dns.resolveTxt(domain), timeoutPromise]);
    return result;
  } catch (error) {
    captureStructuredError(new Error('DNS query failed: ' + (error as Error).message));
    // DNS查询失败，返回null
    return null;
  }
}

export async function GET() {
  try {
    // 如果是uk环境，则直接返回false
    if (isUat) {
      return Response.json({ maintenance: false });
    }

    // 第一层：应用内存缓存 (不依赖 Redis！)
    // Check memory cache first to avoid repeated DNS queries
    if (isCacheValid(memoryCache)) {
      // 应用缓存还有效，直接返回
      // 这个缓存在进程内存中，完全独立于 Redis
      return Response.json({ maintenance: memoryCache!.value });
    }

    // 应用缓存也过期了，才查询 DNS
    const status = await resolveTxtWithTimeout(domain, DNS_TIMEOUT_MS);

    // 如果DNS查询超时或失败，缓存默认值false (不开启维护模式)
    if (!status) {
      memoryCache = {
        value: false,
        timestamp: Date.now(),
        isError: true, // 标记为错误，使用较短的缓存时间(30秒)
      };

      // 第二层：Cache-Control header，告诉 CDN/浏览器缓存 30s 或 60s
      // 失败时使用较短的缓存时间 (30秒)
      return Response.json({ maintenance: false });
    }

    const current = status?.[0]?.[0] || 'off';
    const maintenanceStatus = current === 'on';

    // 缓存成功的查询结果(60秒)
    memoryCache = {
      value: maintenanceStatus,
      timestamp: Date.now(),
      isError: false,
    };

    // 成功时使用标准缓存时间 (60秒)
    return Response.json({ maintenance: maintenanceStatus });
  } catch (error) {
    captureStructuredError(error);

    // 发生异常时也缓存默认值
    memoryCache = {
      value: false,
      timestamp: Date.now(),
      isError: true,
    };

    // 异常时使用较短的缓存时间 (30秒)
    return Response.json({ maintenance: false });
  }
}
