// export * from './lib/logging-types';
// export * from './lib/log';
// export * from './lib/client-logging';
// export * from './lib/unified-logger';
// export * from './lib/log-level-utils';
// export * from './lib/transaction-monitoring';
/**
 * @castlery/observability 主入口
 * 仅暴露轻量 logger（console 实现）、类型、log-level-utils 及 Sentry 相关；不拉取 pino。
 * 服务端用 @castlery/observability/server，客户端用 @castlery/observability/client。
 */

// ========== Logger（类型 + 轻量实现，主入口仅 console） ==========
export type { Logger, LogFn } from './lib/logger/logging-types';
export { getLogger, logger } from './lib/logger/unified-logger';
export {
  LOG_LEVEL_PRIORITY,
  DEFAULT_LOG_LEVEL,
  createLogLevelFilter,
  shouldLogLevel,
} from './lib/logger/log-level-utils';

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
export {
  ERROR_BUCKET,
  BUCKET_CONFIDENCE,
  classifyErrorBucket,
  CRITICAL_THIRD_PARTY_PATTERNS,
  THIRD_PARTY_PATTERNS,
  OWN_DOMAIN_PATTERNS,
} from './lib/sentry/errors/error-bucket';
export type { ErrorBucket, BucketConfidence, ErrorBucketInput } from './lib/sentry/errors/error-bucket';

// ========== Sentry 组件 ==========
export { SentryContextProvider } from './lib/sentry/components/sentry-context-provider';
export type { SentryContextProviderProps } from './lib/sentry/components/sentry-context-provider';

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

// ========== Sentry Tracing（主入口仍导出，服务端专用请用 @castlery/observability/server） ==========
export { withServerActionInstrumentation } from './lib/sentry/tracing/server-action-wrapper';
export type { ServerActionOptions } from './lib/sentry/tracing/server-action-wrapper';
export {
  withFetchSpan,
  wrapMethod,
  wrapClient,
  createTrackedGet,
  createTrackedPost,
} from './lib/sentry/tracing/fetch-with-tracing';

// ========== Transaction Observability ==========
export * from './lib/transaction-observability';
