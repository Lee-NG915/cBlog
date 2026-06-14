import { test as base } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export interface CapturedEnvelope {
  type: string;
  tags: Record<string, string>;
  exception?: { values: Array<{ type: string; value: string }> };
  message?: string;
}

export interface SentryFixture {
  envelopes: CapturedEnvelope[];
  waitForEnvelope(opts?: { timeout?: number; messageIncludes?: string }): Promise<CapturedEnvelope>;
  clear(): void;
}

export const test = base.extend<{ sentry: SentryFixture }>({
  sentry: async ({ page }, use) => {
    const clientEnvelopeOutput = process.env.SENTRY_CLIENT_ENVELOPES_OUTPUT || '';
    const clientDebugOutput = process.env.SENTRY_CLIENT_DEBUG_OUTPUT || '';
    if (clientEnvelopeOutput) {
      fs.mkdirSync(path.dirname(clientEnvelopeOutput), { recursive: true });
    }
    if (clientDebugOutput) {
      fs.mkdirSync(path.dirname(clientDebugOutput), { recursive: true });
    }

    const envelopes: CapturedEnvelope[] = [];
    const pendingEnvelopes: CapturedEnvelope[] = [];
    const waiters: Array<(e: CapturedEnvelope) => void> = [];

    function pushEnvelope(envelope: CapturedEnvelope) {
      if (clientEnvelopeOutput) {
        const record = {
          timestamp: new Date().toISOString(),
          source: 'client',
          envelope,
        };
        fs.appendFileSync(clientEnvelopeOutput, `${JSON.stringify(record)}\n`, { encoding: 'utf8' });
      }
      envelopes.push(envelope);
      const waiter = waiters.shift();
      if (waiter) {
        waiter(envelope);
        return;
      }
      pendingEnvelopes.push(envelope);
    }

    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();
      const isSentryHost = url.includes('sentry.io');
      const isSentryEnvelopePath = /\/api\/\d+\/envelope\/?/.test(url);
      if (!isSentryHost && !isSentryEnvelopePath) {
        return route.continue();
      }
      if (clientDebugOutput) {
        fs.appendFileSync(
          clientDebugOutput,
          `${JSON.stringify({
            timestamp: new Date().toISOString(),
            phase: 'matched',
            method: request.method(),
            url,
          })}\n`,
          { encoding: 'utf8' }
        );
      }

      // Hard-stop any browser-side Sentry upload during e2e to avoid real alert emails.
      if (!url.includes('/envelope')) {
        return route.fulfill({ status: 200, body: '{}' });
      }

      if (request.method() !== 'POST') {
        return route.fulfill({ status: 200, body: '{}' });
      }

      let body = request.postData();
      if (!body && typeof request.postDataBuffer === 'function') {
        const buf = request.postDataBuffer();
        if (buf && buf.length) {
          body = buf.toString('utf8');
        }
      }
      if (!body) {
        if (clientDebugOutput) {
          fs.appendFileSync(
            clientDebugOutput,
            `${JSON.stringify({
              timestamp: new Date().toISOString(),
              phase: 'empty-body',
              method: request.method(),
              url,
            })}\n`,
            { encoding: 'utf8' }
          );
        }
        return route.fulfill({ status: 200, body: '{}' });
      }

      const lines = body.split('\n').filter((l) => l.length > 0);
      let sawEvent = false;
      for (let i = 1; i < lines.length; i++) {
        try {
          const parsed = JSON.parse(lines[i]);
          if (parsed.type === 'event') {
            const payload = JSON.parse(lines[i + 1]);
            sawEvent = true;
            pushEnvelope({
              type: parsed.type,
              tags: payload.tags || {},
              exception: payload.exception,
              message: payload.message,
            });
            i++;
          }
        } catch {
          // ignore malformed envelope items
        }
      }

      if (!sawEvent && lines.length > 0) {
        if (clientDebugOutput) {
          fs.appendFileSync(
            clientDebugOutput,
            `${JSON.stringify({
              timestamp: new Date().toISOString(),
              phase: 'no-parseable-event',
              method: request.method(),
              url,
              preview: lines.slice(0, 4),
            })}\n`,
            { encoding: 'utf8' }
          );
        }
        // eslint-disable-next-line no-console
        console.error('[sentry-envelope] POST without parseable event item; first lines:', lines.slice(0, 4));
      }

      return route.fulfill({ status: 200, body: '{}' });
    });

    await use({
      envelopes,
      waitForEnvelope: ({ timeout = 30_000, messageIncludes } = {}) =>
        new Promise<CapturedEnvelope>((resolve, reject) => {
          const matchesFilter = (env: CapturedEnvelope) => {
            if (!messageIncludes) return true;
            const message = env.message || env.exception?.values?.[0]?.value || '';
            return message.includes(messageIncludes);
          };

          const pendingMatchIdx = pendingEnvelopes.findIndex(matchesFilter);
          if (pendingMatchIdx >= 0) {
            const [pending] = pendingEnvelopes.splice(pendingMatchIdx, 1);
            resolve(pending);
            return;
          }

          // Declare waiterRef first so the timer callback can reference it by closure.
          // Both closures capture each other by reference — values are resolved at call time.
          const waiterRef = (env: CapturedEnvelope) => {
            if (!matchesFilter(env)) {
              // Not the envelope this waiter is interested in; put it back for other waiters.
              pendingEnvelopes.push(env);
              return;
            }
            clearTimeout(timer);
            resolve(env);
          };
          const timer = setTimeout(() => {
            const idx = waiters.indexOf(waiterRef);
            if (idx >= 0) waiters.splice(idx, 1);
            reject(new Error('Timed out waiting for Sentry envelope'));
          }, timeout);
          waiters.push(waiterRef);
        }),
      clear: () => {
        envelopes.length = 0;
        pendingEnvelopes.length = 0;
        waiters.length = 0;
      },
    });
  },
});

export { expect } from '@playwright/test';
