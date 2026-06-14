import {
  classifyErrorBucket,
  classifyErrorBucketServer,
  ERROR_BUCKET,
  BUCKET_CONFIDENCE,
  isCasaCustomerServiceError,
} from './error-bucket';

// ── helpers ────────────────────────────────────────────────────────────────

type ClassifyInput = Partial<Parameters<typeof classifyErrorBucket>[0]>;

const classify = ({ message = '', frames = [], ...rest }: ClassifyInput = {}) =>
  classifyErrorBucket({ message, frames, ...rest });

const classifyServer = ({ message = '', frames = [], ...rest }: ClassifyInput = {}) =>
  classifyErrorBucketServer({ message, frames, ...rest });

// ── classifyErrorBucket (client) ───────────────────────────────────────────

describe('classifyErrorBucket', () => {
  // 1. Hydration
  describe('hydration', () => {
    it.each([
      'Hydration failed because the initial UI does not match',
      'Text content does not match server-rendered HTML',
      'There was an error while hydrating',
    ])('classifies "%s" as hydration/high', (message) => {
      expect(classify({ message })).toEqual({
        error_bucket: ERROR_BUCKET.HYDRATION,
        bucket_confidence: BUCKET_CONFIDENCE.HIGH,
      });
    });
  });

  // 2. Third-party
  describe('third_party', () => {
    it('classifies error with third-party stack frame', () => {
      expect(
        classify({ message: 'Script error', frames: [{ filename: 'https://cdn.googletagmanager.com/gtm.js' }] })
      ).toEqual({ error_bucket: ERROR_BUCKET.THIRD_PARTY, bucket_confidence: BUCKET_CONFIDENCE.MEDIUM });
    });

    it('classifies error with third-party pattern in message', () => {
      expect(classify({ message: 'Error from klaviyo widget' })).toEqual({
        error_bucket: ERROR_BUCKET.THIRD_PARTY,
        bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
      });
    });

    it('classifies reCAPTCHA timeout as third_party (not api_timeout)', () => {
      expect(classify({ message: 'reCAPTCHA Timeout (b)', errorName: 'Error' })).toEqual({
        error_bucket: ERROR_BUCKET.THIRD_PARTY,
        bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
      });
    });

    it.each([
      ['Failed to fetch (hotjar.com)', 'non-critical domain'],
      ['Load failed (cdn.segment.io)', 'non-critical segment'],
      ['failed to fetch (unknown-cdn.xyz)', 'unknown domain'],
    ])('classifies "%s" as third_party', (message) => {
      expect(classify({ message })).toEqual({
        error_bucket: ERROR_BUCKET.THIRD_PARTY,
        bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
      });
    });

    // stripe.com / paypal.com are in CRITICAL_THIRD_PARTY_PATTERNS but NOT in THIRD_PARTY_PATTERNS,
    // so hasThirdPartyInMessage=false and isFetchFromNonCritical=false → they pass through correctly.
    it.each([
      'Failed to fetch (stripe.com)',
      'Failed to fetch (paypal.com)',
      'Failed to fetch (algolia.net)',
      'Failed to fetch (xyz.algolianet.com)',
      'Load failed (algolia.io)',
    ])('does NOT classify "%s" as third_party (critical service exempt via isFetchFromNonCritical)', (message) => {
      const result = classify({ message });
      expect(result.error_bucket).not.toBe(ERROR_BUCKET.THIRD_PARTY);
    });

    // dynamicyield / dy.com appear in both THIRD_PARTY_PATTERNS and CRITICAL_THIRD_PARTY_PATTERNS.
    // hasThirdPartyInMessage uses isThirdPartyMessage() which skips critical-overlapping patterns,
    // so these messages correctly fall through to isFetchFromNonCritical where the exemption fires.
    it('does NOT classify "Failed to fetch (dynamicyield.com)" as third_party (critical exempt in message check)', () => {
      const result = classify({ message: 'Failed to fetch (dynamicyield.com)' });
      expect(result.error_bucket).not.toBe(ERROR_BUCKET.THIRD_PARTY);
    });

    it('does NOT classify "Load failed (dy.com)" as third_party (critical exempt in message check)', () => {
      const result = classify({ message: 'Load failed (dy.com)' });
      expect(result.error_bucket).not.toBe(ERROR_BUCKET.THIRD_PARTY);
    });

    it('does NOT classify DY stack frame as third_party (critical service — must reach alert rules)', () => {
      const result = classify({
        message: 'Script error',
        frames: [{ filename: 'https://cdn.dynamicyield.com/api.js' }],
      });
      expect(result.error_bucket).not.toBe(ERROR_BUCKET.THIRD_PARTY);
    });

    it('hydration takes precedence over third_party frame', () => {
      const result = classify({
        message: 'Hydration failed because the initial UI does not match',
        frames: [{ filename: 'https://cdn.googletagmanager.com/gtm.js' }],
      });
      expect(result.error_bucket).toBe(ERROR_BUCKET.HYDRATION);
    });
  });

  // 3. API 5xx
  describe('api_5xx', () => {
    it.each([500, 502, 503, 504, 599])('classifies statusCode %d as api_5xx/high', (statusCode) => {
      expect(classify({ message: 'error', statusCode })).toEqual({
        error_bucket: ERROR_BUCKET.API_5XX,
        bucket_confidence: BUCKET_CONFIDENCE.HIGH,
      });
    });

    it.each(['Request failed with status 500', 'HTTP 502 Bad Gateway', '503 Service Unavailable'])(
      'classifies message "%s" as api_5xx',
      (message) => {
        expect(classify({ message })).toEqual({
          error_bucket: ERROR_BUCKET.API_5XX,
          bucket_confidence: BUCKET_CONFIDENCE.HIGH,
        });
      }
    );

    it('does NOT classify statusCode 400 as api_5xx', () => {
      expect(classify({ message: '', statusCode: 400 }).error_bucket).not.toBe(ERROR_BUCKET.API_5XX);
    });

    it('does NOT classify statusCode 404 as api_5xx', () => {
      expect(classify({ message: '', statusCode: 404 }).error_bucket).not.toBe(ERROR_BUCKET.API_5XX);
    });
  });

  // 4. API timeout
  describe('api_timeout', () => {
    it('classifies AbortError as api_timeout/high', () => {
      expect(classify({ message: 'The operation was aborted', errorName: 'AbortError' })).toEqual({
        error_bucket: ERROR_BUCKET.API_TIMEOUT,
        bucket_confidence: BUCKET_CONFIDENCE.HIGH,
      });
    });

    it.each(['Request timeout after 30s', 'ETIMEDOUT connecting to api.castlery.com', 'The request timed out'])(
      'classifies "%s" as api_timeout',
      (message) => {
        expect(classify({ message })).toEqual({
          error_bucket: ERROR_BUCKET.API_TIMEOUT,
          bucket_confidence: BUCKET_CONFIDENCE.HIGH,
        });
      }
    );
  });

  // 5. JS fatal
  describe('js_fatal', () => {
    it.each(['TypeError', 'ReferenceError', 'RangeError', 'SyntaxError', 'InvalidCharacterError'])(
      'classifies errorName %s as js_fatal/medium',
      (errorName) => {
        expect(classify({ message: 'some js error', errorName })).toEqual({
          error_bucket: ERROR_BUCKET.JS_FATAL,
          bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
        });
      }
    );

    it('classifies InvalidCharacterError (btoa non-Latin1) in own code as js_fatal/medium', () => {
      expect(
        classify({
          message:
            "Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.",
          errorName: 'InvalidCharacterError',
          frames: [{ filename: 'app:///_next/static/chunks/search-view.js' }],
        })
      ).toEqual({ error_bucket: ERROR_BUCKET.JS_FATAL, bucket_confidence: BUCKET_CONFIDENCE.MEDIUM });
    });

    it('classifies InvalidCharacterError (btoa non-Latin1) from WebView third-party scripts as third_party/high', () => {
      expect(
        classify({
          message: 'InvalidCharacterError: The string contains invalid characters.',
          errorName: 'InvalidCharacterError',
          frames: [
            {
              filename:
                '../../node_modules/.pnpm/@sentry+browser@10.43.0/node_modules/@sentry/browser/build/npm/esm/prod/helpers.js',
            },
            { filename: 'app:///A3563524-f6e4-4deb-ae1c-e1b6fe4186e21.js' },
          ],
        })
      ).toEqual({ error_bucket: ERROR_BUCKET.THIRD_PARTY, bucket_confidence: BUCKET_CONFIDENCE.HIGH });
    });
  });

  // 6. App error
  describe('app_error', () => {
    it('classifies explicitly captured error with no other match as app_error/medium', () => {
      expect(classify({ message: 'Failed to parse Search API response as JSON', isExplicitCapture: true })).toEqual({
        error_bucket: ERROR_BUCKET.APP_ERROR,
        bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
      });
    });

    it('classifies FetchError to own domain as app_error when explicitly captured', () => {
      expect(
        classify({ message: 'TypeError: Failed to fetch (apigw-us-prod.castlery.com)', isExplicitCapture: true })
      ).toEqual({
        error_bucket: ERROR_BUCKET.APP_ERROR,
        bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
      });
    });

    it('does NOT classify as app_error when isExplicitCapture is false', () => {
      expect(classify({ message: 'Something went wrong', isExplicitCapture: false }).error_bucket).not.toBe(
        ERROR_BUCKET.APP_ERROR
      );
    });

    it('api_5xx takes priority over app_error even when explicitly captured', () => {
      expect(classify({ message: 'Request failed', statusCode: 500, isExplicitCapture: true })).toEqual({
        error_bucket: ERROR_BUCKET.API_5XX,
        bucket_confidence: BUCKET_CONFIDENCE.HIGH,
      });
    });

    it('api_timeout takes priority over app_error even when explicitly captured', () => {
      expect(classify({ message: 'Request timed out', isExplicitCapture: true })).toEqual({
        error_bucket: ERROR_BUCKET.API_TIMEOUT,
        bucket_confidence: BUCKET_CONFIDENCE.HIGH,
      });
    });
  });

  // 7. Unclassified
  describe('unclassified', () => {
    it('classifies unknown errors as unclassified/low', () => {
      expect(classify({ message: 'Something went wrong' })).toEqual({
        error_bucket: ERROR_BUCKET.UNCLASSIFIED,
        bucket_confidence: BUCKET_CONFIDENCE.LOW,
      });
    });

    it('classifies empty input as unclassified/low', () => {
      expect(classify({ message: '' })).toEqual({
        error_bucket: ERROR_BUCKET.UNCLASSIFIED,
        bucket_confidence: BUCKET_CONFIDENCE.LOW,
      });
    });
  });

  // Priority ordering
  describe('classification priority', () => {
    it('api_5xx takes precedence over api_timeout when both match', () => {
      // statusCode 504 is both 5xx AND timeout-related
      const result = classify({ message: 'Gateway Timeout', statusCode: 504 });
      expect(result.error_bucket).toBe(ERROR_BUCKET.API_5XX);
    });

    it('third_party checked before api_5xx to prevent pollution', () => {
      // A 500 from a third-party CDN should be third_party not api_5xx
      const result = classify({
        message: 'error',
        statusCode: 500,
        frames: [{ filename: 'https://cdn.googletagmanager.com/gtm.js' }],
      });
      expect(result.error_bucket).toBe(ERROR_BUCKET.THIRD_PARTY);
    });
  });
});

// ── classifyErrorBucketServer ──────────────────────────────────────────────

describe('classifyErrorBucketServer', () => {
  it.each([500, 502, 503, 504])('classifies statusCode %d as upstream_5xx/high', (statusCode) => {
    expect(classifyServer({ message: 'error', statusCode })).toEqual({
      error_bucket: ERROR_BUCKET.UPSTREAM_5XX,
      bucket_confidence: BUCKET_CONFIDENCE.HIGH,
    });
  });

  it('classifies AbortError as upstream_timeout/high', () => {
    expect(classifyServer({ message: 'abort', errorName: 'AbortError' })).toEqual({
      error_bucket: ERROR_BUCKET.UPSTREAM_TIMEOUT,
      bucket_confidence: BUCKET_CONFIDENCE.HIGH,
    });
  });

  it('classifies ETIMEDOUT as upstream_timeout/high', () => {
    expect(classifyServer({ message: 'ETIMEDOUT' })).toEqual({
      error_bucket: ERROR_BUCKET.UPSTREAM_TIMEOUT,
      bucket_confidence: BUCKET_CONFIDENCE.HIGH,
    });
  });

  it.each(['TypeError', 'ReferenceError'])('classifies %s as js_fatal/medium', (errorName) => {
    expect(classifyServer({ message: 'error', errorName })).toEqual({
      error_bucket: ERROR_BUCKET.JS_FATAL,
      bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
    });
  });

  it('classifies explicitly captured server error as app_error/medium', () => {
    expect(classifyServer({ message: 'Server action failed', isExplicitCapture: true })).toEqual({
      error_bucket: ERROR_BUCKET.APP_ERROR,
      bucket_confidence: BUCKET_CONFIDENCE.MEDIUM,
    });
  });

  it('upstream_5xx takes priority over app_error even when explicitly captured', () => {
    expect(classifyServer({ message: 'error', statusCode: 500, isExplicitCapture: true })).toEqual({
      error_bucket: ERROR_BUCKET.UPSTREAM_5XX,
      bucket_confidence: BUCKET_CONFIDENCE.HIGH,
    });
  });

  it('classifies unknown as unclassified/low', () => {
    expect(classifyServer({ message: 'some random error' })).toEqual({
      error_bucket: ERROR_BUCKET.UNCLASSIFIED,
      bucket_confidence: BUCKET_CONFIDENCE.LOW,
    });
  });

  it('does NOT classify hydration errors (server-side only skips that path)', () => {
    const result = classifyServer({ message: 'Hydration failed because the initial UI does not match' });
    expect(result.error_bucket).not.toBe(ERROR_BUCKET.HYDRATION);
  });

  it('does NOT classify third_party frames (server-side skips that path)', () => {
    const result = classifyServer({
      message: 'error',
      frames: [{ filename: 'https://cdn.googletagmanager.com/gtm.js' }],
    });
    expect(result.error_bucket).not.toBe(ERROR_BUCKET.THIRD_PARTY);
  });
});

describe('isCasaCustomerServiceError', () => {
  it('is true when a stack frame is crxcase-cdn Casa SDK', () => {
    expect(
      isCasaCustomerServiceError({
        message: 'x',
        frames: [{ filename: 'https://crxcase-cdn-prod.castlery.com/casa/v1/sdk.js' }],
      })
    ).toBe(true);
  });

  it('is true when message mentions crxcase-cdn', () => {
    expect(
      isCasaCustomerServiceError({ message: 'Failed to load https://crxcase-cdn-test.castlery.com/casa/v1/sdk.js' })
    ).toBe(true);
  });

  it('is false for unrelated errors', () => {
    expect(
      isCasaCustomerServiceError({
        message: 'cart failed',
        frames: [{ filename: 'app:///_next/static/chunks/cart.js' }],
      })
    ).toBe(false);
  });
});
