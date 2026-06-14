'use server';
import { v4 as uuidv4 } from 'uuid';
import { PaymentService } from '@castlery/modules-payment-services/server';
import { PaymentStrategyFactory, extractErrorMessage } from '@castlery/modules-payment-infrastructure/server';
import {
  PaymentMethodProviderEnum,
  type ActionSchema,
  type ProviderConfigSchema,
  type CapturePaymentParams,
} from '@castlery/modules-payment-domain';
import {
  TransactionActionType,
  TransactionDomain,
  TransactionErrorCategory,
  captureTransactionError,
  trackTransactionFailure,
  trackTransactionStart,
  trackTransactionSuccess,
  type TransactionObservabilityContext,
} from '@castlery/observability';
import { INTL_CURRENCY } from '@castlery/config';

// ─── Action 1: initiatePaymentAction ─────────────────────────────────────────
//
// Entry point for starting a payment. Called by the Component after the client
// has already created the order. Returns an ActionSchema that drives the next
// client step:
//   - SDK_CONFIRM → call stripe.confirmPayment(clientSecret)
//   - REDIRECT    → navigate to redirectUrl (third-party payment page)
//   - SUCCESS     → proceed directly to capturePaymentAction

export type InitiatePaymentActionParams = {
  /** Order ID created by the client via createTransactionOrder. */
  orderId: string;
  /** Order number created by the client via createTransactionOrder. */
  orderNumber: string;
  traceId?: string;
  referenceNumber?: string;
  amount: string;
  currency: string;
  paymentConfig: ProviderConfigSchema;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
};

export type InitiatePaymentActionResult =
  | {
      success: true;
      traceId: string;
      orderId: string;
      orderNumber: string;
      referenceNumber: string;
      paymentId: string;
      action: ActionSchema;
    }
  | {
      success: false;
      traceId: string;
      errorCode: string;
      errorMessage: string;
      orderId?: string;
      orderNumber?: string;
      referenceNumber?: string;
      paymentId?: string;
    };

function buildInitiateContext(
  params: InitiatePaymentActionParams,
  traceId: string,
  overrides?: Partial<TransactionObservabilityContext>
): TransactionObservabilityContext {
  return {
    domain: TransactionDomain.PAYMENT,
    step: 'payment_initiate',
    traceId,
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    provider: params.paymentConfig.provider,
    paymentAmount: params.amount,
    currency: params.currency,
    actionType: TransactionActionType.SUCCESS,
    metadata: params.metadata,
    ...overrides,
  };
}

function buildCaptureContext(
  params: CapturePaymentActionParams,
  overrides?: Partial<TransactionObservabilityContext>
): TransactionObservabilityContext {
  return {
    domain: TransactionDomain.PAYMENT,
    step: 'payment_capture',
    traceId: params.traceId,
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    paymentId: params.paymentId,
    provider: params.provider,
    paymentAmount: params.amount,
    currency: INTL_CURRENCY,
    ...overrides,
  };
}

export async function initiatePaymentAction(params: InitiatePaymentActionParams): Promise<InitiatePaymentActionResult> {
  const traceId = params.traceId ?? uuidv4();
  const idempotencyKey = params.idempotencyKey ?? traceId;
  const startTime = Date.now();

  trackTransactionStart(
    buildInitiateContext(params, traceId, {
      actionType:
        params.paymentConfig.provider === PaymentMethodProviderEnum.PAYPAL_ONLINE ||
        params.paymentConfig.provider === PaymentMethodProviderEnum.AFFIRM
          ? TransactionActionType.SDK_POPUP
          : undefined,
    })
  );

  try {
    const service = new PaymentService(new PaymentStrategyFactory());
    const result = await service.processPayment({
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      referenceNumber: params.referenceNumber,
      amount: params.amount,
      currency: params.currency,
      paymentConfig: params.paymentConfig,
      metadata: params.metadata,
      idempotencyKey,
      traceId,
    });

    if (!result.success) {
      trackTransactionFailure(
        buildInitiateContext(params, traceId, {
          paymentId: result.paymentId,
          errorCode: result.error.code,
          errorMessage: result.error.message,
          errorCategory: TransactionErrorCategory.PROVIDER_ERROR,
          durationMs: Date.now() - startTime,
        }),
        {
          message: 'transaction.payment.payment_initiate.failure',
          skipSentry: true,
        }
      );

      return {
        success: false,
        traceId,
        errorCode: result.error.code,
        errorMessage: result.error.message,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        referenceNumber: result.referenceNumber,
        paymentId: result.paymentId,
      };
    }

    const actionTypeMap: Record<
      ActionSchema['action'],
      (typeof TransactionActionType)[keyof typeof TransactionActionType]
    > = {
      SDK_CONFIRM: TransactionActionType.SDK_CONFIRM,
      REDIRECT: TransactionActionType.REDIRECT,
      SDK_POPUP: TransactionActionType.SDK_POPUP,
      SUCCESS: TransactionActionType.SUCCESS,
    };

    trackTransactionSuccess(
      buildInitiateContext(params, traceId, {
        paymentId: result.data.paymentId,
        durationMs: Date.now() - startTime,
        actionType: actionTypeMap[result.data.action.action],
        isRedirectFlow: result.data.action.action === 'REDIRECT',
      }),
      {
        message: 'transaction.payment.payment_initiate.success',
      }
    );

    return {
      success: true,
      traceId,
      orderId: result.data.orderId,
      orderNumber: result.data.orderNumber,
      referenceNumber: result.data.referenceNumber,
      paymentId: result.data.paymentId,
      action: result.data.action,
    };
  } catch (error) {
    captureTransactionError(
      error,
      buildInitiateContext(params, traceId, {
        errorCategory: TransactionErrorCategory.SYSTEM_ERROR,
        durationMs: Date.now() - startTime,
      }),
      {
        message: 'transaction.payment.payment_initiate.exception',
      }
    );

    return {
      success: false,
      traceId,
      errorCode: 'INTERNAL_ERROR',
      errorMessage: extractErrorMessage(error, 'Internal server error'),
    };
  }
}

// ─── Action 2: capturePaymentAction ──────────────────────────────────────────
//
// Closes the payment loop by calling the backend confirm API.
// Called in two scenarios:
//   1. SDK-based (Stripe/2C2P): synchronously after SDK confirmation succeeds
//   2. Redirect-based (PayPal/GrabPay/etc.): from the callback route when
//      the user returns from the third-party payment page (reserved, not yet implemented)

export type CapturePaymentActionParams = CapturePaymentParams & {
  traceId: string;
};

export type CapturePaymentActionResult =
  | { success: true; orderId: string }
  | { success: false; errorCode: string; errorMessage: string };

export async function capturePaymentAction(params: CapturePaymentActionParams): Promise<CapturePaymentActionResult> {
  const { traceId, ...captureParams } = params;
  const normalizedCaptureParams = {
    ...captureParams,
    idempotencyKey: captureParams.idempotencyKey ?? traceId,
  };
  const startTime = Date.now();

  trackTransactionStart(buildCaptureContext(params));

  try {
    const service = new PaymentService(new PaymentStrategyFactory());
    const result = await service.capturePayment(normalizedCaptureParams, traceId);

    if (!result.success) {
      trackTransactionFailure(
        buildCaptureContext(params, {
          errorCode: result.error.code,
          errorMessage: result.error.message,
          errorCategory:
            result.error.code === 'processing'
              ? TransactionErrorCategory.TIMEOUT_ERROR
              : TransactionErrorCategory.PROVIDER_ERROR,
          durationMs: Date.now() - startTime,
        }),
        {
          message: 'transaction.payment.payment_capture.failure',
          skipSentry: true,
        }
      );

      return {
        success: false,
        errorCode: result.error.code,
        errorMessage: result.error.message,
      };
    }

    trackTransactionSuccess(
      buildCaptureContext(params, {
        durationMs: Date.now() - startTime,
      }),
      {
        message: 'transaction.payment.payment_capture.success',
      }
    );

    return { success: true, orderId: result.data.orderId };
  } catch (error) {
    captureTransactionError(
      error,
      buildCaptureContext(params, {
        errorCategory: TransactionErrorCategory.SYSTEM_ERROR,
        durationMs: Date.now() - startTime,
      }),
      {
        message: 'transaction.payment.payment_capture.exception',
      }
    );

    return {
      success: false,
      errorCode: 'CAPTURE_FAILED',
      errorMessage: extractErrorMessage(error, 'Failed to capture payment'),
    };
  }
}
