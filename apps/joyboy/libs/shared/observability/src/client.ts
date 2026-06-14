'use client';

/**
 * @castlery/observability client 入口
 * 客户端专用：console logger + Sentry（不含服务端 tracing），不依赖 pino
 */

import { cLog } from './lib/logger/client-logging';

// ========== Logger (console) ==========
export { cLog };
export function getLogger() {
  return cLog();
}
export const logger = {
  debug: (msg: string, obj?: object) => cLog().debug(msg, obj),
  info: (msg: string, obj?: object) => cLog().info(msg, obj),
  warn: (msg: string, obj?: object) => cLog().warn(msg, obj),
  error: (msg: string, obj?: object) => cLog().error(msg, obj),
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
export {
  ERROR_BUCKET,
  BUCKET_CONFIDENCE,
  classifyErrorBucket,
  CRITICAL_THIRD_PARTY_PATTERNS,
  THIRD_PARTY_PATTERNS,
  OWN_DOMAIN_PATTERNS,
} from './lib/sentry/errors/error-bucket';
export type { ErrorBucket, BucketConfidence, ErrorBucketInput } from './lib/sentry/errors/error-bucket';
export { clientBeforeSend } from './lib/sentry/hooks/web/client-before-send';
export type { BeforeSendDeps } from './lib/sentry/hooks/web/client-before-send';

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

// ========== Transaction Observability ==========
export * from './lib/transaction-observability';
