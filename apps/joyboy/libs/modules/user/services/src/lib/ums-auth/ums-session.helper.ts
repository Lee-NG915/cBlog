import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { clearPosBridgeSession } from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { clearPosUmsInfoCache } from './ums-api';
import { PosUmsAuthService } from './ums-auth.service';

const OIDC_STORAGE_KEY_PREFIX = 'oidc.';
const UMS_BRIDGE_ACCESS_TOKEN_PREFIX = 'Bearer ';

type ClearPosUmsLoginSessionOptions = {
  locale: string;
  clearRetailContext?: boolean;
  authService?: PosUmsAuthService | null;
};

type ClearPosUmsLegacyRemnantsOptions = {
  locale: string;
  clearRetailContext?: boolean;
};

/**
 * 检测浏览器里是否仍残留 UMS 登录态。
 * legacy 模式下若命中，说明用户可能来自 UMS 版本或回滚前的会话，需要主动清理。
 */
export function hasPosUmsSessionRemnants(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const persistenceHandles = makePersistenceHandles();
  const accessToken = persistenceHandles.accessToken.getItem();

  if (accessToken?.startsWith(UMS_BRIDGE_ACCESS_TOKEN_PREFIX)) {
    return true;
  }

  if (!window.localStorage) {
    return false;
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(OIDC_STORAGE_KEY_PREFIX)) {
      return true;
    }
  }

  return false;
}

/**
 * 在 legacy 模式下清理 UMS 残留，不加载 OIDC SDK。
 * 用于 `enabledPosUmsAuth = false` 时把半登录态收口到重新登录。
 */
export async function clearPosUmsLegacyRemnants({
  locale,
  clearRetailContext = true,
}: ClearPosUmsLegacyRemnantsOptions): Promise<void> {
  clearPosUmsInfoCache();
  await clearPosBridgeSession({
    locale,
    clearRetailContext,
  });
  clearOidcLocalStorage();
}

function clearOidcLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const keysToRemove: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(OIDC_STORAGE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

/**
 * 清空当前 POS UMS 登录态：
 * 1. 清掉 `/user/info` 缓存，避免被回收权限后继续命中旧快照
 * 2. 清掉 bridge 持久化（accessToken/isLoggedIn 等）
 * 3. 移除 OIDC 本地 user，防止页面回到 login 后仍被视为已登录
 */
export async function clearPosUmsLoginSession({
  locale,
  clearRetailContext = false,
  authService,
}: ClearPosUmsLoginSessionOptions): Promise<void> {
  clearPosUmsInfoCache();
  await clearPosBridgeSession({
    locale,
    clearRetailContext,
  });

  const service = authService || PosUmsAuthService.getInstance(locale);

  try {
    await service.removeUser();
  } catch {
    console.error('Failed to remove user');
    // removeUser 失败时仍继续后续跳转，避免用户被卡在半登录态页面。
  }
}
