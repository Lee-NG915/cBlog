import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import {
  requestToInitializePayment,
  requestToCapturePayment,
  requestToRemovePayment,
} from '@castlery/modules-payment-domain/server';
import type {
  IPaymentStrategy,
  ISubmitInformation,
  IConfirmPayment,
  ActionSchema,
  InitiatePaymentCommand,
  InitiatePaymentIntentResult,
  CapturePaymentParams,
  CapturePaymentResult,
  RemovePaymentParams,
} from '@castlery/modules-payment-domain';
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';
import {
  captureStrategyCaptureException,
  captureStrategyInitiateException,
  logStrategyRollback,
  logStrategyRollbackFailure,
  trackStrategyCaptureFailure,
  trackStrategyCaptureStart,
  trackStrategyCaptureSuccess,
  trackStrategyInitiateFailure,
  trackStrategyInitiateStart,
  trackStrategyInitiateSuccess,
} from './strategy-observability';
import { extractErrorMessage } from './extract-error-message';

/**
 * Handles all Stripe-based payment methods:
 * stripe-online, stripe-afterpay, stripe-affirm, stripe-apple-pay,
 * stripe-google-pay, stripe-link-pay.
 *
 * Implements ISubmitInformation as a marker to signal the Component layer
 * that a client-side elements.submit() must be called before initiatePaymentAction.
 * The actual submit happens in the Component; this method is a server-side no-op.
 */
export class StripeStrategy implements IPaymentStrategy, ISubmitInformation, IConfirmPayment {
  readonly type: PaymentMethodProviderEnum;

  constructor(
    private readonly traceId: string,
    type: PaymentMethodProviderEnum = PaymentMethodProviderEnum.STRIPE_ONLINE
  ) {
    this.type = type;
  }

  async initiatePaymentIntent(cmd: InitiatePaymentCommand): Promise<InitiatePaymentIntentResult> {
    const start = Date.now();
    trackStrategyInitiateStart(cmd, this.traceId, this.type);
    try {
      const res = await requestToInitializePayment(
        {
          orderNumber: cmd.orderNumber,
          orderId: cmd.orderId,
          amount: cmd.amount,
          currency: cmd.currency,
          provider: cmd.config.provider,
          idempotencyKey: cmd.idempotencyKey,
        },
        this.traceId
      );
      if (res?.code !== 0) {
        trackStrategyInitiateFailure(cmd, {
          traceId: this.traceId,
          provider: this.type,
          durationMs: Date.now() - start,
          errorCode: String(res?.code ?? 'INITIATE_FAILED'),
          errorMessage: res?.msg ?? 'Initiate payment failed',
        });
        return {
          success: false,
          error: { code: String(res?.code ?? 'INITIATE_FAILED'), message: res?.msg ?? 'Initiate payment failed' },
        };
      }
      const initResult = res.data;
      trackStrategyInitiateSuccess(cmd, {
        traceId: this.traceId,
        provider: this.type,
        durationMs: Date.now() - start,
        paymentId: initResult?.paymentId ?? '',
        actionType: 'SDK_CONFIRM',
      });
      return {
        success: true,
        data: {
          paymentId: initResult?.paymentId ?? '',
          paymentResult: {
            stripeResult: {
              clientSecret: initResult?.paymentResult?.stripeResult?.clientSecret ?? '',
            },
          },
        },
      };
    } catch (error) {
      captureStrategyInitiateException(error, cmd, {
        traceId: this.traceId,
        provider: this.type,
        durationMs: Date.now() - start,
      });
      const msg = extractErrorMessage(error, 'internal payment initiate error');
      return { success: false, error: { code: 'INITIATE_FAILED', message: msg } };
    }
  }

  /**
   * Marker method: signals that the Component must call stripe.elements.submit()
   * client-side before invoking initiatePaymentAction. Server-side no-op.
   */
  async submitPaymentInfo(_data?: unknown): Promise<void> {}

  /**
   * Returns SDK_CONFIRM so the Component knows to call stripe.confirmPayment(clientSecret).
   */
  async confirmPayment(intentResult: InitiatePaymentIntentResult): Promise<ActionSchema> {
    if (!intentResult.success) {
      throw new Error('Cannot confirm payment: intent initiation failed');
    }
    const clientSecret = intentResult.data.paymentResult.stripeResult?.clientSecret;
    if (!clientSecret) {
      throw new Error('Missing clientSecret in Stripe intent result');
    }
    return {
      action: 'SDK_CONFIRM',
      clientSecret,
      paymentId: intentResult.data.paymentId,
    };
  }

  async capturePayment(params: CapturePaymentParams): Promise<CapturePaymentResult> {
    const start = Date.now();
    trackStrategyCaptureStart(params, this.traceId, this.type);
    try {
      const res = await requestToCapturePayment(
        {
          ...params,
          idempotencyKey: params.idempotencyKey ?? uuidv4(),
        },
        this.traceId
      );

      if (res?.code !== 0) {
        trackStrategyCaptureFailure(params, {
          traceId: this.traceId,
          provider: this.type,
          durationMs: Date.now() - start,
          errorCode: String(res?.code ?? 'CAPTURE_FAILED'),
          errorMessage: res?.msg ?? 'Capture payment failed',
        });
        return {
          success: false,
          error: { code: String(res?.code ?? 'CAPTURE_FAILED'), message: res?.msg ?? 'Capture payment failed' },
        };
      }
      trackStrategyCaptureSuccess(params, {
        traceId: this.traceId,
        provider: this.type,
        durationMs: Date.now() - start,
      });
      return { success: true, data: { orderId: params.orderId } };
    } catch (error) {
      captureStrategyCaptureException(error, params, {
        traceId: this.traceId,
        provider: this.type,
        durationMs: Date.now() - start,
      });
      const msg = extractErrorMessage(error, 'internal payment capture error');
      return { success: false, error: { code: 'CAPTURE_FAILED', message: msg } };
    }
  }

  async removeInitiatedPayment(params?: RemovePaymentParams): Promise<void> {
    logStrategyRollback(this.traceId, this.type, params);
    if (!params?.orderId || !params?.paymentId) return;
    try {
      await requestToRemovePayment({ orderId: params.orderId, paymentId: params.paymentId }, this.traceId);
    } catch (error) {
      logStrategyRollbackFailure(this.traceId, this.type, error, params);
    }
  }
}
