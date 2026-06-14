/**
 * 错误处理和判断辅助函数
 *
 * 包含：
 * - 错误标准化（normalizeError）
 * - PII 过滤（filterPII）
 * - 环境判断（shouldSendToSentry）
 * - 业务错误判断（isUserInputError、isExpectedBusinessError 等）
 */

// ============================================================================
// PII 过滤
// ============================================================================

/**
 * 需要过滤的敏感字段名（精确匹配，区分大小写不敏感）
 *
 * 规则：只列明确包含 PII 或凭证的字段名，布尔/数量/状态类字段不在此列。
 * 如需新增，请在对应分类下追加，并说明原因。
 */
const SENSITIVE_FIELD_NAMES = new Set([
  // 密码
  'password',
  'passwd',
  'pwd',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  // 凭证 / 密钥
  'token',
  'accessToken',
  'refreshToken',
  'idToken',
  'apiKey',
  'secret',
  'clientSecret',
  // 支付
  'creditCard',
  'cardNumber',
  'cvv',
  'cvc',
  'ssn',
  'socialSecurity',
  // 联系方式（实际值为 PII）
  'email',
  'userEmail',
  'emailAddress',
  'phone',
  'phoneNumber',
  'mobile',
  'mobileNumber',
  'contactNumber',
]);

/** 联系方式字段，使用不同的过滤标记以便区分 */
const PII_CONTACT_FIELDS = new Set([
  'email',
  'userEmail',
  'emailAddress',
  'phone',
  'phoneNumber',
  'mobile',
  'mobileNumber',
  'contactNumber',
]);

/**
 * 过滤 PII 信息
 *
 * 递归扫描对象，将敏感字段替换为 [Filtered] 或 [PII Filtered]。
 * 仅精确匹配 SENSITIVE_FIELD_NAMES 中的字段名（不区分大小写），
 * 避免误过滤 isEmailVerified、hasEmail、mobileTheme 等无害字段。
 */
export function filterPII(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // 处理数组
  if (Array.isArray(data)) {
    return data.map((item) => filterPII(item));
  }

  // 处理对象
  if (typeof data === 'object') {
    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const normalizedKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELD_NAMES.has(key) || SENSITIVE_FIELD_NAMES.has(normalizedKey);

      if (isSensitive) {
        const isContact = PII_CONTACT_FIELDS.has(key) || PII_CONTACT_FIELDS.has(normalizedKey);
        filtered[key] = isContact ? '[PII Filtered]' : '[Filtered]';
      } else {
        // 递归过滤嵌套对象
        filtered[key] = filterPII(value);
      }
    }

    return filtered;
  }

  // 基本类型直接返回
  return data;
}

// ============================================================================
// 错误标准化
// ============================================================================

/**
 * 标准化错误对象
 *
 * 将任意类型的错误转换为标准的 Error 对象
 * 支持多种错误格式：
 * - 标准 Error 对象
 * - RTK Query FETCH_ERROR：`{ status: 'FETCH_ERROR', error: '...' }`
 * - RTK Query API 错误：`{ status: 400, data: { errors: [...] } }`
 * - 字符串错误
 * - 其他对象
 *
 * @param error - 任意类型的错误
 * @returns 标准化的 Error 对象
 */
export function normalizeError(error: any): Error {
  if (error instanceof Error) {
    return error;
  }

  // 处理 RTK Query 错误格式（统一处理所有 status 字段的错误）
  if (error?.status) {
    // 情况 1: FETCH_ERROR 格式（网络错误）
    // { status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' }
    if (error.error && typeof error.error === 'string') {
      const normalizedError = new Error(error.error);
      normalizedError.name = 'FetchError';
      Object.assign(normalizedError, {
        status: error.status,
        originalError: error,
      });
      return normalizedError;
    }

    // 情况 2: API 错误格式（带 data 字段）
    // { status: 400, data: { errors: [...] } } 或 { status: 500, data: { message: '...' } }
    if (error.data) {
      // 提取错误消息（优先使用 RTK Query 标准格式）
      const message =
        error.data.errors?.[0]?.detail ||
        error.data.error ||
        error.data.error_description ||
        error.data.message ||
        error.message ||
        `API Error ${error.status}`;

      const normalizedError = new Error(message);
      normalizedError.name = 'APIError';

      Object.assign(normalizedError, {
        status: error.status,
        data: error.data,
        originalError: error,
      });

      // 如果原始错误有堆栈信息，保留它
      if (typeof (error as any)?.originalStack === 'string') {
        normalizedError.stack = (error as any).originalStack;
      }

      return normalizedError;
    }
  }

  // 字符串错误
  if (typeof error === 'string') {
    return new Error(error);
  }

  // 其他类型（对象、null、undefined 等）
  // 尝试序列化对象，并保存原始错误
  let message = 'Unknown error';

  if (error && typeof error === 'object') {
    // 尝试提取有用的错误信息
    message = error.message || error.error || error.toString?.() || JSON.stringify(error);
  } else if (error !== null && error !== undefined) {
    // 基本类型（number, boolean 等）
    message = String(error);
  }

  const normalizedError = new Error(message);
  normalizedError.name = 'UnknownError';

  // 保存原始错误对象供 Sentry 和日志使用
  Object.assign(normalizedError, {
    originalError: error,
  });

  return normalizedError;
}

// ============================================================================
// 环境判断
// ============================================================================

/**
 * 判断是否应该发送到 Sentry
 *
 * 环境说明：
 * - 本地开发（NODE_ENV=development）：不上报 ❌
 * - 测试环境（-test）：上报 ✅
 * - UAT 环境（-uat）：上报 ✅
 * - 生产环境（-prod）：上报 ✅
 */
export function shouldSendToSentry(): boolean {
  // 只有本地开发环境不发送（test/uat/prod 都要发送）
  if (process.env['NODE_ENV'] === 'development') {
    return false;
  }

  // 没有配置 DSN，不发送
  if (!process.env['NEXT_PUBLIC_SENTRY_DSN']) {
    return false;
  }

  return true;
}

// ============================================================================
// 业务错误判断
// ============================================================================

/**
 * 判断是否是用户输入错误
 *
 * 常见场景：
 * - 密码错误
 * - 邮箱格式错误
 * - 用户名已存在
 *
 * 注意：仅匹配明确的用户输入错误关键词，不能简单地将所有 400/422 归为用户输入错误，
 * 否则会静默丢弃真实 bug（如加购逻辑错误、接口参数构建错误等）。
 *
 * @example
 * ```typescript
 * const skipSentry = isUserInputError(error);
 * captureStructuredError(error, { skipSentry });
 * ```
 */
export function isUserInputError(error: any): boolean {
  const status = error?.status;
  const message = (
    error?.data?.error ||
    error?.data?.errors?.[0]?.detail ||
    error?.data?.error_description ||
    ''
  ).toLowerCase();

  // 400：仅当消息内容明确表示用户输入错误时才跳过
  if (status === 400 && message) {
    // 凭证错误：(incorrect|invalid|wrong|bad) 与 (password|username|credentials) 的任意组合
    const adjectives = 'incorrect|invalid|wrong|bad';
    const nouns = 'password|username|credentials';
    const credentialErrorRegex = new RegExp(
      `\\b(${adjectives})\\b.{0,30}\\b(${nouns})\\b|\\b(${nouns})\\b.{0,30}\\b(${adjectives})\\b`
    );
    const credentialError = credentialErrorRegex.test(message);

    // 账号存在性错误
    const accountExistenceError =
      /already (taken|exists|registered)|email (already|not found|has already been taken)|user not found|account not found|record not found/.test(
        message
      );

    // 邮箱 / 密码格式错误
    const formatError =
      /invalid email|email is invalid|unconfirmed email|password is too short|password confirmation|does not match/.test(
        message
      );

    // Token 错误
    const tokenError = /token (is invalid|has expired)|reset token/.test(message);

    return credentialError || accountExistenceError || formatError || tokenError;
  }

  // 422：验证失败，通常是用户提交了不符合格式要求的表单数据
  if (status === 422) {
    return true;
  }

  return false;
}

/**
 * 判断是否是预期的业务错误
 *
 * 常见场景：
 * - 商品已下架
 * - 库存不足
 * - 订单已合并
 *
 * @example
 * ```typescript
 * import { BUSINESS_DOMAIN } from '@castlery/observability';
 *
 * const skipSentry = isExpectedBusinessError(error);
 * captureStructuredError(error, {
 *   domain: BUSINESS_DOMAIN.CART,
 *   skipSentry
 * });
 * ```
 */
export function isExpectedBusinessError(error: any): boolean {
  const status = error?.status;
  const message = (
    error?.data?.error ||
    error?.data?.message ||
    error?.data?.errors?.[0]?.detail ||
    error?.error ||
    error?.message ||
    ''
  ).toLowerCase();

  // 400/422 + 预期的业务错误关键词
  if (status === 400 || status === 422) {
    const expectedKeywords = [
      'out of stock',
      'no longer available',
      'already merged',
      'not available',
      'sold out',
      'discontinued',
    ];
    return expectedKeywords.some((keyword) => message.includes(keyword));
  }

  // 404 资源不存在（通常是预期的）
  if (status === 404) {
    return true;
  }

  // 409 冲突（通常是预期的，如订单已合并）
  if (status === 409) {
    return true;
  }

  return false;
}

/**
 * 判断是否是权限或认证错误
 *
 * 常见场景：
 * - Token 过期
 * - 没有权限访问
 * - 需要登录
 *
 * @example
 * ```typescript
 * const skipSentry = isAuthError(error);
 * ```
 */
export function isAuthError(error: any): boolean {
  const status = error?.status;

  // 401 未认证（如 Token 过期）
  if (status === 401) {
    return true;
  }

  // 403 无权限
  if (status === 403) {
    return true;
  }

  return false;
}

/**
 * 判断是否是支付相关的用户错误
 *
 * 常见场景：
 * - 余额不足
 * - 信用卡被拒
 * - 支付信息错误
 *
 * @example
 * ```typescript
 * const skipSentry = isUserPaymentError(error);
 * captureStructuredError(error, {
 *   domain: 'payment_process',
 *   skipSentry
 * });
 * ```
 */
export function isUserPaymentError(error: any): boolean {
  const status = error?.status;
  const message = (error?.data?.error || '').toLowerCase();

  if (status === 400) {
    const paymentErrorKeywords = [
      'insufficient',
      'card declined',
      'invalid card',
      'expired',
      'payment failed',
      'insufficient funds',
      'card number',
      'cvv',
      'expiry',
    ];
    return paymentErrorKeywords.some((keyword) => message.includes(keyword));
  }

  return false;
}

/**
 * 统一判断：是否应该跳过 Sentry
 *
 * 综合判断是否是用户错误、预期错误、权限错误
 *
 * @example
 * ```typescript
 * captureStructuredError(error, {
 *   skipSentry: shouldSkipSentry(error)
 * });
 * ```
 */
export function shouldSkipSentry(error: any): boolean {
  return isUserInputError(error) || isExpectedBusinessError(error) || isAuthError(error);
}

/**
 * 针对特定域的判断逻辑
 *
 * 不同业务域对错误的容忍度不同
 */
export const domainSpecificFilters = {
  /**
   * USER 域：跳过用户输入错误和认证错误
   */
  user: (error: any): boolean => {
    return isUserInputError(error) || isAuthError(error);
  },

  /**
   * CART 域：跳过用户输入错误和预期业务错误
   */
  cart: (error: any): boolean => {
    return isUserInputError(error) || isExpectedBusinessError(error);
  },

  /**
   * ORDER 域：跳过预期业务错误
   */
  order: (error: any): boolean => {
    return isExpectedBusinessError(error);
  },

  /**
   * PAYMENT 域：只跳过用户支付错误，其他都上报
   */
  payment: (error: any): boolean => {
    return isUserPaymentError(error);
  },

  /**
   * CHECKOUT 域：跳过用户输入错误
   */
  checkout: (error: any): boolean => {
    return isUserInputError(error);
  },
};
