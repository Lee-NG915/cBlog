/**
 * @castlery/observability server 入口
 * 服务端专用：pino logger + 全部 Sentry（含 server tracing），不导出 client 组件
 */

import { sLog } from './lib/logger/log';

// ========== Logger (pino) ==========
export { sLog };
export function getLogger() {
  return sLog();
}
export const logger = {
  debug: (msg: string, obj?: object) => sLog().debug(msg, obj),
  info: (msg: string, obj?: object) => sLog().info(msg, obj),
  warn: (msg: string, obj?: object) => sLog().warn(msg, obj),
  error: (msg: string, obj?: object) => sLog().error(msg, obj),
} as const;

// ========== 错误捕获 ==========
export { captureStructuredError } from './lib/sentry/capture/capture-error';
export {
  createDomainErrorCapture,
  capturePaymentError,
  captureOrderError,
  captureCartError,
  captureProductError,
  captureUserError,
  captureCheckoutError,
} from './lib/sentry/capture/error-shortcuts';

// ========== 消息捕获 ==========
export { captureStructuredMessage } from './lib/sentry/capture/capture-message';
export {
  createDomainMessageCapture,
  sendPaymentMessage,
  sendOrderMessage,
  sendCartMessage,
  sendProductMessage,
  sendUserMessage,
  sendCheckoutMessage,
} from './lib/sentry/capture/message-shortcuts';
export {
  filterPII,
  normalizeError,
  shouldSendToSentry,
  isUserInputError,
  isExpectedBusinessError,
  isAuthError,
  isUserPaymentError,
  shouldSkipSentry,
  domainSpecificFilters,
} from './lib/sentry/errors/error-utils';

// ========== Sentry 上下文 ==========
export {
  setGlobalSentryContext,
  setSentryContext,
  withSentryContext,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  enrichContext,
} from './lib/sentry/contexts/context-setters';
export type { MonitoringContext, EcommerceContext } from './lib/monitoring/types';
export { BUSINESS_DOMAIN } from './lib/monitoring/domains';
export type { BusinessDomain } from './lib/monitoring/domains';
export { PAGE_TYPES } from './lib/monitoring/page-types';
export type { PageType } from './lib/monitoring/page-types';
export {
  BusinessSeverity,
  BusinessPriority,
  DOMAIN_SEVERITY,
  DOMAIN_PRIORITY,
  SEVERITY_TO_SENTRY_LEVEL,
  SEVERITY_TO_LOG_LEVEL,
  extractDomainCategory,
  inferPriorityFromDomain,
  inferDomainFromPageType,
  inferDomainAndPriorityFromPageType,
} from './lib/monitoring/priorities';
export type { BusinessSeverityLevel, BusinessPriorityLevel } from './lib/monitoring/priorities';

// ========== Sentry 分桶 ==========
export { classifyErrorBucketServer } from './lib/sentry/errors/error-bucket';

// ========== Sentry Tracing (服务端) ==========
export { withServerActionInstrumentation } from './lib/sentry/tracing/server-action-wrapper';
export type { ServerActionOptions } from './lib/sentry/tracing/server-action-wrapper';
export {
  withFetchSpan,
  wrapMethod,
  wrapClient,
  createTrackedGet,
  createTrackedPost,
} from './lib/sentry/tracing/fetch-with-tracing';

// ========== Transaction Observability (server-safe only) ==========
export * from './lib/transaction-observability/types';
export * from './lib/transaction-observability/context';
export * from './lib/transaction-observability/logger';
export * from './lib/transaction-observability/sentry';
