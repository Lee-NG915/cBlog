/**
 * 统一错误捕获（Sentry + Logger）
 *
 * 核心职责：组合 error-utils 和 context 的功能来捕获和上报错误
 */
import { captureException } from '@sentry/nextjs';
import { withSentryContext, enrichContext } from '../contexts/context-setters';
import type { MonitoringContext } from '../../monitoring/types';
import { SEVERITY_TO_LOG_LEVEL } from '../../monitoring/priorities';
import { filterPII, normalizeError, shouldSendToSentry } from '../errors/error-utils';
import { logger } from '../../logger/unified-logger';

/**
 * 日志集成
 */
function logError(error: Error, context: MonitoringContext) {
  // 使用统一的严重程度到日志级别映射
  const logLevel = context.severity && SEVERITY_TO_LOG_LEVEL[context.severity];
  // logger 没有 fatal 级别，fatal 映射到 error
  const level = logLevel === 'fatal' ? 'error' : logLevel ?? 'warn';
  const message = `[${context.domain?.toUpperCase() || 'UNKNOWN'}] ${error.message}`;

  // 构建完整的错误对象信息
  const errorDetails: Record<string, any> = {
    severity: context.severity,
    priority: context.priority,
    domain: context.domain,
    ...context.extra,
  };

  // 如果错误对象包含额外信息，添加到日志中
  if ((error as any).originalError) {
    errorDetails['originalError'] = (error as any).originalError;
  }
  if ((error as any).status) {
    errorDetails['status'] = (error as any).status;
  }
  if ((error as any).data) {
    errorDetails['data'] = (error as any).data;
  }
  if (error.stack && process.env.NODE_ENV !== 'production') {
    errorDetails['stack'] = error.stack;
  }

  logger[level](message, errorDetails);
}

/**
 * 捕获结构化错误（统一接口，增强版）
 *
 * **功能**：
 * - ✅ 统一的上下文注入机制
 * - ✅ 自动过滤 PII 信息
 * - ✅ 环境过滤（dev 环境不上报）
 * - ✅ 日志集成（所有环境都打日志）
 * - ✅ 错误标准化（处理 API 错误、字符串等）
 * - ✅ **自动推断 priority 和 severity**（基于 domain）
 *
 * **自动推断规则**：
 * | domain | severity | priority |
 * |--------|----------|----------|
 * | payment/checkout/user | critical | high |
 * | order | high | high |
 * | cart/product/search | medium | high |
 * | cms | low | low |
 * | （未指定） | medium | medium |
 *
 * **使用场景**：
 * - ✅ 业务层错误（订单、支付、加购等）
 * - ✅ 技术层追踪（fetch、Server Actions 等）
 * - ✅ API 调用错误
 *
 * @param error - 错误对象（Error 或任意类型）
 * @param context - 错误上下文（MonitoringContext）
 * @returns Sentry event ID（dev 环境或 skipSentry=true 返回空字符串）
 *
 * @example
 * ```typescript
 * // 自动从全局上下文获取 domain
 * captureStructuredError(error, {
 *   extra: { productId: '123' }
 * });
 *
 * // 手动指定 domain（覆盖全局上下文）
 * import { BUSINESS_DOMAIN } from '@castlery/observability';
 *
 * captureStructuredError(error, {
 *   domain: BUSINESS_DOMAIN.CART,
 *   extra: { variantId: '123' }
 * });
 *
 * // 手动指定优先级（覆盖默认值）
 * captureStructuredError(error, {
 *   domain: BUSINESS_DOMAIN.CART,
 *   severity: BusinessSeverity.CRITICAL,
 *   priority: BusinessPriority.HIGH,
 *   extra: { productId: '123' }
 * });
 *
 * // 跳过 Sentry 上报（仅打日志）
 * captureStructuredError(error, {
 *   domain: BUSINESS_DOMAIN.CART,
 *   skipSentry: true,
 * });
 *
 * // 迁移 Sentry.captureException(e, { tags, extra }) 时，两个字段必须分别保留：
 * // tags → scope.setTags（有索引，可在告警规则中过滤）
 * // extra → scope.setExtras（仅调试，不可检索）
 * // ❌ 错误：将 tags 合并进 extra 会让告警规则过滤静默失效
 * captureStructuredError(error, {
 *   tags: { errorType: errorStatus, productSku: sku },  // ← 原 tags，保留在 tags
 *   extra: { errorMessage, variantCode },               // ← 原 extra，保留在 extra
 * });
 * ```
 */
export function captureStructuredError(error: Error | any, context: MonitoringContext = {}): string {
  // 1. 标准化错误
  const normalizedError = normalizeError(error);

  // 2. 自动补充 priority 和 severity
  const enrichedContext = enrichContext(context);

  // 3. 日志集成（所有环境都打日志，方便本地调试）
  logError(normalizedError, enrichedContext);

  // 4. 跳过 Sentry（如果明确指定 skipSentry 或在 dev 环境）
  if (enrichedContext.skipSentry || !shouldSendToSentry()) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[Sentry] Skipped:', {
        reason: enrichedContext.skipSentry ? 'skipSentry=true' : 'development environment',
      });
    }
    return '';
  }

  // 5. 发送到 Sentry（自动 PII 过滤）
  const sentryContext: MonitoringContext = {
    ...enrichedContext,
    extra: enrichedContext.extra ? filterPII(enrichedContext.extra) : undefined,
  };

  // 使用统一的上下文封装（captureException 是同步的，所以这里也是同步返回）
  return withSentryContext(sentryContext, () => {
    return captureException(normalizedError);
  }) as string;
}
