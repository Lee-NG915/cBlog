import { getInvalidLineItems, normalizeApiError } from './normalize-api-error';

describe('normalizeApiError', () => {
  it('normalizes RTK fetch errors', () => {
    expect(normalizeApiError({ payload: { status: 'FETCH_ERROR', error: 'timeout' }, error: {} })).toMatchObject({
      kind: 'fetch',
      code: '0',
      numberCode: 0,
      message: 'timeout',
    });
  });

  it('normalizes condition abort errors', () => {
    expect(
      normalizeApiError({
        error: { name: 'ConditionError', message: 'Aborted due to condition callback returning false.' },
      })
    ).toMatchObject({
      kind: 'condition-abort',
      code: '0',
      numberCode: 0,
    });
  });

  it('normalizes business errors from payload data', () => {
    expect(
      normalizeApiError({
        payload: { data: { code: 10702025, msg: 'Coupon invalid' } },
        error: { message: 'Rejected' },
      })
    ).toMatchObject({
      kind: 'biz',
      code: '10702025',
      numberCode: 10702025,
      message: 'Coupon invalid',
    });
  });

  it('normalizes business errors from JSON error messages', () => {
    expect(
      normalizeApiError({
        error: { message: JSON.stringify({ errorCode: 10702036, message: 'Zipcode unsupported' }) },
      })
    ).toMatchObject({
      kind: 'biz',
      code: '10702036',
      numberCode: 10702036,
      message: 'Zipcode unsupported',
    });
  });

  it('extracts invalid line items from normalized business error data', () => {
    const error = normalizeApiError({
      error: {
        message: JSON.stringify({
          code: 10702000,
          msg: 'Invalid items',
          data: { invalidLineItems: [{ id: 'line-item-1' }] },
        }),
      },
    });

    expect(getInvalidLineItems(error)).toEqual([{ id: 'line-item-1' }]);
  });

  it('extracts invalid line items when payload errors wrap the business error', () => {
    const error = normalizeApiError({
      payload: {
        data: {
          invalidLineItems: [{ id: 'line-item-2' }],
          errors: [{ code: 10702000, msg: 'Invalid items' }],
        },
      },
      error: { message: 'Rejected' },
    });

    expect(error).toMatchObject({
      kind: 'biz',
      code: '10702000',
      numberCode: 10702000,
      message: 'Invalid items',
    });
    expect(getInvalidLineItems(error)).toEqual([{ id: 'line-item-2' }]);
  });

  it('keeps numeric HTTP status errors as http kind', () => {
    expect(
      normalizeApiError({
        payload: { status: 403, data: { message: 'Forbidden' } },
        error: { message: 'Forbidden' },
      })
    ).toMatchObject({
      kind: 'http',
      code: '0',
      numberCode: 0,
      message: 'Forbidden',
      httpStatus: 403,
    });
  });

  it('keeps plain text error messages as unknown fallback errors', () => {
    expect(normalizeApiError({ error: { message: 'Something failed' } })).toMatchObject({
      kind: 'unknown',
      code: '0',
      numberCode: 0,
      message: 'Something failed',
    });
  });
});
