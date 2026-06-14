import 'server-only';
import type {
  IPaymentStrategy,
  IPaymentStrategyFactory,
  ISubmitInformation,
  IConfirmPayment,
  ProviderConfigSchema,
  ActionSchema,
  CapturePaymentParams,
  CapturePaymentResult,
} from '@castlery/modules-payment-domain';
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';
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

function extractErrorMsg(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : fallback;
  if (!raw.startsWith('{')) return raw;
  try {
    const p = JSON.parse(raw);
    const msg = p.msg ?? p.message;
    return typeof msg === 'string' && msg.length > 0 ? msg : fallback;
  } catch {
    return raw;
  }
}

// ─── Input / output types ─────────────────────────────────────────────────────

export type ProcessPaymentCommand = {
  /** Order ID created by the client before calling this action. */
  orderId: string;
  /** Order number created by the client before calling this action. */
  orderNumber: string;
  referenceNumber?: string;
  amount: string;
  currency: string;
  paymentConfig: ProviderConfigSchema;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
  traceId: string;
};

export type ProcessPaymentResult =
  | {
      success: true;
      data: {
        orderId: string;
        orderNumber: string;
        referenceNumber: string;
        paymentId: string;
        /** Instruction for the client — drives SDK call or redirect. */
        action: ActionSchema;
      };
    }
  | {
      success: false;
      error: { code: string; message: string };
      orderId?: string;
      orderNumber?: string;
      referenceNumber?: string;
      paymentId?: string;
    };

// ─── PaymentService ───────────────────────────────────────────────────────────

export class PaymentService {
  constructor(private readonly factory: IPaymentStrategyFactory) {}

  async processPayment(cmd: ProcessPaymentCommand): Promise<ProcessPaymentResult> {
    // Normalize STRIPE_LINK_PAY → STRIPE_ONLINE (same backend provider)
    const provider =
      cmd.paymentConfig.provider === PaymentMethodProviderEnum.STRIPE_LINK_PAY
        ? PaymentMethodProviderEnum.STRIPE_ONLINE
        : cmd.paymentConfig.provider;

    const strategy = this.factory.get(provider, cmd.traceId);
    let paymentId: string | undefined;
    const startTime = Date.now();

    trackTransactionStart({
      domain: TransactionDomain.PAYMENT,
      step: 'payment_initiate',
      traceId: cmd.traceId,
      orderId: cmd.orderId,
      orderNumber: cmd.orderNumber,
      provider,
      paymentAmount: cmd.amount,
      currency: cmd.currency,
    });

    try {
      // ── Step 1: Client-side pre-submission marker (Stripe only) ─────────
      // ISubmitInformation is a signal to the Component layer.
      // Actual elements.submit() is done client-side before calling the Action.
      // This server-side call is a no-op.
      if (this.hasSubmitInfo(strategy)) {
        await strategy.submitPaymentInfo(cmd.metadata);
      }

      // ── Step 2: Initiate payment intent (all providers) ──────────────────
      const intentRes = await strategy.initiatePaymentIntent({
        orderNumber: cmd.orderNumber,
        orderId: cmd.orderId,
        amount: cmd.amount,
        currency: cmd.currency,
        idempotencyKey: cmd.idempotencyKey,
        config: { ...cmd.paymentConfig, provider },
        metadata: cmd.metadata,
      });

      if (!intentRes.success) {
        trackTransactionFailure(
          {
            domain: TransactionDomain.PAYMENT,
            step: 'payment_initiate',
            traceId: cmd.traceId,
            orderId: cmd.orderId,
            orderNumber: cmd.orderNumber,
            provider,
            errorCode: intentRes.error.code,
            errorMessage: intentRes.error.message,
            errorCategory: TransactionErrorCategory.PROVIDER_ERROR,
            durationMs: Date.now() - startTime,
          },
          {
            message: 'transaction.payment.payment_initiate.service_failure',
          }
        );

        return {
          success: false,
          error: intentRes.error,
          orderId: cmd.orderId,
          orderNumber: cmd.orderNumber,
          referenceNumber: cmd.referenceNumber,
        };
      }

      paymentId = intentRes.data.paymentId;

      // ── Step 3: Get next-action instruction (providers with IConfirmPayment) ─
      if (this.hasConfirmPayment(strategy)) {
        const actionSchema = await strategy.confirmPayment(intentRes);
        trackTransactionSuccess(
          {
            domain: TransactionDomain.PAYMENT,
            step: 'payment_initiate',
            traceId: cmd.traceId,
            orderId: cmd.orderId,
            orderNumber: cmd.orderNumber,
            paymentId,
            provider,
            paymentAmount: cmd.amount,
            currency: cmd.currency,
            durationMs: Date.now() - startTime,
            actionType:
              actionSchema.action === 'SDK_CONFIRM'
                ? TransactionActionType.SDK_CONFIRM
                : actionSchema.action === 'REDIRECT'
                ? TransactionActionType.REDIRECT
                : actionSchema.action === 'SDK_POPUP'
                ? TransactionActionType.SDK_POPUP
                : TransactionActionType.SUCCESS,
          },
          {
            message: 'transaction.payment.payment_initiate.service_success',
            skipSentry: true,
          }
        );
        return {
          success: true,
          data: {
            orderId: cmd.orderId,
            orderNumber: cmd.orderNumber,
            referenceNumber: cmd.referenceNumber ?? '',
            paymentId,
            action: actionSchema,
          },
        };
      }

      // ── Step 4: Direct success (providers with no intermediate step) ─────
      trackTransactionSuccess(
        {
          domain: TransactionDomain.PAYMENT,
          step: 'payment_initiate',
          traceId: cmd.traceId,
          orderId: cmd.orderId,
          orderNumber: cmd.orderNumber,
          paymentId,
          provider,
          paymentAmount: cmd.amount,
          currency: cmd.currency,
          durationMs: Date.now() - startTime,
          actionType: TransactionActionType.SUCCESS,
        },
        {
          message: 'transaction.payment.payment_initiate.service_success',
          skipSentry: true,
        }
      );
      return {
        success: true,
        data: {
          orderId: cmd.orderId,
          orderNumber: cmd.orderNumber,
          referenceNumber: cmd.referenceNumber ?? '',
          paymentId,
          action: { action: 'SUCCESS', paymentId },
        },
      };
    } catch (error) {
      // Best-effort rollback
      try {
        await this.factory.get(provider, cmd.traceId).removeInitiatedPayment({ orderId: cmd.orderId, paymentId });
      } catch (rollbackError) {
        logger.warn('transaction.payment.rollback.failure', {
          trace_id: cmd.traceId,
          order_id: cmd.orderId,
          payment_id: paymentId,
          provider,
          rollbackError,
        });
      }
      captureTransactionError(error, {
        domain: TransactionDomain.PAYMENT,
        step: 'payment_initiate',
        traceId: cmd.traceId,
        orderId: cmd.orderId,
        orderNumber: cmd.orderNumber,
        paymentId,
        provider,
        paymentAmount: cmd.amount,
        currency: cmd.currency,
        errorCode: 'PROCESS_PAYMENT_FAILED',
        errorCategory: TransactionErrorCategory.SYSTEM_ERROR,
        durationMs: Date.now() - startTime,
      });
      const msg = extractErrorMsg(error, 'internal payment process error');
      return {
        success: false,
        error: { code: 'PROCESS_PAYMENT_FAILED', message: msg },
        orderId: cmd.orderId,
        orderNumber: cmd.orderNumber,
        referenceNumber: cmd.referenceNumber,
        paymentId,
      };
    }
  }

  async capturePayment(params: CapturePaymentParams, traceId: string): Promise<CapturePaymentResult> {
    const startTime = Date.now();
    const strategy = this.factory.get(params.provider, traceId);
    trackTransactionStart({
      domain: TransactionDomain.PAYMENT,
      step: 'payment_capture',
      traceId,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      paymentId: params.paymentId,
      provider: params.provider,
      paymentAmount: params.amount,
    });

    try {
      const result = await strategy.capturePayment(params);

      if (!result.success) {
        trackTransactionFailure(
          {
            domain: TransactionDomain.PAYMENT,
            step: 'payment_capture',
            traceId,
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            paymentId: params.paymentId,
            provider: params.provider,
            paymentAmount: params.amount,
            errorCode: result.error.code,
            errorMessage: result.error.message,
            errorCategory:
              result.error.code === 'processing'
                ? TransactionErrorCategory.TIMEOUT_ERROR
                : TransactionErrorCategory.PROVIDER_ERROR,
            durationMs: Date.now() - startTime,
          },
          {
            message: 'transaction.payment.payment_capture.service_failure',
            skipSentry: result.error.code === 'processing',
          }
        );
      } else {
        trackTransactionSuccess(
          {
            domain: TransactionDomain.PAYMENT,
            step: 'payment_capture',
            traceId,
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            paymentId: params.paymentId,
            provider: params.provider,
            paymentAmount: params.amount,
            durationMs: Date.now() - startTime,
          },
          {
            message: 'transaction.payment.payment_capture.service_success',
            skipSentry: true,
          }
        );
      }

      return result;
    } catch (error) {
      captureTransactionError(error, {
        domain: TransactionDomain.PAYMENT,
        step: 'payment_capture',
        traceId,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        paymentId: params.paymentId,
        provider: params.provider,
        paymentAmount: params.amount,
        errorCode: 'CAPTURE_PAYMENT_FAILED',
        errorCategory: TransactionErrorCategory.SYSTEM_ERROR,
        durationMs: Date.now() - startTime,
      });
      throw error;
    }
  }

  // ─── Type guards ──────────────────────────────────────────────────────────

  private hasSubmitInfo(s: IPaymentStrategy): s is IPaymentStrategy & ISubmitInformation {
    return typeof (s as any).submitPaymentInfo === 'function';
  }

  private hasConfirmPayment(s: IPaymentStrategy): s is IPaymentStrategy & IConfirmPayment {
    return typeof (s as any).confirmPayment === 'function';
  }
}
