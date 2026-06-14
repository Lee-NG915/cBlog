import {
  filterPII,
  normalizeError,
  isUserInputError,
  isExpectedBusinessError,
  isAuthError,
  isUserPaymentError,
  shouldSkipSentry,
} from './error-utils';

// ── filterPII ──────────────────────────────────────────────────────────────

describe('filterPII', () => {
  it('filters password fields with [Filtered]', () => {
    expect(filterPII({ password: 'secret123' })).toEqual({ password: '[Filtered]' });
  });

  it('filters email fields with [PII Filtered]', () => {
    expect(filterPII({ email: 'user@example.com' })).toEqual({ email: '[PII Filtered]' });
  });

  it('filters phone fields with [PII Filtered]', () => {
    expect(filterPII({ phoneNumber: '+6512345678' })).toEqual({ phoneNumber: '[PII Filtered]' });
  });

  it('filters token/apiKey with [Filtered]', () => {
    expect(filterPII({ token: 'abc123', apiKey: 'xyz789' })).toEqual({
      token: '[Filtered]',
      apiKey: '[Filtered]',
    });
  });

  it('passes through non-sensitive fields', () => {
    expect(filterPII({ productId: '123', quantity: 2, inStock: true })).toEqual({
      productId: '123',
      quantity: 2,
      inStock: true,
    });
  });

  it('does NOT filter partial name matches (isEmailVerified, mobileTheme, hasEmail)', () => {
    const result = filterPII({ isEmailVerified: true, mobileTheme: 'dark', hasEmail: false });
    expect(result).toEqual({ isEmailVerified: true, mobileTheme: 'dark', hasEmail: false });
  });

  it('recursively filters nested objects', () => {
    const result = filterPII({ user: { email: 'test@test.com', name: 'Alice' } });
    expect(result).toEqual({ user: { email: '[PII Filtered]', name: 'Alice' } });
  });

  it('filters arrays of objects', () => {
    const result = filterPII([{ email: 'a@b.com' }, { name: 'Bob' }]);
    expect(result).toEqual([{ email: '[PII Filtered]' }, { name: 'Bob' }]);
  });

  it('handles null and undefined', () => {
    expect(filterPII(null)).toBeNull();
    expect(filterPII(undefined)).toBeUndefined();
  });

  it('passes through primitive values', () => {
    expect(filterPII('hello')).toBe('hello');
    expect(filterPII(42)).toBe(42);
  });
});

// ── normalizeError ─────────────────────────────────────────────────────────

describe('normalizeError', () => {
  it('returns Error instances as-is', () => {
    const err = new Error('original');
    expect(normalizeError(err)).toBe(err);
  });

  it('normalizes RTK Query FETCH_ERROR', () => {
    const result = normalizeError({ status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('TypeError: Failed to fetch');
    expect(result.name).toBe('FetchError');
  });

  it('normalizes RTK Query API error with data', () => {
    const result = normalizeError({ status: 400, data: { errors: [{ detail: 'Invalid email' }] } });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Invalid email');
    expect(result.name).toBe('APIError');
  });

  it('normalizes string errors', () => {
    const result = normalizeError('something went wrong');
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('something went wrong');
  });

  it('normalizes null to UnknownError', () => {
    const result = normalizeError(null);
    expect(result.name).toBe('UnknownError');
  });
});

// ── isUserInputError ───────────────────────────────────────────────────────

describe('isUserInputError', () => {
  it('returns true for 400 with invalid password message', () => {
    expect(isUserInputError({ status: 400, data: { error: 'Invalid password' } })).toBe(true);
  });

  it('returns true for 400 with wrong credentials', () => {
    expect(isUserInputError({ status: 400, data: { error: 'Wrong username or credentials' } })).toBe(true);
  });

  it('returns true for 400 with email already taken', () => {
    expect(isUserInputError({ status: 400, data: { error: 'Email has already been taken' } })).toBe(true);
  });

  it('returns true for 400 with invalid email format', () => {
    expect(isUserInputError({ status: 400, data: { error: 'Email is invalid' } })).toBe(true);
  });

  it('returns true for 400 with expired token', () => {
    expect(isUserInputError({ status: 400, data: { error: 'Token has expired' } })).toBe(true);
  });

  it('returns true for 422 (validation failure)', () => {
    expect(isUserInputError({ status: 422, data: { error: 'Unprocessable entity' } })).toBe(true);
  });

  it('returns false for 400 with unrelated business error', () => {
    expect(isUserInputError({ status: 400, data: { error: 'Out of stock' } })).toBe(false);
  });

  it('returns false for 500', () => {
    expect(isUserInputError({ status: 500, data: { error: 'Internal server error' } })).toBe(false);
  });

  it('returns false when no message provided for 400', () => {
    expect(isUserInputError({ status: 400, data: {} })).toBe(false);
  });
});

// ── isExpectedBusinessError ────────────────────────────────────────────────

describe('isExpectedBusinessError', () => {
  it('returns true for 400 with out of stock', () => {
    expect(isExpectedBusinessError({ status: 400, data: { error: 'Out of stock' } })).toBe(true);
  });

  it('returns true for 400 APIError message with selected quantity out of stock', () => {
    expect(
      isExpectedBusinessError({
        status: 400,
        message: 'This product is out of stock for the selected quantity.',
      })
    ).toBe(true);
  });

  it('returns true for 422 data message with selected quantity out of stock', () => {
    expect(
      isExpectedBusinessError({
        status: 422,
        data: { message: 'This product is out of stock for the selected quantity.' },
      })
    ).toBe(true);
  });

  it('returns false for 422 with unrelated message', () => {
    expect(isExpectedBusinessError({ status: 422, data: { message: 'Unexpected merge order failure' } })).toBe(false);
  });

  it('returns true for 400 with no longer available', () => {
    expect(isExpectedBusinessError({ status: 400, data: { error: 'Item no longer available' } })).toBe(true);
  });

  it('returns true for 400 with sold out', () => {
    expect(isExpectedBusinessError({ status: 400, data: { error: 'Sold out' } })).toBe(true);
  });

  it('returns true for 404 (resource not found)', () => {
    expect(isExpectedBusinessError({ status: 404 })).toBe(true);
  });

  it('returns true for 409 (conflict / already merged)', () => {
    expect(isExpectedBusinessError({ status: 409 })).toBe(true);
  });

  it('returns false for 400 with unrelated message', () => {
    expect(isExpectedBusinessError({ status: 400, data: { error: 'Invalid email' } })).toBe(false);
  });

  it('returns false for 500', () => {
    expect(isExpectedBusinessError({ status: 500 })).toBe(false);
  });
});

// ── isAuthError ────────────────────────────────────────────────────────────

describe('isAuthError', () => {
  it('returns true for 401', () => {
    expect(isAuthError({ status: 401 })).toBe(true);
  });

  it('returns true for 403', () => {
    expect(isAuthError({ status: 403 })).toBe(true);
  });

  it('returns false for 400', () => {
    expect(isAuthError({ status: 400 })).toBe(false);
  });

  it('returns false for 500', () => {
    expect(isAuthError({ status: 500 })).toBe(false);
  });
});

// ── isUserPaymentError ─────────────────────────────────────────────────────

describe('isUserPaymentError', () => {
  it('returns true for 400 with card declined', () => {
    expect(isUserPaymentError({ status: 400, data: { error: 'Card declined' } })).toBe(true);
  });

  it('returns true for 400 with insufficient funds', () => {
    expect(isUserPaymentError({ status: 400, data: { error: 'Insufficient funds' } })).toBe(true);
  });

  it('returns false for 500', () => {
    expect(isUserPaymentError({ status: 500, data: { error: 'Card declined' } })).toBe(false);
  });
});

// ── shouldSkipSentry ───────────────────────────────────────────────────────

describe('shouldSkipSentry', () => {
  it('returns true for 401 (auth error)', () => {
    expect(shouldSkipSentry({ status: 401 })).toBe(true);
  });

  it('returns true for 422 (validation)', () => {
    expect(shouldSkipSentry({ status: 422 })).toBe(true);
  });

  it('returns true for 404 (expected business)', () => {
    expect(shouldSkipSentry({ status: 404 })).toBe(true);
  });

  it('returns true for 400 with out of stock', () => {
    expect(shouldSkipSentry({ status: 400, data: { error: 'Out of stock' } })).toBe(true);
  });

  it('returns false for 500 (should always reach Sentry)', () => {
    expect(shouldSkipSentry({ status: 500 })).toBe(false);
  });

  it('returns false for generic 400 with unknown message', () => {
    expect(shouldSkipSentry({ status: 400, data: { error: 'Unknown cart error' } })).toBe(false);
  });
});
