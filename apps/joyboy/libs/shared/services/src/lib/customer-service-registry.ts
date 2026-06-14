// Registry to break circular dependency between modules-user-services and shared-components.
// sdk-loader in shared-components registers clearUser after SDK init; consumers in service
// layers call clearCustomerServiceUser() without importing shared-components directly.

let _clearUser: (() => Promise<void>) | null = null;

export function registerCustomerServiceClearUser(fn: () => Promise<void>): void {
  _clearUser = fn;
}

export function clearCustomerServiceUser(): void {
  _clearUser?.().catch(() => {});
}
