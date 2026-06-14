'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { resetPosUmsPermission, resetPosUmsUserInfo } from '@castlery/modules-user-domain';
import { clearPosUmsInfoCache, PosUmsAuthService, syncPosUmsPermissions } from '@castlery/modules-user-services';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit/lib/persistenceHandles';
import {
  normalizePosCallbackUrl,
  persistPosUmsBridgeSession,
} from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { useAppDispatch } from '@castlery/shared-redux-store';
import type { User } from 'oidc-client-ts';
import { PermissionLoading } from '@castlery/shared-components';

const CALLBACK_LOCK_KEY_PREFIX = 'pos-ums-callback-lock:';
const LOCK_WAIT_INTERVAL_MS = 300;
const LOCK_WAIT_MAX_RETRIES = 10;
type SigninState = {
  callbackUrl?: string;
};

function isValidOidcCallbackUrl(url: URL): boolean {
  const hasState = Boolean(url.searchParams.get('state'));
  const hasCode = Boolean(url.searchParams.get('code'));
  const hasError = Boolean(url.searchParams.get('error'));

  // 仅接受标准 OIDC redirect callback：
  // - 成功回调：code + state
  // - 失败回调：error + state
  // 手动直访 callback 页通常不包含这些参数，应直接回 login。
  return hasState && (hasCode || hasError);
}

function getDefaultRedirectUrl(locale: string): string {
  return `/${locale}/login`;
}

function getDiscoverRedirectUrl(locale: string): string {
  return `/${locale}/discover`;
}

function getRedirectUrl(user: User, locale: string): string {
  const state = (user.state || {}) as SigninState;
  const storedRetailId = makePersistenceHandles().retailId.getItem();
  const normalizedCallbackUrl = normalizePosCallbackUrl(locale, state.callbackUrl);
  const fallbackUrl = getDefaultRedirectUrl(locale);

  // callback 成功后优先看本地是否已经有 retailId：
  // 1. 有 retailId：说明 branch 上下文已完成，可直接进入目标页面
  // 2. 无 retailId：回到 login 完成 branch 选择
  if (storedRetailId) {
    return normalizedCallbackUrl || getDiscoverRedirectUrl(locale);
  }

  if (!normalizedCallbackUrl) {
    return fallbackUrl;
  }

  const searchParams = new URLSearchParams({
    callbackUrl: normalizedCallbackUrl,
  });
  // 无 retailId 时仍需先回到 login，由该页面完成 branch 选择后再继续跳转。
  return `${fallbackUrl}?${searchParams.toString()}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PosUmsCallbackPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'ca';
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        const currentHref = window.location.href;
        const currentUrl = new URL(currentHref);

        if (!isValidOidcCallbackUrl(currentUrl)) {
          window.location.replace(getDefaultRedirectUrl(locale));
          return;
        }

        // 风险控制：
        // OIDC authorization code 只能兑换一次 token。
        // 在 Next.js 开发环境下，React StrictMode 可能导致 effect 执行两次，
        // 从而触发重复的 token 兑换请求。这里用 sessionStorage 做一次性锁，避免重复兑换同一个 callback URL。
        const callbackLockKey = `${CALLBACK_LOCK_KEY_PREFIX}${currentHref}`;

        if (window.sessionStorage.getItem(callbackLockKey)) {
          const authService = PosUmsAuthService.getInstance(locale);
          let currentUser = await authService.getValidUser();
          let retryCount = 0;

          // 严格模式下第一次 effect 可能已经在后台完成了 code 兑换，
          // 但第二次 effect 进来时 user 还没来得及写入 storage。
          // 这里等待一小段时间轮询，而不是立刻 fallback 到 login，避免打断正常登录流程。
          while (!currentUser && retryCount < LOCK_WAIT_MAX_RETRIES) {
            await sleep(LOCK_WAIT_INTERVAL_MS);
            currentUser = await authService.getValidUser();
            retryCount += 1;
          }

          if (currentUser) {
            await persistPosUmsBridgeSession(locale, currentUser);
            await dispatch(syncPosUmsPermissions({ locale })).unwrap();
            window.location.replace(getRedirectUrl(currentUser, locale));
            return;
          }

          window.sessionStorage.removeItem(callbackLockKey);
          throw new Error('OIDC callback is locked but no user was restored from storage.');
        }

        window.sessionStorage.setItem(callbackLockKey, '1');
        const authService = PosUmsAuthService.getInstance(locale);
        const user = await authService.signinRedirectCallback(currentHref);
        if (!mounted) return;

        await persistPosUmsBridgeSession(locale, user);
        await dispatch(syncPosUmsPermissions({ locale })).unwrap();

        if (!mounted) return;

        window.location.replace(getRedirectUrl(user, locale));
      } catch (err) {
        if (!mounted) return;
        window.sessionStorage.removeItem(`${CALLBACK_LOCK_KEY_PREFIX}${window.location.href}`);
        clearPosUmsInfoCache();
        dispatch(resetPosUmsPermission());
        dispatch(resetPosUmsUserInfo());
        window.location.replace(getDefaultRedirectUrl(locale));
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [dispatch, locale]);

  return <PermissionLoading />;
}
