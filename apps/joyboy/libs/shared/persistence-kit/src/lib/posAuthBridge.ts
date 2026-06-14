import type { User } from 'oidc-client-ts';
import { makePersistenceHandles } from './persistenceHandles';

type ClearPosBridgeSessionOptions = {
  locale: string;
  clearRetailContext?: boolean;
};

type RedirectToPosLoginOptions = {
  locale: string;
  preserveCurrentUrl?: boolean;
};

const getPosAuthRoutePaths = (locale: string) => {
  return new Set([`/${locale}/login`, `/${locale}/auth/callback`, `/${locale}/auth/logout-callback`]);
};

const sharedAuthRoutePaths = new Set([
  '/login',
  '/callback',
  '/auth/callback',
  '/logout-callback',
  '/auth/logout-callback',
]);

function isPosReservedAuthPath(pathname: string, locale: string): boolean {
  return sharedAuthRoutePaths.has(pathname) || isPosAuthRoute(pathname, locale);
}

export function isPosAuthRoute(pathname: string, locale: string): boolean {
  return getPosAuthRoutePaths(locale).has(pathname);
}

export function normalizePosCallbackUrl(locale: string, callbackUrl?: string | null): string | undefined {
  if (!callbackUrl) {
    return undefined;
  }

  try {
    const baseUrl = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const normalizedUrl = new URL(callbackUrl, baseUrl);
    const currentOrigin = typeof window === 'undefined' ? normalizedUrl.origin : window.location.origin;

    if (normalizedUrl.origin !== currentOrigin) {
      return undefined;
    }

    // callbackUrl 只能回到业务页面；认证协议页和手工输入的裸 callback/logout-callback
    // 都必须被过滤，否则登录成功后会被再次带回无效的 auth route。
    if (isPosReservedAuthPath(normalizedUrl.pathname, locale)) {
      return undefined;
    }

    return `${normalizedUrl.pathname}${normalizedUrl.search}`;
  } catch {
    return undefined;
  }
}

export function isPosUmsUserExpired(user?: Pick<User, 'expired'> | null): boolean {
  return Boolean(user?.expired);
}

export async function persistPosUmsBridgeSession(locale: string, user: User): Promise<void> {
  const persistenceHandles = makePersistenceHandles();
  const secure = typeof window === 'undefined' ? true : window.location.protocol === 'https:';

  // 第一阶段只把 UMS 登录态桥接成 POS 当前真正需要消费的最小状态：
  // 1. `accessToken`：复用现有 token 存储位，避免大面积改造业务读写逻辑
  // 2. `isLoggedIn`：继续兼容 middleware 和客户端的已登录判断
  // 注意：这里故意不把 OIDC refresh token 写入 legacy 的 refresh 槽，
  // 否则旧的 `/oauth/token` 刷新逻辑会误消费 UMS token，导致隐式循环。
  persistenceHandles.accessToken.setItem(`Bearer ${user.access_token}`);
  persistenceHandles.refreshToken.removeItem();
  await persistenceHandles.isLoggedIn.setItem('1', {
    path: `/${locale}`,
    secure,
  });
}

export async function clearPosBridgeSession({
  locale,
  clearRetailContext = false,
}: ClearPosBridgeSessionOptions): Promise<void> {
  const persistenceHandles = makePersistenceHandles();

  // 认证桥接态
  persistenceHandles.accessToken.removeItem();
  persistenceHandles.refreshToken.removeItem();
  // persistenceHandles.posSalesId.removeItem();

  // 旧 POS logout 除 token 外还会清掉客户/订单相关上下文；
  // UMS logout 也需要对齐，否则重新进入登录页时会残留上一位销售或顾客的业务态。
  persistenceHandles.customerId.removeItem();
  persistenceHandles.temporaryCustomerEmail.removeItem();
  persistenceHandles.orderNumber.removeItem();
  persistenceHandles.city.removeItem();
  persistenceHandles.autoAppliedCoupon.removeItem();
  persistenceHandles.onlineCartSymbol.removeItem();
  persistenceHandles.xCheckoutSessionToken.removeItem();
  persistenceHandles.xPosCartToken.removeItem();

  if (clearRetailContext) {
    persistenceHandles.retailId.removeItem();
    persistenceHandles.retailStockLocationType.removeItem();
    persistenceHandles.retailDisplayLocationType.removeItem();
  }

  persistenceHandles.isLoggedIn.removeItem({ path: `/${locale}` });
  persistenceHandles.isLoggedIn.removeItem({ path: '/' });
}

export function getPosLoginRedirectUrl({ locale, preserveCurrentUrl = true }: RedirectToPosLoginOptions): string {
  const loginUrl = `/${locale}/login`;

  if (!preserveCurrentUrl || typeof window === 'undefined') {
    return loginUrl;
  }

  const callbackUrl = normalizePosCallbackUrl(locale, `${window.location.pathname}${window.location.search}`);

  if (!callbackUrl) {
    return loginUrl;
  }

  const searchParams = new URLSearchParams({ callbackUrl });

  return `${loginUrl}?${searchParams.toString()}`;
}

export function redirectToPosLogin(options: RedirectToPosLoginOptions): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(getPosLoginRedirectUrl(options));
}
