import type { ErrorEvent, EventHint } from '@sentry/nextjs';
import { clientBeforeSend, type BeforeSendDeps } from './client-before-send';

const defaultDeps: BeforeSendDeps = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  isOnline: true,
  language: 'en-US',
  locationHref: 'https://www.castlery.com/us/products/owen-chaise-sectional-sofa',
  logDebug: () => undefined,
};

function makeEvent(overrides: Partial<ErrorEvent> = {}): ErrorEvent {
  return {
    message: 'Test error',
    exception: {
      values: [
        {
          type: 'Error',
          value: 'Test error',
          stacktrace: {
            frames: [{ filename: 'app:///_next/static/chunks/pages/index.js', lineno: 1, colno: 1 }],
          },
        },
      ],
    },
    tags: {},
    contexts: {},
    ...overrides,
  } as ErrorEvent;
}

function makeHint(error?: Error): EventHint {
  return { originalException: error || new Error('Test error') } as EventHint;
}

describe('clientBeforeSend', () => {
  it('always sets error_bucket and bucket_confidence tags', () => {
    const result = clientBeforeSend(makeEvent({ message: 'Some error' }), makeHint(), defaultDeps);
    expect(result).not.toBeNull();
    expect(result?.tags?.['error_bucket']).toBeDefined();
    expect(result?.tags?.['bucket_confidence']).toBeDefined();
  });

  it('classifies api_5xx for 500 status code', () => {
    const event = makeEvent({
      message: 'Request failed with status 500',
      contexts: { response: { status_code: 500 } } as ErrorEvent['contexts'],
    });
    const result = clientBeforeSend(event, makeHint(), defaultDeps);
    expect(result).not.toBeNull();
    expect(result?.tags?.['error_bucket']).toBe('api_5xx');
  });

  it('preserves existing domain and page_type tags', () => {
    const event = makeEvent({ tags: { domain: 'product', page_type: 'pdp' } as ErrorEvent['tags'] });
    const result = clientBeforeSend(event, makeHint(), defaultDeps);
    expect(result).not.toBeNull();
    expect(result?.tags?.['domain']).toBe('product');
    expect(result?.tags?.['page_type']).toBe('pdp');
  });

  it('drops Casa customer service SDK errors so they only report to Casa Sentry', () => {
    const event = makeEvent({
      tags: { domain: 'product', page_type: 'pdp' } as ErrorEvent['tags'],
      exception: {
        values: [
          {
            type: 'Error',
            value: 'Casa widget error',
            stacktrace: {
              frames: [
                { filename: 'https://crxcase-cdn-prod.castlery.com/casa/v1/sdk.js', lineno: 1, colno: 1 },
                { filename: 'app:///_next/static/chunks/app/layout.js', lineno: 1, colno: 1 },
              ],
            },
          },
        ],
      } as ErrorEvent['exception'],
    });
    expect(clientBeforeSend(event, makeHint(), defaultDeps)).toBeNull();
  });

  it('drops errors without stack trace', () => {
    const event = makeEvent({
      exception: { values: [{ type: 'Error', value: 'No stack' }] } as ErrorEvent['exception'],
    });
    expect(clientBeforeSend(event, makeHint(), defaultDeps)).toBeNull();
  });

  it('drops third-party-only errors', () => {
    const event = makeEvent({
      message: 'Some error',
      exception: {
        values: [
          {
            type: 'Error',
            value: 'test',
            stacktrace: {
              frames: [{ filename: 'https://cdn.hotjar.com/script.js', lineno: 1, colno: 1 }],
            },
          },
        ],
      } as ErrorEvent['exception'],
    });
    expect(clientBeforeSend(event, makeHint(), defaultDeps)).toBeNull();
  });

  it('drops InvalidCharacterError from WebView-normalized third-party scripts (JOYBOY-WEB-3FF)', () => {
    const error = new DOMException('The string contains invalid characters.', 'InvalidCharacterError');
    const event = makeEvent({
      message: 'InvalidCharacterError: The string contains invalid characters.',
      exception: {
        values: [
          {
            type: 'InvalidCharacterError',
            value: 'The string contains invalid characters.',
            mechanism: { type: 'auto.browser.browserapierrors.xhr.onreadystatechange', handled: false },
            stacktrace: {
              frames: [
                { filename: '[native code]', function: 'btoa', lineno: 1, colno: 1 },
                { filename: 'app:///A3563524-f6e4-4deb-ae1c-e1b6fe4186e21.js', lineno: 1, colno: 35686 },
                {
                  filename:
                    '../../node_modules/.pnpm/@sentry+browser@10.43.0/node_modules/@sentry/browser/build/npm/esm/prod/helpers.js',
                  lineno: 93,
                  colno: 1,
                },
              ],
            },
          },
        ],
      } as ErrorEvent['exception'],
    });
    expect(clientBeforeSend(event, makeHint(error), defaultDeps)).toBeNull();
  });

  it('keeps critical third-party errors (DY/Stripe)', () => {
    const event = makeEvent({
      message: 'DY API failed',
      exception: {
        values: [
          {
            type: 'Error',
            value: 'DY API failed',
            stacktrace: {
              frames: [{ filename: 'https://cdn.dynamicyield.com/api.js', lineno: 1, colno: 1 }],
            },
          },
        ],
      } as ErrorEvent['exception'],
    });
    const result = clientBeforeSend(event, makeHint(), defaultDeps);
    expect(result).not.toBeNull();
    expect(result?.tags?.['criticalThirdParty']).toBe('yes');
  });

  it('drops HeadlessChrome errors', () => {
    const event = makeEvent({ message: 'Some error' });
    const result = clientBeforeSend(event, makeHint(), {
      ...defaultDeps,
      userAgent: 'Mozilla/5.0 HeadlessChrome/91.0',
    });
    expect(result).toBeNull();
  });

  it('drops errors when user is offline + network error', () => {
    const event = makeEvent({ message: 'Failed to fetch' });
    const result = clientBeforeSend(event, makeHint(), {
      ...defaultDeps,
      isOnline: false,
    });
    expect(result).toBeNull();
  });

  it('does not crash when event.message is not a string', () => {
    const event = makeEvent({
      message: { text: 'non-string message from sdk' } as unknown as ErrorEvent['message'],
    });

    expect(() => clientBeforeSend(event, makeHint(), defaultDeps)).not.toThrow();
  });

  it('keeps object message content for pattern-based filtering', () => {
    const event = makeEvent({
      message: { reason: 'Failed to fetch' } as unknown as ErrorEvent['message'],
    });
    const result = clientBeforeSend(event, makeHint(), {
      ...defaultDeps,
      isOnline: false,
    });

    expect(result).toBeNull();
  });

  // mechanism detection → app_error
  describe('app_error bucket via mechanism detection', () => {
    it('tags error_bucket as app_error when mechanism is generic+handled', () => {
      const event = makeEvent({
        exception: {
          values: [
            {
              type: 'FetchError',
              value: 'Failed to parse Search API response as JSON',
              mechanism: { type: 'generic', handled: true },
              stacktrace: {
                frames: [{ filename: 'app:///_next/static/chunks/search-view.js', lineno: 1, colno: 1 }],
              },
            },
          ],
        } as ErrorEvent['exception'],
      });
      const result = clientBeforeSend(event, makeHint(), defaultDeps);
      expect(result).not.toBeNull();
      expect(result?.tags?.['error_bucket']).toBe('app_error');
    });

    it('does NOT tag app_error when mechanism is onerror (auto-caught)', () => {
      const event = makeEvent({
        exception: {
          values: [
            {
              type: 'Error',
              value: 'Something broke',
              mechanism: { type: 'onerror', handled: false },
              stacktrace: {
                frames: [{ filename: 'app:///_next/static/chunks/page.js', lineno: 1, colno: 1 }],
              },
            },
          ],
        } as ErrorEvent['exception'],
      });
      const result = clientBeforeSend(event, makeHint(), defaultDeps);
      expect(result?.tags?.['error_bucket']).not.toBe('app_error');
    });

    it('api_5xx takes priority over app_error even when mechanism is generic+handled', () => {
      const event = makeEvent({
        contexts: { response: { status_code: 500 } } as ErrorEvent['contexts'],
        exception: {
          values: [
            {
              type: 'Error',
              value: 'Server error',
              mechanism: { type: 'generic', handled: true },
              stacktrace: {
                frames: [{ filename: 'app:///_next/static/chunks/api.js', lineno: 1, colno: 1 }],
              },
            },
          ],
        } as ErrorEvent['exception'],
      });
      const result = clientBeforeSend(event, makeHint(), defaultDeps);
      expect(result?.tags?.['error_bucket']).toBe('api_5xx');
    });
  });
});
