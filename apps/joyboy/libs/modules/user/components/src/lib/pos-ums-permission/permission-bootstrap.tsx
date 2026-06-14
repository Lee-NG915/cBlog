'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { resetPosUmsPermission, resetPosUmsUserInfo } from '@castlery/modules-user-domain';
import {
  canPosUmsAccess,
  clearPosUmsInfoCache,
  clearPosUmsLegacyRemnants,
  clearPosUmsLoginSession,
  hasPosUmsSessionRemnants,
  POS_UMS_PERMISSIONS,
  PosUmsAuthService,
  syncPosUmsPermissions,
} from '@castlery/modules-user-services';
import { getPosLoginRedirectUrl, isPosAuthRoute } from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { sharedFeatureService } from '@castlery/shared-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

type PosUmsPermissionBootstrapProps = {
  /** 当前 locale，与 OIDC `UserManager` / 回调路径中的 locale 段一致 */
  locale: string;
};

/** 与 `window` 上挂载的 token 取数器类型一致（供 `shared-prepare-headers` 等注入层读取） */
type PosUmsWindowWithTokenGetter = Window & {
  __POS_UMS_GET_VALID_BEARER_TOKEN__?: () => Promise<string | null>;
};

const enablePosUmsAuth = sharedFeatureService.enabledPosUmsAuth;
const POS_UMS_RUNTIME_TOKEN_TIMEOUT_MS = 8000;

function buildCountrySelectionUrl(deniedRegion: string) {
  const searchParams = new URLSearchParams({
    deniedRegion,
  });

  return `/?${searchParams.toString()}`;
}

async function withTokenTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * POS UMS 权限与鉴权侧的「引导」组件（无 UI，挂在 `apps/pos` 的 `[locale]/layout` 等上层）。
 *
 * **职责概览**
 * 1. **内存权限同步**：在 UMS 开启市场中，派发 `syncPosUmsPermissions`，把 `/user/info` 解析进 Redux，
 *    解决「用户直接刷新业务页、未再次经过 login/callback」时权限快照缺失的问题。
 * 2. **清理**：关闭市场开关、或从 UMS 切回 legacy 时，检测并清理 UMS 残留会话，重置 Redux 权限态，避免半登录态。
 * 3. **请求头侧的「有效 Bearer」**：在 `window` 上注册异步取 token 方法，供 RTK `prepareHeaders` 等调用；
 *    使用 `getValidUser()`（含静默续期）而不是只读 localStorage 里的静态 access_token，避免过期 token 被发出。
 *
 * **为何在 render 里写一遍 `window.__POS_UMS_GET_VALID_BEARER_TOKEN__`？**
 * - 首次客户端渲染就需要让注入层能取 token；若只放在 `useEffect`，首屏发出的请求可能仍拿不到异步入口。
 * - 仅在 `typeof window !== 'undefined'` 下执行，避免 SSR 访问 `window`。
 *
 * **为何 `useEffect` 里再处理一遍开关 / 路由？**
 * - 响应运行时 feature 与当前路由变化，并做 layout 级兜底同步；卸载时清理全局 hook，避免残留闭包 locale。
 */
export function PosUmsPermissionBootstrap({ locale }: PosUmsPermissionBootstrapProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const hasHandledAccessRevokedRef = React.useRef(false);
  const hasHandledUnauthenticatedRef = React.useRef(false);
  const hasHandledLegacyUmsCleanupRef = React.useRef(false);

  const handleAccessRevoked = React.useCallback(async () => {
    if (hasHandledAccessRevokedRef.current) {
      return;
    }

    hasHandledAccessRevokedRef.current = true;
    dispatch(resetPosUmsPermission());
    dispatch(resetPosUmsUserInfo());
    clearPosUmsInfoCache();

    const service = PosUmsAuthService.getInstance(locale);

    try {
      await service.signoutRedirect({
        state: {
          postLogoutRedirectPath: buildCountrySelectionUrl(locale),
        },
      });
      return;
    } catch {
      await clearPosUmsLoginSession({
        locale,
        clearRetailContext: true,
        authService: service,
      });
      await router.replace(buildCountrySelectionUrl(locale));
    }
  }, [dispatch, locale, router]);

  const handleUnauthenticated = React.useCallback(async () => {
    if (hasHandledUnauthenticatedRef.current) {
      return;
    }

    hasHandledUnauthenticatedRef.current = true;
    dispatch(resetPosUmsPermission());
    dispatch(resetPosUmsUserInfo());

    await clearPosUmsLoginSession({
      locale,
      clearRetailContext: true,
    });

    await router.replace(getPosLoginRedirectUrl({ locale }));
  }, [dispatch, locale, router]);

  const handleLegacyUmsCleanup = React.useCallback(
    async (getIsMounted: () => boolean) => {
      if (typeof window === 'undefined') {
        return;
      }

      (window as PosUmsWindowWithTokenGetter).__POS_UMS_GET_VALID_BEARER_TOKEN__ = undefined;
      dispatch(resetPosUmsPermission());
      dispatch(resetPosUmsUserInfo());

      if (!hasPosUmsSessionRemnants() || hasHandledLegacyUmsCleanupRef.current) {
        return;
      }

      hasHandledLegacyUmsCleanupRef.current = true;

      await clearPosUmsLegacyRemnants({
        locale,
        clearRetailContext: true,
      });

      if (!getIsMounted()) {
        return;
      }

      await router.replace(getPosLoginRedirectUrl({ locale, preserveCurrentUrl: false }));
    },
    [dispatch, locale, router]
  );

  // ---------- 同步注册：供同一客户端会话内任意时刻发出的请求使用 `getValidUser()` ----------
  if (typeof window !== 'undefined') {
    const posUmsWindow = window as PosUmsWindowWithTokenGetter;

    if (!enablePosUmsAuth) {
      // 当前市场未开启 UMS：显式摘除全局取数器，防止沿用其它会话或旧 bundle 遗留的实现
      posUmsWindow.__POS_UMS_GET_VALID_BEARER_TOKEN__ = undefined;
    } else {
      /**
       * 请求头注入层通过该入口拿到「当前可用」的 Bearer（含静默续期后的新 access_token），
       * 避免只拼接 persistence 里可能已过期的字符串。
       */
      posUmsWindow.__POS_UMS_GET_VALID_BEARER_TOKEN__ = async () => {
        const user = await withTokenTimeout(
          PosUmsAuthService.getInstance(locale).getValidUser(),
          POS_UMS_RUNTIME_TOKEN_TIMEOUT_MS
        );

        if (!user?.access_token) {
          return null;
        }

        return `Bearer ${user.access_token}`;
      };
    }
  }

  React.useEffect(() => {
    // ----- 分支 A：本市场未启用 POS UMS -----
    if (!enablePosUmsAuth) {
      let mounted = true;

      void handleLegacyUmsCleanup(() => mounted);

      return () => {
        mounted = false;
      };
    }

    if (pathname && isPosAuthRoute(pathname, locale)) {
      return;
    }

    hasHandledAccessRevokedRef.current = false;
    hasHandledUnauthenticatedRef.current = false;

    // ----- 分支 B：UMS 市场：layout 兜底拉一次权限（与 login/callback 内同步互补）-----
    void dispatch(syncPosUmsPermissions({ locale }))
      .unwrap()
      .then(async (permissionState) => {
        if (permissionState.status === 'unauthenticated') {
          await handleUnauthenticated();
          return;
        }

        if (!canPosUmsAccess(permissionState, POS_UMS_PERMISSIONS.posPagesRead)) {
          await handleAccessRevoked();
        }
      })
      .catch(() => {
        // 同步失败时让权限 slice 自己落到 error；页面 guard 会退出 loading，
        // 不在这里额外 reset，避免把状态重新打回 idle 后永久 loading。
        hasHandledAccessRevokedRef.current = false;
        hasHandledUnauthenticatedRef.current = false;
      });

    return () => {
      // 卸载时移除全局取数器，减少内存引用与错误的 locale 闭包；下一 mount 会由 render 重新注册
      if (typeof window !== 'undefined') {
        (window as PosUmsWindowWithTokenGetter).__POS_UMS_GET_VALID_BEARER_TOKEN__ = undefined;
      }
    };
  }, [dispatch, handleAccessRevoked, handleLegacyUmsCleanup, handleUnauthenticated, locale, pathname]);

  return null;
}
