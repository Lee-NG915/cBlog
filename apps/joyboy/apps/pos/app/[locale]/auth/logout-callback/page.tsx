'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { resetPosUmsPermission, resetPosUmsUserInfo } from '@castlery/modules-user-domain';
import { clearPosUmsLoginSession, PosUmsAuthService } from '@castlery/modules-user-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { PermissionLoading } from '@castlery/shared-components';

type LogoutUserState = {
  postLogoutRedirectPath?: string;
};

function isValidOidcLogoutCallbackUrl(url: URL): boolean {
  const hasState = Boolean(url.searchParams.get('state'));
  const hasError = Boolean(url.searchParams.get('error'));

  // signout callback 至少应携带 state（正常登出）或 error（失败回调）。
  // 手动直访 logout-callback 通常不包含任何 OIDC 参数，应直接回 login。
  return hasState || hasError;
}

export default function PosUmsLogoutCallbackPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'en';
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;
    const countrySelectionUrl = '/';
    const currentUrl = new URL(window.location.href);

    if (!isValidOidcLogoutCallbackUrl(currentUrl)) {
      window.location.replace(countrySelectionUrl);
      return;
    }

    const service = PosUmsAuthService.getInstance(locale);

    service
      .signoutRedirectCallback(currentUrl.toString())
      .then(async (signoutResponse) => {
        const userState = (signoutResponse.userState || {}) as LogoutUserState;
        const redirectPath = userState.postLogoutRedirectPath || countrySelectionUrl;

        await clearPosUmsLoginSession({
          locale,
          clearRetailContext: true,
          authService: service,
        });
        dispatch(resetPosUmsPermission());
        dispatch(resetPosUmsUserInfo());
        if (mounted) {
          window.location.replace(redirectPath);
        }
      })
      .catch(() => {
        if (mounted) {
          window.location.replace(countrySelectionUrl);
        }
      });

    return () => {
      mounted = false;
    };
  }, [dispatch, locale]);

  return <PermissionLoading />;
}
