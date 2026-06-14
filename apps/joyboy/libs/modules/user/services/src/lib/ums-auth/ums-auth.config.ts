import { EcEnv } from '@castlery/config';
import { assertBrowser } from './ums-auth.runtime';
import type { UmsConfigSnapshot } from './types';

/**
 * POS UMS OIDC 固定约定（仅 issuer / clientId / apiBaseUrl 通过环境变量按部署配置）。
 * 与 `apps/pos/app/[locale]/auth/callback`、`auth/logout-callback` 路由保持一致。
 */
export const POS_UMS_OIDC_REDIRECT_PATH = '/auth/callback';
export const POS_UMS_OIDC_POST_LOGOUT_REDIRECT_PATH = '/auth/logout-callback';
/** 需与 Hydra/IdP 上该 client 允许的 scope 一致 */
export const POS_UMS_OIDC_SCOPES = 'openid offline offline_access';

function normalizePath(path: string): string {
  const trimmed = (path || '').trim();
  if (!trimmed) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function buildLocalePath(locale: string, rawPath: string): string {
  const path = normalizePath(rawPath);
  return path.startsWith(`/${locale}/`) ? path : `/${locale}${path}`;
}

function buildAbsoluteUrl(path: string): string {
  assertBrowser();
  return new URL(path, window.location.origin).toString();
}

function getRequiredConfig(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required UMS config: ${key}`);
  }
  return value;
}

export function getPosUmsConfigSnapshot(locale: string): UmsConfigSnapshot {
  const issuer = getRequiredConfig(EcEnv.NEXT_PUBLIC_UMS_ISSUER, 'NEXT_PUBLIC_UMS_ISSUER');
  const clientId = getRequiredConfig(EcEnv.NEXT_PUBLIC_UMS_CLIENT_ID, 'NEXT_PUBLIC_UMS_CLIENT_ID');
  const apiBaseUrl = getRequiredConfig(EcEnv.NEXT_PUBLIC_UMS_API_BASE_URL, 'NEXT_PUBLIC_UMS_API_BASE_URL');

  return {
    issuer,
    clientId,
    apiBaseUrl,
    redirectUri: buildAbsoluteUrl(buildLocalePath(locale, POS_UMS_OIDC_REDIRECT_PATH)),
    postLogoutRedirectUri: buildAbsoluteUrl(buildLocalePath(locale, POS_UMS_OIDC_POST_LOGOUT_REDIRECT_PATH)),
    scope: POS_UMS_OIDC_SCOPES,
  };
}
