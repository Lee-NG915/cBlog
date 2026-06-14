import { NextResponse } from 'next/server';
import { CustomMiddleware } from '../lib/chain';
import { logger } from '@castlery/observability/server';
import { basePageConfig, EcEnv } from '@castlery/config';
import { getRequiredParams, createRedirectWithState } from '../lib/utils';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

// auth login config
const requireNoAuthRoutes = ['signup', 'login', 'forgot-password'];
const requireLoginRoutes = [
  'profile',
  'orders',
  'vouchers',
  'account-rewards',
  'address',
  'order-details',
  'my-reviews',
  'rewards',
];

/**
 * Check if the path matches the specified route
 */
function isRouteMatch(pathname: string, route: string): boolean {
  const routePath = basePageConfig[route as keyof typeof basePageConfig];
  if (!routePath) return false;

  return pathname === routePath || pathname.startsWith(routePath);
}

/**
 * 创建登录重定向 URL
 * 账户路由直接跳转到登录页，其他路由带上 redirectUrl 以便登录后返回
 */
function createLoginRedirectUrl(region: string, originalPathname: string, search: string, baseUrl: string): URL {
  const loginPath = basePageConfig.login;
  const isAccountRoute = originalPathname.startsWith('/account');

  if (isAccountRoute) {
    return new URL(`/${region}${loginPath}`, baseUrl);
  } else {
    const fullUrl = originalPathname + search;
    const redirectUrl = encodeURIComponent(fullUrl);
    return new URL(`/${region}${loginPath}?redirectUrl=${redirectUrl}`, baseUrl);
  }
}

/**
 * 获取用户认证状态
 */
function getUserAuthStatus(persistenceHandles: ReturnType<typeof makePersistenceHandles>): {
  isAuthenticated: boolean;
  token: string | null;
} {
  try {
    const userToken = persistenceHandles?.webAccessToken?.getItem() || null;
    return { isAuthenticated: !!userToken, token: userToken };
  } catch (error) {
    return { isAuthenticated: false, token: null };
  }
}

/**
 * 清除认证 tokens
 */
function clearAuthTokens(persistenceHandles: ReturnType<typeof makePersistenceHandles>): void {
  persistenceHandles.webAccessToken.removeItem();
  persistenceHandles.webRefreshToken.removeItem();
}

/**
 * 刷新 access token
 */
async function refreshAccessToken(
  persistenceHandles: ReturnType<typeof makePersistenceHandles>,
  response: NextResponse
): Promise<string | null> {
  try {
    const refresh_token = persistenceHandles?.webRefreshToken?.getItem();
    if (!refresh_token) {
      return null;
    }

    const refreshResponse = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Channel': EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase(),
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    if (!refreshResponse.ok) {
      // 刷新失败，清理 tokens
      clearAuthTokens(persistenceHandles);
      return null;
    }

    const tokenData = await refreshResponse.json();
    const { access_token, refresh_token: new_refresh_token } = tokenData;

    // 保存新的 tokens
    persistenceHandles.webAccessToken.setItem(access_token);
    persistenceHandles.webRefreshToken.setItem(new_refresh_token);

    return access_token;
  } catch (error) {
    logger.error('Failed to refresh access token', { error });
    // 刷新失败，清理 tokens
    clearAuthTokens(persistenceHandles);
    return null;
  }
}

/**
 * Edge Runtime 兼容的 Base64 解码函数
 * 使用 Web API 而不是 Node.js Buffer
 * 支持标准 Base64 和 Base64URL 格式
 */
function decodeBase64(base64: string): string {
  // Base64 URL 安全字符替换（兼容 Base64URL）
  const base64Url = base64.replace(/-/g, '+').replace(/_/g, '/');

  // 添加 padding
  const padding = base64Url.length % 4;
  const paddedBase64 = base64Url + (padding ? '='.repeat(4 - padding) : '');

  // 使用 atob 解码（Edge Runtime 支持）
  // atob 返回 Latin-1 字符串，对于 JSON payload（通常是 ASCII）可以直接使用
  const binaryString = atob(paddedBase64);

  // 将 Latin-1 字符串转换为 UTF-8
  // 对于 JSON payload，这确保正确处理所有字符
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder('utf-8').decode(bytes);
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decodedPayload = decodeBase64(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    logger.error('Failed to parse JWT token', { error });
    return null;
  }
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  if (!exp || typeof exp !== 'number') {
    return false;
  }

  const expirationTime = exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

export function userAuthMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    try {
      const { originalPathname, region } = getRequiredParams(request);

      const persistenceHandles = makePersistenceHandles({
        req: request,
        res: response,
      });

      const { isAuthenticated, token } = getUserAuthStatus(persistenceHandles);

      const isRequireNoAuthRoute = requireNoAuthRoutes.some((route) => isRouteMatch(originalPathname, route));

      const isRequireLoginRoute = requireLoginRoutes.some((route) => isRouteMatch(originalPathname, route));

      if (isRequireNoAuthRoute && isAuthenticated) {
        const targetUrl = new URL(`/${region}`, request.url);
        return createRedirectWithState(response, targetUrl);
      }

      if (isRequireLoginRoute && !isAuthenticated) {
        const targetUrl = createLoginRedirectUrl(region, originalPathname, request.nextUrl.search, request.url);
        return createRedirectWithState(response, targetUrl);
      }

      if (isAuthenticated && token) {
        try {
          const payload = parseJwtPayload(token);
          if (payload) {
            if (isTokenExpired(payload)) {
              logger.info('Access token expired, attempting to refresh');
              const newAccessToken = await refreshAccessToken(persistenceHandles, response);

              if (!newAccessToken) {
                clearAuthTokens(persistenceHandles);
                if (isRequireLoginRoute) {
                  const targetUrl = createLoginRedirectUrl(
                    region,
                    originalPathname,
                    request.nextUrl.search,
                    request.url
                  );
                  return createRedirectWithState(response, targetUrl);
                }
              }
            }
          } else {
            logger.warn('Failed to parse JWT token payload');
          }
        } catch (error) {
          logger.error('Failed to parse JWT token in middleware', { error });
        }
      }

      return middleware(request, event, response);
    } catch (error) {
      logger.error('UserAuth middleware error', {
        middleware: 'UserAuth',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // 继续执行，不中断链路
      return middleware(request, event, response);
    }
  };
}
