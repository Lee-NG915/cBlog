import 'server-only';

/**
 * Safely extract a human-readable error message from an unknown caught value.
 *
 * Handles the case where Error.message is a JSON-stringified API response
 * (e.g. from `throw new Error(JSON.stringify(response))`) by parsing it
 * and returning the `msg` (or `message`) field.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : fallback;
  return parseJsonMsg(raw) ?? fallback;
}

/**
 * If `raw` looks like a JSON object, attempt to parse and return its
 * `msg` or `message` field. Returns `undefined` when parsing fails or
 * neither field exists.
 */
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
