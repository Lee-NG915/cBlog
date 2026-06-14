import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import {
  requestToInitializePayment,
  requestToCapturePayment,
  requestToRemovePayment,
} from '@castlery/modules-payment-domain/server';
import type {
  IPaymentStrategy,
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
 * Handles 2C2P installment payments (SG market).
 *
 * Flow: initiatePaymentIntent → SDK_CONFIRM (the Component renders the 2C2P
 * payment token inside the UI) → user completes on 2C2P iframe → capturePayment.
 *
 * The `clientSecret` field in SDK_CONFIRM carries the 2C2P paymentToken
 * so the Component layer can pass it to the 2C2P SDK without awareness
 * of the provider type.
 *
 * NOTE: The Component-layer 2C2P SDK integration (tctp-payment-methods.tsx)
 * requires a separate Phase 6 update to consume the ActionSchema result
 * instead of the current form-submit pattern.
 */
export class TwoCTwoPStrategy implements IPaymentStrategy, IConfirmPayment {
  readonly type = PaymentMethodProviderEnum.TWO_C2P;

  constructor(private readonly traceId: string) {}

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
          paymentConfig: cmd.config.twoCTwoPConfig ? { twoCTwoPConfig: cmd.config.twoCTwoPConfig } : undefined,
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
      // 2C2P returns a paymentToken; carried in the generic sdkToken field.
      const paymentToken = (initResult?.paymentResult as any)?.twoCTwoPResult?.paymentToken ?? '';
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
          paymentResult: { sdkToken: paymentToken },
        },
      };
    } catch (error) {
      captureStrategyInitiateException(error, cmd, {
        traceId: this.traceId,
        provider: this.type,
        durationMs: Date.now() - start,
      });
      return {
        success: false,
        error: { code: 'INITIATE_FAILED', message: extractErrorMessage(error, 'internal payment initiate error') },
      };
    }
  }

  /**
   * Returns SDK_CONFIRM with the 2C2P paymentToken in `clientSecret`.
   * The Component layer must handle this by passing the token to the 2C2P SDK.
   */
  async confirmPayment(intentResult: InitiatePaymentIntentResult): Promise<ActionSchema> {
    if (!intentResult.success) throw new Error('Cannot confirm payment: intent initiation failed');
    const paymentToken = intentResult.data.paymentResult.sdkToken;
    if (!paymentToken) throw new Error('Missing paymentToken in 2C2P intent result');
    return { action: 'SDK_CONFIRM', clientSecret: paymentToken, paymentId: intentResult.data.paymentId };
  }

  async capturePayment(params: CapturePaymentParams): Promise<CapturePaymentResult> {
    const start = Date.now();
    trackStrategyCaptureStart(params, this.traceId, this.type);
    try {
      const res = await requestToCapturePayment(
        { ...params, idempotencyKey: params.idempotencyKey ?? uuidv4() },
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
      return {
        success: false,
        error: { code: 'CAPTURE_FAILED', message: extractErrorMessage(error, 'internal payment capture error') },
      };
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
