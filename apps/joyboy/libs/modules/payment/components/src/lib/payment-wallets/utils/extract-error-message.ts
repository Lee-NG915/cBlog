/**
 * Extract a human-readable message from an unknown caught value.
 *
 * Handles:
 *  - Standard `Error` instances (error.message)
 *  - RTK Query rejection objects (`{ data: { error: "..." }, originalError: { message: "..." } }`)
 *  - Plain strings
 *  - JSON-stringified API responses (`{"code":10702,"msg":"..."}`)
 */
export function extractClientErrorMessage(error: unknown, fallback: string): string {
  const raw = extractRawMessage(error);
  if (!raw) return fallback;
  return parseJsonMsg(raw) ?? fallback;
}

/**
 * Pull the raw message string out of whichever error shape we received.
 */
function extractRawMessage(error: unknown): string | undefined {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  // RTK Query FetchBaseQueryError / SerializedError — plain object, NOT instanceof Error
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    // originalError.message (from transformResponse throw)
    if (typeof obj.originalError?.message === 'string') return obj.originalError.message;
    // data.error (some RTK shapes)
    if (typeof obj.data?.error === 'string') return obj.data.error;
    // direct message field
    if (typeof obj.message === 'string') return obj.message;
    // data.message
    if (typeof obj.data?.message === 'string') return obj.data.message;
    // data.msg
    if (typeof obj.data?.msg === 'string') return obj.data.msg;
  }

  return undefined;
}

/**
 * Extract both code and message from an unknown caught value.
 * Returns `{ code, message }` where either may be undefined.
 */
export function extractClientError(error: unknown): { code?: string; message?: string } {
  const raw = extractRawMessage(error);
  if (!raw) return {};
  return parseJsonError(raw);
}

function parseJsonMsg(raw: string): string | undefined {
  if (!raw.startsWith('{')) return raw;
  try {
    const parsed = JSON.parse(raw);
    const msg = parsed.msg ?? parsed.message;
    return typeof msg === 'string' && msg.length > 0 ? msg : undefined;
  } catch {
    return raw;
  }
}

function parseJsonError(raw: string): { code?: string; message?: string } {
  if (!raw.startsWith('{')) return { message: raw };
  try {
    const parsed = JSON.parse(raw);
    const msg = parsed.msg ?? parsed.message;
    const code = parsed.code != null ? String(parsed.code) : undefined;
    return {
      code,
      message: typeof msg === 'string' && msg.length > 0 ? msg : undefined,
    };
  } catch {
    return { message: raw };
  }
}
