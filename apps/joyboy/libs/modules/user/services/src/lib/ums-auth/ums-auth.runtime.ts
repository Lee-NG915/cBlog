import type { OidcRuntime } from './types';

let oidcRuntimePromise: Promise<OidcRuntime> | null = null;

export function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('POS UMS auth service can only be used in the browser.');
  }
}

export async function loadOidcRuntime() {
  assertBrowser();
  if (!oidcRuntimePromise) {
    // 风险说明：
    // 这里使用浏览器端动态加载，避免服务端 bundle 提前求值 `oidc-client-ts` 导致 `window is not defined`。
    oidcRuntimePromise = import('oidc-client-ts');
  }

  return oidcRuntimePromise;
}
