export type NormalizedApiErrorKind = 'fetch' | 'http' | 'biz' | 'condition-abort' | 'unknown';

export type NormalizedApiError = {
  kind: NormalizedApiErrorKind;
  code: string;
  numberCode: number;
  message: string;
  httpStatus?: number;
  data?: unknown;
  errorObj: Record<string, unknown> | null;
  raw: unknown;
};

const DEFAULT_ERROR_CODE = '0';

function getActionPayload(action: unknown): any {
  return (action as any)?.payload;
}

function getActionError(action: unknown): any {
  return (action as any)?.error;
}

function toErrorCode(value: unknown): string {
  return value === undefined || value === null || value === '' ? DEFAULT_ERROR_CODE : String(value);
}

function toErrorMessage(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function parseMessageJson(message: unknown): Record<string, unknown> | null {
  if (typeof message !== 'string') return null;

  try {
    return asRecord(JSON.parse(message));
  } catch {
    return null;
  }
}

function normalizeBizPayload(
  errorObj: Record<string, unknown>,
  raw: unknown,
  data: unknown = errorObj.data
): NormalizedApiError {
  const code = toErrorCode(errorObj.code ?? errorObj.errorCode);
  const message = toErrorMessage(errorObj.msg ?? errorObj.message);

  return {
    kind: 'biz',
    code,
    numberCode: Number(code),
    message,
    data,
    errorObj,
    raw,
  };
}

function getInvalidLineItemsFromData(data: unknown): unknown[] {
  const record = asRecord(data);
  if (!record) return [];

  const directInvalidLineItems = record.invalidLineItems;
  if (Array.isArray(directInvalidLineItems)) return directInvalidLineItems;

  const nestedData = asRecord(record.data);
  const nestedInvalidLineItems = nestedData?.invalidLineItems;
  return Array.isArray(nestedInvalidLineItems) ? nestedInvalidLineItems : [];
}

export function isFetchError(action: unknown): boolean {
  return getActionPayload(action)?.status === 'FETCH_ERROR';
}

export function isHttpForbiddenError(action: unknown): boolean {
  return !!getActionError(action) && getActionPayload(action)?.status === 403;
}

/**
 * RTK Query / createAsyncThunk can reject because `condition` returned false.
 * This is not a user-visible API failure.
 */
export function isConditionAbortError(action: unknown): boolean {
  const error = getActionError(action) as { name?: string; message?: string } | undefined;

  return (
    error?.name === 'ConditionError' ||
    error?.message === 'Aborted due to condition callback returning false.' ||
    (typeof error?.message === 'string' && error.message.includes('condition callback returning false'))
  );
}

export function normalizeApiError(action: unknown): NormalizedApiError {
  const payload = getActionPayload(action);
  const actionError = getActionError(action);

  if (isConditionAbortError(action)) {
    return {
      kind: 'condition-abort',
      code: DEFAULT_ERROR_CODE,
      numberCode: 0,
      message: toErrorMessage(actionError?.message),
      errorObj: null,
      raw: action,
    };
  }

  if (isFetchError(action)) {
    return {
      kind: 'fetch',
      code: DEFAULT_ERROR_CODE,
      numberCode: 0,
      message: toErrorMessage(payload?.error ?? actionError?.message),
      errorObj: null,
      raw: action,
    };
  }

  const payloadData = payload?.data;
  const payloadRecord = asRecord(payloadData);

  if (payloadRecord && ('code' in payloadRecord || 'errorCode' in payloadRecord)) {
    return normalizeBizPayload(payloadRecord, action, payloadRecord.data ?? payloadRecord);
  }

  const payloadErrors = payloadRecord?.errors;
  const firstPayloadError = Array.isArray(payloadErrors) ? asRecord(payloadErrors[0]) : null;
  if (firstPayloadError && ('code' in firstPayloadError || 'errorCode' in firstPayloadError)) {
    return normalizeBizPayload(
      firstPayloadError,
      action,
      firstPayloadError.data ?? payloadRecord?.data ?? payloadRecord
    );
  }

  const messageErrorObj = parseMessageJson(actionError?.message);
  if (messageErrorObj) {
    return normalizeBizPayload(messageErrorObj, action, messageErrorObj.data ?? payloadData);
  }

  const httpStatus = typeof payload?.status === 'number' ? payload.status : undefined;
  const plainMessage = toErrorMessage(actionError?.message);

  return {
    kind: httpStatus ? 'http' : plainMessage ? 'unknown' : 'unknown',
    code: DEFAULT_ERROR_CODE,
    numberCode: 0,
    message: plainMessage,
    httpStatus,
    data: payloadData,
    errorObj: null,
    raw: action,
  };
}

export function getInvalidLineItems(error: NormalizedApiError): unknown[] {
  const normalizedInvalidLineItems = getInvalidLineItemsFromData(error.data);
  if (normalizedInvalidLineItems.length > 0) return normalizedInvalidLineItems;

  return getInvalidLineItemsFromData(error.errorObj?.data);
}
