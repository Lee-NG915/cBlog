/**
 * HTTP status helpers for resource-level error semantics.
 *
 * "Resource invalid" means the resource we requested no longer applies to the
 * current credentials/session in a recoverable way: we should drop any cached
 * identifiers (cookies, ids) and let the next user action mint a fresh resource.
 *
 * Anything else (409 conflict, 429 rate limit, 5xx, network) is transient — the
 * resource is still valid, callers should preserve their state and retry later.
 */

/** HTTP status codes that mean "this resource is definitively invalid for the caller". */
export const RESOURCE_INVALID_STATUSES = [401, 403, 404, 410] as const;

export function isResourceInvalid(status: number | undefined | null): boolean {
  if (typeof status !== 'number') return false;
  return (RESOURCE_INVALID_STATUSES as readonly number[]).includes(status);
}

/**
 * Pull the HTTP status from an ApiClient rejection. Falls back to the legacy
 * `errors[0].code` shape used for 409/429 before status was attached to body.
 */
export function getErrorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const e = err as { status?: unknown; errors?: Array<{ code?: unknown }> };
  if (typeof e.status === 'number') return e.status;
  if (Array.isArray(e.errors) && e.errors.length > 0) {
    const code = e.errors[0]?.code;
    if (typeof code === 'number') return code;
  }
  return undefined;
}
