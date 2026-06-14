/**
 * 统一消息捕获（Sentry + Logger）
 *
 * 与 capture-error.ts 平行，用于捕获非错误的重要事件/警告/通知。
 * 典型场景：业务流程降级告警、关键指标异常、支付回调非预期状态等。
 */
import { captureMessage } from '@sentry/nextjs';
import { withSentryContext, enrichContext } from '../contexts/context-setters';
import type { MonitoringContext } from '../../monitoring/types';
import { SEVERITY_TO_LOG_LEVEL, SEVERITY_TO_SENTRY_LEVEL, BusinessSeverity } from '../../monitoring/priorities';
import { filterPII, shouldSendToSentry } from '../errors/error-utils';
import { logger } from '../../logger/unified-logger';

/**
 * 日志集成
 */
function logMessage(message: string, context: MonitoringContext) {
  const logLevel = context.severity && SEVERITY_TO_LOG_LEVEL[context.severity];
  const level = logLevel === 'fatal' ? 'error' : logLevel ?? 'warn';
  const formattedMessage = `[${context.domain?.toUpperCase() || 'UNKNOWN'}] ${message}`;

  const details: Record<string, any> = {
    severity: context.severity,
    priority: context.priority,
    domain: context.domain,
    ...context.extra,
  };

  logger[level](formattedMessage, details);
}

/**
 * 捕获结构化消息（非错误事件）
 *
 * 与 `captureStructuredError` 共享相同的上下文注入机制：
 * - ✅ 统一的上下文注入（domain、priority、severity 自动推断）
 * - ✅ 自动过滤 PII 信息
 * - ✅ 环境过滤（dev 环境不上报）
 * - ✅ 日志集成（所有环境都打日志）
 * - ✅ 自定义 Sentry tags（通过 `tags` 字段，走 `scope.setTags`）
 * - ✅ 自定义分组指纹（通过 `fingerprint` 字段，走 `scope.setFingerprint`）
 *
 * **使用场景**（与 `captureStructuredError` 互补）：
 * - ✅ 业务降级告警（非 error，但需要 Sentry 可视化追踪）
 * - ✅ 关键路径监控（如支付回调状态非预期）
 * - ✅ 功能 fallback 通知
 * - ✅ API 返回非预期结果但不是异常
 * - ✅ 性能指标异常（如 CLS 超阈值，需自定义 tags + fingerprint 分组）
 *
 * **注意**：domain 快捷函数（`sendPaymentMessage` 等）当前只透传基础字段，
 * 需要 `tags` 或 `fingerprint` 时请直接调用本函数，或扩展 `createDomainMessageCapture`。
 *
 * @param message - 消息内容
 * @param context - 消息上下文（完整 MonitoringContext），severity 默认 BusinessSeverity.LOW（Sentry level: 'log'）
 * @param context.tags - 自定义 Sentry tags，用于过滤/告警规则（如 `{ page, viewport, clsRating }`）
 * @param context.fingerprint - issue 分组指纹数组（如 `['cls-v2', culpritSelector]`）
 * @param context.extra - 调试用附加数据，自动过滤 PII
 * @param context.domain - 业务域（BUSINESS_DOMAIN 枚举）
 * @param context.severity - 严重程度，默认 BusinessSeverity.LOW
 * @param context.skipSentry - 仅打日志，不上报 Sentry
 * @returns Sentry event ID（dev 环境或 skipSentry=true 返回空字符串）
 *
 * @example
 * ```typescript
 * import { captureStructuredMessage, BUSINESS_DOMAIN } from '@castlery/observability';
 *
 * // 支付回调状态非预期
 * captureStructuredMessage('Payment callback received unexpected status: pending', {
 *   domain: BUSINESS_DOMAIN.PAYMENT,
 *   severity: BusinessSeverity.MEDIUM,
 *   extra: { orderId: '123', callbackStatus: 'pending' },
 * });
 *
 * // 功能降级通知
 * captureStructuredMessage('DY personalization unavailable, falling back to default', {
 *   domain: BUSINESS_DOMAIN.CMS,
 *   severity: BusinessSeverity.LOW,
 *   extra: { endpoint: '/api/dy/campaigns' },
 * });
 *
 * // 关键指标异常（带自定义 tags + fingerprint 分组）
 * captureStructuredMessage('CLS: 0.182 - div#hero', {
 *   severity: BusinessSeverity.MEDIUM,
 *   tags: { page: '/products/sofa', clsRating: 'needs-improvement', viewport: '390x844' },
 *   fingerprint: ['cls-v2', 'div#hero'],
 *   extra: { clsValue: 0.182, sources: [...] },
 * });
 * ```
 */
export function captureStructuredMessage(message: string, context: MonitoringContext = {}): string {
  const contextWithDefaults: MonitoringContext = {
    severity: BusinessSeverity.LOW,
    ...context,
  };

  const enrichedContext = enrichContext(contextWithDefaults);

  logMessage(message, enrichedContext);

  if (enrichedContext.skipSentry || !shouldSendToSentry()) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[Sentry] Skipped message:', {
        reason: enrichedContext.skipSentry ? 'skipSentry=true' : 'development environment',
      });
    }
    return '';
  }

  const sentryContext: MonitoringContext = {
    ...enrichedContext,
    extra: enrichedContext.extra ? filterPII(enrichedContext.extra) : undefined,
  };

  const sentryLevel = SEVERITY_TO_SENTRY_LEVEL[enrichedContext.severity ?? BusinessSeverity.LOW];

  return withSentryContext(sentryContext, () => {
    return captureMessage(message, sentryLevel);
  }) as string;
}
