export * from './types';
export * from './context';
export * from './logger';
export * from './sentry';

import { withTransactionResult } from './context';
import { logTransactionEvent } from './logger';
import { addTransactionBreadcrumb, captureTransactionException, captureTransactionMessage } from './sentry';
import {
  TransactionResult,
  type TransactionEventOptions,
  type TransactionObservabilityContext,
  type TransactionResultType,
} from './types';

function trackTransactionEvent(
  context: TransactionObservabilityContext,
  result: TransactionResultType,
  options?: TransactionEventOptions
) {
  const normalized = withTransactionResult(context, result);

  addTransactionBreadcrumb(normalized, options?.message);
  logTransactionEvent(normalized, options?.message);

  return normalized;
}

export function trackTransactionStart(context: TransactionObservabilityContext, options?: TransactionEventOptions) {
  return trackTransactionEvent(context, TransactionResult.STARTED, options);
}

export function trackTransactionSuccess(context: TransactionObservabilityContext, options?: TransactionEventOptions) {
  return trackTransactionEvent(context, TransactionResult.SUCCESS, options);
}

export function trackTransactionFailure(context: TransactionObservabilityContext, options?: TransactionEventOptions) {
  const normalized = withTransactionResult(context, TransactionResult.FAILURE);

  captureTransactionMessage(normalized, options);

  return normalized;
}

export function trackTransactionTimeout(context: TransactionObservabilityContext, options?: TransactionEventOptions) {
  return trackTransactionEvent(context, TransactionResult.TIMEOUT, options);
}

export function captureTransactionError(
  error: unknown,
  context: TransactionObservabilityContext,
  options?: TransactionEventOptions
) {
  return captureTransactionException(error, context, options);
}

export function reportTransactionMessage(context: TransactionObservabilityContext, options?: TransactionEventOptions) {
  return captureTransactionMessage(context, options);
}
