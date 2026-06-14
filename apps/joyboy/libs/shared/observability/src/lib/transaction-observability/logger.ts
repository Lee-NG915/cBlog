import { logger } from '../logger/unified-logger';
import { createTransactionContext } from './context';
import { TransactionResult, type TransactionObservabilityContext, type TransactionResultType } from './types';

type TransactionLogLevel = 'info' | 'warn' | 'error';

function getLogLevel(result?: TransactionResultType): TransactionLogLevel {
  if (result === TransactionResult.FAILURE || result === TransactionResult.TIMEOUT) {
    return 'error';
  }

  if (result === TransactionResult.CANCELED || result === TransactionResult.PROCESSING) {
    return 'warn';
  }

  return 'info';
}

export function toTransactionLogContext(context: TransactionObservabilityContext) {
  const normalized = createTransactionContext(context);

  return {
    ...normalized,
    trace_id: normalized.traceId,
    attempt_id: normalized.attemptId,
    order_id: normalized.orderId,
    order_number: normalized.orderNumber,
    payment_id: normalized.paymentId,
    error_code: normalized.errorCode,
    error_category: normalized.errorCategory,
    http_status: normalized.httpStatus,
    duration_ms: normalized.durationMs,
  };
}

export function buildTransactionMessage(context: TransactionObservabilityContext): string {
  const normalized = createTransactionContext(context);
  const result = normalized.result || TransactionResult.STARTED;
  return `transaction.${normalized.domain}.${normalized.step}.${result}`;
}

export function logTransactionEvent(context: TransactionObservabilityContext, message?: string) {
  const normalized = createTransactionContext(context);
  const logLevel = getLogLevel(normalized.result);
  const payload = toTransactionLogContext(normalized);
  const logMessage = message || buildTransactionMessage(normalized);

  if (logLevel === 'error') {
    logger.error(logMessage, payload);
    return;
  }

  if (logLevel === 'warn') {
    logger.warn(logMessage, payload);
    return;
  }

  logger.info(logMessage, payload);
}
