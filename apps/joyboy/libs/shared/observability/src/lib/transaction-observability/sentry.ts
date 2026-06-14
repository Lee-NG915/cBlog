import * as Sentry from '@sentry/nextjs';
import { BUSINESS_DOMAIN, type BusinessDomain as BusinessDomainType } from '../monitoring/domains';
import { BusinessSeverity, type BusinessSeverityLevel } from '../monitoring/priorities';
import { captureStructuredError } from '../sentry/capture/capture-error';
import { captureStructuredMessage } from '../sentry/capture/capture-message';
import { createTransactionContext } from './context';
import { buildTransactionMessage, logTransactionEvent } from './logger';
import {
  TransactionDomain,
  TransactionErrorCategory,
  TransactionResult,
  type TransactionEventOptions,
  type TransactionObservabilityContext,
} from './types';

function resolveBusinessDomain(domain: TransactionObservabilityContext['domain']): BusinessDomainType {
  return domain === TransactionDomain.CHECKOUT ? BUSINESS_DOMAIN.CHECKOUT : BUSINESS_DOMAIN.PAYMENT;
}

function resolveSeverity(context: TransactionObservabilityContext): BusinessSeverityLevel {
  if (context.result === TransactionResult.FAILURE || context.result === TransactionResult.TIMEOUT) {
    return BusinessSeverity.CRITICAL;
  }

  if (
    context.result === TransactionResult.CANCELED ||
    context.result === TransactionResult.PROCESSING ||
    context.errorCategory === TransactionErrorCategory.BUSINESS_RULE_ERROR
  ) {
    return BusinessSeverity.HIGH;
  }

  return BusinessSeverity.MEDIUM;
}

function shouldSkipSentry(context: TransactionObservabilityContext, options?: TransactionEventOptions): boolean {
  if (options?.skipSentry) return true;

  return (
    context.errorCategory === TransactionErrorCategory.BUSINESS_RULE_ERROR ||
    context.errorCategory === TransactionErrorCategory.USER_ABORT
  );
}

function buildSentryTags(context: TransactionObservabilityContext): Record<string, string> {
  const tags: Record<string, string> = {
    domain: context.domain,
    step: context.step,
    result: context.result || TransactionResult.FAILURE,
  };

  if (context['provider']) tags['provider'] = String(context['provider']);
  if (context['region']) tags['region'] = String(context['region']);
  if (context['env']) tags['env'] = String(context['env']);
  if (context['service']) tags['service'] = String(context['service']);
  if (context['version']) tags['version'] = String(context['version']);
  if (context['release']) tags['release'] = String(context['release']);
  if (context['errorCategory']) tags['errorCategory'] = String(context['errorCategory']);
  if (context['traceId']) tags['traceId'] = String(context['traceId']);
  if (context['attemptId']) tags['attemptId'] = String(context['attemptId']);
  if (context['orderId']) tags['orderId'] = String(context['orderId']);
  if (context['paymentId']) tags['paymentId'] = String(context['paymentId']);

  return tags;
}

function getFingerprint(context: TransactionObservabilityContext, options?: TransactionEventOptions): string[] {
  if (options?.fingerprint?.length) {
    return options.fingerprint;
  }

  return [context.domain, context.step, context.provider || 'unknown-provider', context.errorCode || 'unknown-error'];
}

// transaction capture 不直接上报 fatal/critical：CRITICAL 降级到 HIGH（Sentry error），
// 其他统一收敛到 MEDIUM（Sentry warning）。保留与旧实现 fatal→error / 其他→warning 等价的语义。
function getCaptureSeverity(context: TransactionObservabilityContext): BusinessSeverityLevel {
  return resolveSeverity(context) === BusinessSeverity.CRITICAL ? BusinessSeverity.HIGH : BusinessSeverity.MEDIUM;
}

export function addTransactionBreadcrumb(context: TransactionObservabilityContext, message?: string) {
  const normalized = createTransactionContext(context);

  Sentry.addBreadcrumb({
    type: 'default',
    category: `transaction.${normalized.domain}`,
    level:
      normalized.result === TransactionResult.FAILURE || normalized.result === TransactionResult.TIMEOUT
        ? 'error'
        : 'info',
    message: message || buildTransactionMessage(normalized),
    data: normalized,
  });
}

export function captureTransactionException(
  error: unknown,
  context: TransactionObservabilityContext,
  options?: TransactionEventOptions
) {
  const normalized = createTransactionContext({
    ...context,
    result: context.result || TransactionResult.FAILURE,
  });

  addTransactionBreadcrumb(normalized, options?.message);
  logTransactionEvent(normalized, options?.message);
  const skipSentry = shouldSkipSentry(normalized, options);

  if (skipSentry) {
    return normalized;
  }

  Sentry.withScope((scope) => {
    scope.setContext('transaction', normalized);

    captureStructuredError(error, {
      domain: resolveBusinessDomain(normalized.domain),
      severity: getCaptureSeverity(normalized),
      skipSentry,
      tags: buildSentryTags(normalized),
      fingerprint: getFingerprint(normalized, options),
      extra: normalized,
    });
  });

  return normalized;
}

export function captureTransactionMessage(context: TransactionObservabilityContext, options?: TransactionEventOptions) {
  const normalized = createTransactionContext(context);

  addTransactionBreadcrumb(normalized, options?.message);
  logTransactionEvent(normalized, options?.message);
  const skipSentry = shouldSkipSentry(normalized, options);

  if (skipSentry) {
    return normalized;
  }

  Sentry.withScope((scope) => {
    scope.setContext('transaction', normalized);

    captureStructuredMessage(options?.message || buildTransactionMessage(normalized), {
      domain: resolveBusinessDomain(normalized.domain),
      severity: getCaptureSeverity(normalized),
      skipSentry,
      tags: buildSentryTags(normalized),
      fingerprint: getFingerprint(normalized, options),
      extra: normalized,
    });
  });

  return normalized;
}
