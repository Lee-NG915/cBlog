import type { UserManager } from 'oidc-client-ts';

export type SigninState = {
  callbackUrl?: string;
  locale: string;
};

export type UmsConfigSnapshot = {
  issuer: string;
  clientId: string;
  apiBaseUrl: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scope: string;
};

export type OidcRuntime = typeof import('oidc-client-ts');

export type OidcUserManager = UserManager;
