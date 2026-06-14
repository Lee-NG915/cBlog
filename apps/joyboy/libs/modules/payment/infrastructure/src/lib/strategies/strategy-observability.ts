import {
  TransactionActionType,
  TransactionDomain,
  TransactionErrorCategory,
  captureTransactionError,
  logger,
  trackTransactionFailure,
  trackTransactionStart,
  trackTransactionSuccess,
} from '@castlery/observability';
import type {
  CapturePaymentParams,
  InitiatePaymentCommand,
  PaymentMethodProviderEnum,
} from '@castlery/modules-payment-domain';

function resolveActionType(actionType?: 'SDK_CONFIRM' | 'REDIRECT' | 'SDK_POPUP' | 'SUCCESS') {
  if (!actionType) return undefined;

  return TransactionActionType[actionType];
}

type InitiateOptions = {
  traceId: string;
  provider: PaymentMethodProviderEnum;
  durationMs?: number;
  paymentId?: string;
  actionType?: 'SDK_CONFIRM' | 'REDIRECT' | 'SDK_POPUP' | 'SUCCESS';
  errorCode?: string;
  errorMessage?: string;
  errorCategory?: string;
};

type CaptureOptions = {
  traceId: string;
  provider: PaymentMethodProviderEnum;
  durationMs?: number;
  errorCode?: string;
  errorMessage?: string;
  errorCategory?: string;
};

export function trackStrategyInitiateStart(
  cmd: InitiatePaymentCommand,
  traceId: string,
  provider: PaymentMethodProviderEnum
) {
  trackTransactionStart({
    domain: TransactionDomain.PAYMENT,
    step: 'payment_initiate',
    traceId,
    orderId: cmd.orderId,
    orderNumber: cmd.orderNumber,
    provider,
    paymentAmount: cmd.amount,
    currency: cmd.currency,
  });
}

export function trackStrategyInitiateSuccess(cmd: InitiatePaymentCommand, options: InitiateOptions) {
  trackTransactionSuccess(
    {
      domain: TransactionDomain.PAYMENT,
      step: 'payment_initiate',
      traceId: options.traceId,
      orderId: cmd.orderId,
      orderNumber: cmd.orderNumber,
      paymentId: options.paymentId,
      provider: options.provider,
      paymentAmount: cmd.amount,
      currency: cmd.currency,
      durationMs: options.durationMs,
      actionType: resolveActionType(options.actionType),
    },
    {
      message: 'transaction.payment.payment_initiate.strategy_success',
      skipSentry: true,
    }
  );
}

export function trackStrategyInitiateFailure(cmd: InitiatePaymentCommand, options: InitiateOptions) {
  trackTransactionFailure(
    {
      domain: TransactionDomain.PAYMENT,
      step: 'payment_initiate',
      traceId: options.traceId,
      orderId: cmd.orderId,
      orderNumber: cmd.orderNumber,
      paymentId: options.paymentId,
      provider: options.provider,
      paymentAmount: cmd.amount,
      currency: cmd.currency,
      durationMs: options.durationMs,
      errorCode: options.errorCode,
      errorMessage: options.errorMessage,
      errorCategory: options.errorCategory || TransactionErrorCategory.PROVIDER_ERROR,
    },
    {
      message: 'transaction.payment.payment_initiate.strategy_failure',
      skipSentry: true,
    }
  );
}

export function captureStrategyInitiateException(
  error: unknown,
  cmd: InitiatePaymentCommand,
  options: InitiateOptions
) {
  captureTransactionError(error, {
    domain: TransactionDomain.PAYMENT,
    step: 'payment_initiate',
    traceId: options.traceId,
    orderId: cmd.orderId,
    orderNumber: cmd.orderNumber,
    paymentId: options.paymentId,
    provider: options.provider,
    paymentAmount: cmd.amount,
    currency: cmd.currency,
    durationMs: options.durationMs,
    errorCode: options.errorCode || 'INITIATE_FAILED',
    errorCategory: options.errorCategory || TransactionErrorCategory.SYSTEM_ERROR,
  });
}

export function trackStrategyCaptureStart(
  params: CapturePaymentParams,
  traceId: string,
  provider: PaymentMethodProviderEnum
) {
  trackTransactionStart({
    domain: TransactionDomain.PAYMENT,
    step: 'payment_capture',
    traceId,
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    paymentId: params.paymentId,
    provider,
    paymentAmount: params.amount,
  });
}

export function trackStrategyCaptureSuccess(params: CapturePaymentParams, options: CaptureOptions) {
  trackTransactionSuccess(
    {
      domain: TransactionDomain.PAYMENT,
      step: 'payment_capture',
      traceId: options.traceId,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      paymentId: params.paymentId,
      provider: options.provider,
      paymentAmount: params.amount,
      durationMs: options.durationMs,
    },
    {
      message: 'transaction.payment.payment_capture.strategy_success',
      skipSentry: true,
    }
  );
}

export function trackStrategyCaptureFailure(params: CapturePaymentParams, options: CaptureOptions) {
  trackTransactionFailure(
    {
      domain: TransactionDomain.PAYMENT,
      step: 'payment_capture',
      traceId: options.traceId,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      paymentId: params.paymentId,
      provider: options.provider,
      paymentAmount: params.amount,
      durationMs: options.durationMs,
      errorCode: options.errorCode,
      errorMessage: options.errorMessage,
      errorCategory: options.errorCategory || TransactionErrorCategory.PROVIDER_ERROR,
    },
    {
      message: 'transaction.payment.payment_capture.strategy_failure',
      skipSentry: true,
    }
  );
}

export function captureStrategyCaptureException(error: unknown, params: CapturePaymentParams, options: CaptureOptions) {
  captureTransactionError(error, {
    domain: TransactionDomain.PAYMENT,
    step: 'payment_capture',
    traceId: options.traceId,
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    paymentId: params.paymentId,
    provider: options.provider,
    paymentAmount: params.amount,
    durationMs: options.durationMs,
    errorCode: options.errorCode || 'CAPTURE_FAILED',
    errorCategory: options.errorCategory || TransactionErrorCategory.SYSTEM_ERROR,
  });
}

export function logStrategyRollback(
  traceId: string,
  provider: PaymentMethodProviderEnum,
  params?: { orderId?: string; paymentId?: string }
) {
  logger.info('transaction.payment.rollback.started', {
    trace_id: traceId,
    provider,
    order_id: params?.orderId,
    payment_id: params?.paymentId,
  });
}

export function logStrategyRollbackFailure(
  traceId: string,
  provider: PaymentMethodProviderEnum,
  error: unknown,
  params?: { orderId?: string; paymentId?: string }
) {
  logger.warn('transaction.payment.rollback.failed', {
    trace_id: traceId,
    provider,
    order_id: params?.orderId,
    payment_id: params?.paymentId,
    error,
  });
}
