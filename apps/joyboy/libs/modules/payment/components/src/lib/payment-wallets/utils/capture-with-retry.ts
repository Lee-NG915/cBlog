import { capturePaymentAction } from '@castlery/modules-payment-actions';
import type { CapturePaymentActionParams, CapturePaymentActionResult } from '@castlery/modules-payment-actions';
import {
  TransactionDomain,
  TransactionErrorCategory,
  TransactionResult,
  logger,
  reportTransactionMessage,
} from '@castlery/observability';

const CAPTURE_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 5_000;
const MAX_RETRIES = 3;
const CAPTURE_TIMEOUT_ERROR = 'CAPTURE_TIMEOUT';
const SIMULATED_TIMEOUT_MS = 50;
const SIMULATED_RETRY_DELAY_MS = 200;
const SIMULATE_TIMEOUT_QUERY_KEY = 'simulateCaptureTimeout';

function isTimeoutSimulationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const query = new URLSearchParams(window.location.search);
  return query.get(SIMULATE_TIMEOUT_QUERY_KEY) === '1';
}

/**
 * Wraps capturePaymentAction with per-attempt timeout and retry logic.
 *
 * Strategy:
 *  - Each attempt has a 10s timeout via Promise.race
 *  - On timeout: wait 5s, then retry (max 3 retries = 4 total attempts)
 *  - On explicit response (success or failure): return immediately, no retry
 *  - After all attempts timeout: return { success: false, errorCode: 'processing' }
 *
 * Idempotency: traceId is forwarded as idempotencyKey in capturePaymentAction,
 * so retrying with the same params is safe — the backend deduplicates.
 */
export async function captureWithRetry(params: CapturePaymentActionParams): Promise<CapturePaymentActionResult> {
  const shouldSimulateTimeout = isTimeoutSimulationEnabled();
  const timeoutMs = shouldSimulateTimeout ? SIMULATED_TIMEOUT_MS : CAPTURE_TIMEOUT_MS;
  const retryDelayMs = shouldSimulateTimeout ? SIMULATED_RETRY_DELAY_MS : RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const capturePromise = shouldSimulateTimeout
        ? new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(CAPTURE_TIMEOUT_ERROR)), timeoutMs);
          })
        : capturePaymentAction(params);

      const result = await Promise.race([
        capturePromise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(CAPTURE_TIMEOUT_ERROR)), timeoutMs)),
      ]);
      // Got a definitive response (success or backend failure) — return immediately, no retry
      return result;
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === CAPTURE_TIMEOUT_ERROR;
      if (!isTimeout) {
        return {
          success: false,
          errorCode: 'CAPTURE_FAILED',
          errorMessage: err instanceof Error ? err.message : String(err),
        };
      }

      logger.warn('captureWithRetry: attempt timed out', {
        attempt: attempt + 1,
        maxAttempts: MAX_RETRIES + 1,
        paymentId: params.paymentId,
        orderId: params.orderId,
        willRetry: attempt < MAX_RETRIES,
        shouldSimulateTimeout,
      });

      reportTransactionMessage(
        {
          domain: TransactionDomain.PAYMENT,
          step: 'payment_capture',
          result: TransactionResult.RETRYING,
          traceId: params.traceId,
          orderId: params.orderId,
          orderNumber: params.orderNumber,
          paymentId: params.paymentId,
          provider: params.provider,
          retryCount: attempt + 1,
          isRetry: attempt < MAX_RETRIES,
          errorCode: CAPTURE_TIMEOUT_ERROR,
          errorCategory: TransactionErrorCategory.TIMEOUT_ERROR,
          errorMessage: 'Capture attempt timed out',
        },
        {
          message: 'transaction.payment.payment_capture.retrying',
          skipSentry: true,
        }
      );

      if (attempt < MAX_RETRIES) {
        logger.info('captureWithRetry: scheduling retry after timeout', {
          retryAttempt: attempt + 1,
          maxRetries: MAX_RETRIES,
          paymentId: params.paymentId,
          orderId: params.orderId,
          retryDelayMs,
          shouldSimulateTimeout,
        });
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  logger.error('captureWithRetry: all attempts timed out, returning processing error', {
    maxAttempts: MAX_RETRIES + 1,
    paymentId: params.paymentId,
    orderId: params.orderId,
  });

  reportTransactionMessage(
    {
      domain: TransactionDomain.PAYMENT,
      step: 'payment_capture',
      result: TransactionResult.TIMEOUT,
      traceId: params.traceId,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      paymentId: params.paymentId,
      provider: params.provider,
      retryCount: MAX_RETRIES + 1,
      errorCode: 'processing',
      errorCategory: TransactionErrorCategory.TIMEOUT_ERROR,
      errorMessage: 'Payment capture timed out after retries',
    },
    {
      message: 'transaction.payment.payment_capture.timeout',
      skipSentry: true,
    }
  );

  return {
    success: false,
    errorCode: 'processing',
    errorMessage: 'Payment capture timed out after retries',
  };
}
