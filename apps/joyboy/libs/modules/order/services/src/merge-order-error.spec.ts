import { isTransientMergeOrderFailure } from './merge-order-error';

describe('isTransientMergeOrderFailure', () => {
  it.each([
    [{ status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' }],
    [{ status: 'TIMEOUT_ERROR', error: 'Request timed out' }],
    [{ status: 'PARSING_ERROR', error: 'SyntaxError: JSON Parse error: Unexpected identifier "Another"' }],
    [{ message: 'Network request failed' }],
    [{ error: 'Load failed' }],
    [{ data: { message: 'The request was aborted' } }],
  ])('treats transient network failures as retryable merge failures', (error) => {
    expect(isTransientMergeOrderFailure(error)).toBe(true);
  });

  it.each([
    [null],
    [undefined],
    [{ status: 400, data: { error: 'already merged' } }],
    [{ status: 409, data: { error: 'conflict' } }],
    [{ status: 500, data: { error: 'Internal Server Error' } }],
  ])('does not treat API responses as transient merge failures', (error) => {
    expect(isTransientMergeOrderFailure(error)).toBe(false);
  });
});
