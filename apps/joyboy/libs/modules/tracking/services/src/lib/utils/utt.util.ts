/**
 * @description Transport layer for impact.com Universal Tracking Tag (UTT)
 * @see https://integrations.impact.com/impact-brand/docs/javascript-installation
 */

export type IreFn = ((...args: unknown[]) => void) & { a?: unknown[][] };

/**
 * Install the impact.com `ire` queue stub. Any `ire(...)` call made before the
 * UTT loader script finishes downloading is pushed to `window.ire.a`; the real
 * UTT runtime consumes the queue on load. Idempotent — safe to call multiple
 * times.
 */
export function ensureIreQueue(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { ire_o?: string; ire?: IreFn };
  if (typeof w.ire === 'function') return;
  w.ire_o = 'ire';
  const queued = function (this: void, ...args: unknown[]) {
    (queued.a = queued.a || []).push(args);
  } as IreFn;
  w.ire = queued;
}

/**
 * @description Send a UTT event via impact.com `ire()` global.
 * @param verb - impact.com command verb ('consent' | 'identify' | 'trackConversion')
 * @param args - command-specific positional args
 * @see https://integrations.impact.com/impact-brand/docs/javascript-installation
 * @example
 * trackUtt('identify', { customerId: 'abc', customerEmail: '<hash>' });
 * trackUtt('trackConversion', 41642, payload, { verifySiteDefinitionMatch: true });
 */
export function trackUtt(verb: string, ...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  const fn = (window as unknown as { ire?: IreFn }).ire;
  if (typeof fn === 'function') fn(verb, ...args);
}
