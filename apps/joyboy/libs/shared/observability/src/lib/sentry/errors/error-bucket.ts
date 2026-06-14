/**
 * error_bucket 分桶策略（在 beforeSend 中统一打 tag）
 */

export const ERROR_BUCKET = {
  JS_FATAL: 'js_fatal',
  API_5XX: 'api_5xx',
  API_TIMEOUT: 'api_timeout',
  THIRD_PARTY: 'third_party',
  HYDRATION: 'hydration',
  // 通过 captureStructuredError 主动上报的业务/技术埋点错误
  // mechanism.handled=true + mechanism.type='generic' 唯一标识
  APP_ERROR: 'app_error',
  UNCLASSIFIED: 'unclassified',
  // 服务端专属：我们的服务器调上游 API 时产生的错误
  UPSTREAM_5XX: 'upstream_5xx',
  UPSTREAM_TIMEOUT: 'upstream_timeout',
} as const;

export type ErrorBucket = (typeof ERROR_BUCKET)[keyof typeof ERROR_BUCKET];

export const BUCKET_CONFIDENCE = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type BucketConfidence = (typeof BUCKET_CONFIDENCE)[keyof typeof BUCKET_CONFIDENCE];

export interface ErrorBucketInput {
  /** event.message 或 exception value */
  message: string;
  /** (hint.originalException as Error)?.name */
  errorName?: string;
  /** event.exception?.values?.[0]?.stacktrace?.frames */
  frames?: Array<{ filename?: string }>;
  /** 响应状态码（若有，如 event.contexts 或 fetch 错误） */
  statusCode?: number;
  /**
   * 是否通过 captureException / captureStructuredError 主动上报。
   * 由 beforeSend 从 event.exception.values[0].mechanism 提取：
   *   mechanism.handled === true && mechanism.type === 'generic'
   */
  isExplicitCapture?: boolean;
}

/**
 * Domain patterns for critical third-party services whose errors must always remain visible
 * (never filtered, never classified as third_party).
 *
 * Single source of truth: consumed by both classifyErrorBucket (isFetchFromNonCritical)
 * and instrumentation-client beforeSend (isCriticalThirdParty).
 * ⚠️ When adding a new critical service, update this list only — do not maintain duplicates elsewhere.
 */
export const CRITICAL_THIRD_PARTY_PATTERNS = [
  'dynamicyield', // DY personalization - can cause white screen
  'dy.com',
  'stripe.com', // Payment processing (covers stripe.com/v3)
  'paypal.com', // Payment processing (covers paypal.com/sdk)
  'algolia', // Search - covers algolia.net / algolianet.com / algolia.io
  // Casa customer service SDK (must be kept for SC routing; domain will be overridden to casa in beforeSend)
  'crxcase-cdn',
  '/casa/sdk',
  'casa/assets',
  'app:///casa',
] as const;

/**
 * 自有域名 — "Failed to fetch (domain)" 中匹配到这些域名时，永远不归为 third_party。
 * 单一数据源：instrumentation-client.ts isCriticalThirdParty 也消费这个列表。
 */
export const OWN_DOMAIN_PATTERNS = ['castlery.com', 'localhost'] as const;

/**
 * 三方域名/路径特征。
 * 双重用途：
 *   1. classifyErrorBucket 中的帧/消息匹配（isThirdPartyFrame / isThirdPartyMessage）
 *   2. instrumentation-client.ts 的 denyUrls 从此列表派生，不再手动维护两份
 *
 * ⚠️ 添加新三方域名只改这一处。
 */
/**
 * Casa customer service script origins (stack filename / error message).
 * Used by client beforeSend to drop Casa SDK errors from the host project.
 * Keep in sync with `libs/shared/components/.../casa-inject.tsx` CDN URL shape.
 */
const CASA_SENTRY_MARKERS = ['crxcase-cdn', '/casa/v', 'casa/assets', 'app:///casa'] as const;

/** True when the error is attributable to Casa / crxcase CDN. */
export function isCasaCustomerServiceError(input: { message: string; frames?: Array<{ filename?: string }> }): boolean {
  const msg = (input.message || '').toLowerCase();
  if (CASA_SENTRY_MARKERS.some((m) => msg.includes(m))) return true;
  const frames = input.frames || [];
  return frames.some((f) => {
    const fn = (f.filename || '').toLowerCase();
    return CASA_SENTRY_MARKERS.some((m) => fn.includes(m));
  });
}

export const THIRD_PARTY_PATTERNS = [
  'googletagmanager',
  'google-analytics',
  'gtag',
  'segment',
  'rudderstack',
  'klaviyo',
  'cookieyes',
  'friendbuy',
  'mulberry',
  'getmulberry',
  'ptengine',
  'clarity.ms',
  'creativecdn.com',
  'pinterest.com',
  'facebook.com',
  'connect.facebook.net',
  'graph.facebook.com',
  'adsbygoogle',
  'teads',
  'dynamicyield',
  'dy.com',
  'widget-assets',
  'ats-modules',
  'api_static',
  'extensions/',
  'chrome-extension',
  'moz-extension',
  'safari-extension',
  // Google services (non-critical)
  'recaptcha',
  // Customer support / live chat
  'gladly',
  // CDN / ad networks identified from production data
  'hulla-cdn',
  'tx4.pw',
  // Third-party registries / services
  'babylist',
  'sevendata',
  // Ad networks (previously only in denyUrls)
  'tiktok',
  'doubleclick.net',
  'bat.bing.com',
  'woopra',
  'twitter.com',
  'twimg.com',
  // Third-party widgets / tools
  'user-guiding',
  'texthelp.com',
  'metamask',
  'wallet-extension',
  // Public CDNs (errors from these are not our code)
  'jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
] as const;

function isThirdPartyFrame(filename: string): boolean {
  const lower = filename.toLowerCase();
  return THIRD_PARTY_PATTERNS.some((p) => {
    if (!lower.includes(p)) return false;
    return !CRITICAL_THIRD_PARTY_PATTERNS.some((c) => c === p || p.includes(c) || c.includes(p));
  });
}

/**
 * Like isThirdPartyFrame but skips patterns that also appear in CRITICAL_THIRD_PARTY_PATTERNS.
 * Both frame and message matching exempt critical services so their errors are never bucketed as
 * third_party — they must reach the alert rules (e.g. DY causing a white screen should trigger Sev-3).
 */
function isThirdPartyMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  return THIRD_PARTY_PATTERNS.some((p) => {
    if (!lower.includes(p)) return false;
    // Exempt if this pattern overlaps with a critical service pattern
    const isCritical = CRITICAL_THIRD_PARTY_PATTERNS.some((c) => c === p || p.includes(c) || c.includes(p));
    return !isCritical;
  });
}

/** iOS/Android WebView rewrites injected third-party CDN scripts to app:///<uuid>.js */
export const WEBVIEW_UUID_FRAME_PATTERN = /^app:\/\/\/[0-9a-f-]{8,}/i;

export function isSentrySdkFrame(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.includes('@sentry/') || lower.includes('/sentry/browser/');
}

export function isWebViewUuidThirdPartyFrame(filename: string): boolean {
  return WEBVIEW_UUID_FRAME_PATTERN.test(filename);
}

/**
 * True when a stack frame originates from our Next.js application bundle.
 * Excludes Sentry SDK frames, WebView-normalized third-party scripts, and known third-party app:/// paths.
 */
export function isOwnApplicationStackFrame(filename: string): boolean {
  if (!filename || filename === '[native code]') {
    return false;
  }
  if (
    filename.includes('ats-modules') ||
    filename.includes('app:///ats') ||
    filename.includes('api_static') ||
    filename.includes('app:///api/') ||
    filename.includes('widget-assets') ||
    filename.includes('recaptcha/releases/') ||
    filename.includes('recaptcha__') ||
    filename.includes('app:///recaptcha') ||
    filename.includes('app:///ct/') ||
    filename.includes('casa/assets') ||
    filename.includes('app:///casa')
  ) {
    return false;
  }
  if (isSentrySdkFrame(filename) || isWebViewUuidThirdPartyFrame(filename)) {
    return false;
  }
  return (
    filename.includes('/_next/') ||
    filename.includes('/static/') ||
    (filename.includes('.js') && !filename.includes('http'))
  );
}

function isThirdPartyBtoaInvalidCharacterError(
  errorName: string,
  message: string,
  frames: Array<{ filename?: string }>
): boolean {
  if (errorName !== 'InvalidCharacterError' || !/invalid character|latin1|btoa/i.test(message)) {
    return false;
  }
  const actionableFrames = frames.filter((f) => f.filename && f.filename !== '[native code]');
  return (
    actionableFrames.length > 0 &&
    actionableFrames.every((f) => isWebViewUuidThirdPartyFrame(f.filename!) || isSentrySdkFrame(f.filename!))
  );
}

/**
 * 在 beforeSend 中根据 event/hint 推断 error_bucket 与 bucket_confidence。
 * 按优先级执行：hydration → third_party → api_5xx → api_timeout → js_fatal → app_error → unclassified。
 */
export function classifyErrorBucket(input: ErrorBucketInput): {
  error_bucket: ErrorBucket;
  bucket_confidence: BucketConfidence;
} {
  const { message, errorName, frames = [], statusCode, isExplicitCapture = false } = input;
  const msg = message || '';
  const name = errorName || '';

  // 1. Hydration
  if (
    /Hydration failed/i.test(msg) ||
    /Text content does not match/i.test(msg) ||
    /There was an error while hydrating/i.test(msg)
  ) {
    return { error_bucket: ERROR_BUCKET.HYDRATION, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }

  // 2. Third-party: checked before api_5xx to prevent third-party 5xx/timeout from polluting those buckets.
  // Three detection paths unified into one check:
  //   a) stack frame matches THIRD_PARTY_PATTERNS
  //   b) error message matches THIRD_PARTY_PATTERNS
  //   c) "Failed to fetch (domain)" / "Load failed (domain)" where domain is not a critical service
  //      — this format originates from browser extensions / injected scripts; THIRD_PARTY_PATTERNS
  //        cannot enumerate every possible foreign domain, so we use inverse logic instead:
  //        critical services (CRITICAL_THIRD_PARTY_PATTERNS) pass through; everything else → third_party
  const hasThirdPartyFrame = frames.some((f) => {
    const fn = f.filename || '';
    return fn && isThirdPartyFrame(fn);
  });
  const hasThirdPartyInMessage = isThirdPartyMessage(msg);
  const fetchedDomainMatch = /(?:failed to fetch|load failed)\s*\(([^)]+)\)/i.exec(msg);
  const fetchedDomain = fetchedDomainMatch?.[1]?.toLowerCase() ?? '';
  const isFetchFromNonCritical =
    fetchedDomainMatch !== null &&
    !OWN_DOMAIN_PATTERNS.some((d) => fetchedDomain.includes(d)) &&
    !CRITICAL_THIRD_PARTY_PATTERNS.some((d) => fetchedDomain.includes(d));
  if (hasThirdPartyFrame || hasThirdPartyInMessage || isFetchFromNonCritical) {
    return { error_bucket: ERROR_BUCKET.THIRD_PARTY, bucket_confidence: BUCKET_CONFIDENCE.MEDIUM };
  }

  // btoa(non-Latin1) from WebView-normalized third-party pixels (e.g. Pinterest/Rudderstack on iOS Safari)
  if (isThirdPartyBtoaInvalidCharacterError(name, msg, frames)) {
    return { error_bucket: ERROR_BUCKET.THIRD_PARTY, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }

  // 3. API 5xx
  if (statusCode != null && statusCode >= 500 && statusCode <= 599) {
    return { error_bucket: ERROR_BUCKET.API_5XX, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }
  if (/\b500\b|\b502\b|\b503\b|\b504\b/.test(msg)) {
    return { error_bucket: ERROR_BUCKET.API_5XX, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }

  // 4. API timeout / Abort
  if (name === 'AbortError' || /timeout|ETIMEDOUT|timed out/i.test(msg)) {
    return { error_bucket: ERROR_BUCKET.API_TIMEOUT, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }

  // 5. JS fatal: 标准 JS 错误类型 + 表明我方代码有误的 DOMException
  // InvalidCharacterError: btoa() 收到非 Latin1 字符串，属于调用方 bug（区别于第三方 DOM 干扰）
  const jsFatalNames = ['TypeError', 'ReferenceError', 'RangeError', 'SyntaxError', 'InvalidCharacterError'];
  if (jsFatalNames.includes(name)) {
    return { error_bucket: ERROR_BUCKET.JS_FATAL, bucket_confidence: BUCKET_CONFIDENCE.MEDIUM };
  }

  // 6. App error：通过 captureStructuredError 主动上报的业务/技术错误（未被前面任何桶命中）
  if (isExplicitCapture) {
    return { error_bucket: ERROR_BUCKET.APP_ERROR, bucket_confidence: BUCKET_CONFIDENCE.MEDIUM };
  }

  // 7. 兜底
  return { error_bucket: ERROR_BUCKET.UNCLASSIFIED, bucket_confidence: BUCKET_CONFIDENCE.LOW };
}

/**
 * 服务端专用分桶（在 sentry.server.config.ts beforeSend 中调用）。
 *
 * 与客户端 classifyErrorBucket 的区别：
 * - 跳过 hydration / third_party（浏览器特有场景）
 * - 5xx → upstream_5xx（语义：我方服务器调上游返回 5xx）
 * - timeout → upstream_timeout
 * - js_fatal / app_error / unclassified 复用现有类型
 */
export function classifyErrorBucketServer(input: ErrorBucketInput): {
  error_bucket: ErrorBucket;
  bucket_confidence: BucketConfidence;
} {
  const { message, errorName, statusCode, isExplicitCapture = false } = input;
  const msg = message || '';
  const name = errorName || '';

  // 1. Upstream 5xx
  if (statusCode != null && statusCode >= 500 && statusCode <= 599) {
    return { error_bucket: ERROR_BUCKET.UPSTREAM_5XX, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }
  if (/\b500\b|\b502\b|\b503\b|\b504\b/.test(msg)) {
    return { error_bucket: ERROR_BUCKET.UPSTREAM_5XX, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }

  // 2. Upstream timeout / Abort
  if (name === 'AbortError' || /timeout|ETIMEDOUT|timed out/i.test(msg)) {
    return { error_bucket: ERROR_BUCKET.UPSTREAM_TIMEOUT, bucket_confidence: BUCKET_CONFIDENCE.HIGH };
  }

  // 3. JS fatal
  const jsFatalNames = ['TypeError', 'ReferenceError', 'RangeError', 'SyntaxError'];
  if (jsFatalNames.includes(name)) {
    return { error_bucket: ERROR_BUCKET.JS_FATAL, bucket_confidence: BUCKET_CONFIDENCE.MEDIUM };
  }

  // 4. App error：通过 captureStructuredError 主动上报的业务/技术错误
  if (isExplicitCapture) {
    return { error_bucket: ERROR_BUCKET.APP_ERROR, bucket_confidence: BUCKET_CONFIDENCE.MEDIUM };
  }

  // 5. 兜底
  return { error_bucket: ERROR_BUCKET.UNCLASSIFIED, bucket_confidence: BUCKET_CONFIDENCE.LOW };
}
