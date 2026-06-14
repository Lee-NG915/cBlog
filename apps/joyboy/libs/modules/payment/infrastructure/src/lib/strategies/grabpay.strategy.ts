import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import { EcEnv } from '@castlery/config';
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
 * Reserved: the callback route users are redirected to after completing
 * payment on the GrabPay site. Not yet implemented.
 */
const paymentCallbackUrl = `${
  EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME
}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${'/checkout/grabpay'}`;

/**
 * Handles GrabPay payments (SG market).
 * Flow: initiatePaymentIntent → REDIRECT to GrabPay auth page → capture on return.
 */
export class GrabPayStrategy implements IPaymentStrategy, IConfirmPayment {
  readonly type = PaymentMethodProviderEnum.GRABPAY;

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
        actionType: 'REDIRECT',
      });
      return {
        success: true,
        data: {
          paymentId: initResult?.paymentId ?? '',
          paymentResult: { redirectUrl: initResult?.paymentResult?.redirectUrl },
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

  async confirmPayment(intentResult: InitiatePaymentIntentResult): Promise<ActionSchema> {
    if (!intentResult.success) throw new Error('Cannot confirm payment: intent initiation failed');
    const redirectUrl = intentResult.data.paymentResult.redirectUrl;
    if (!redirectUrl) throw new Error('Missing redirectUrl in GrabPay intent result');
    return { action: 'REDIRECT', redirectUrl, paymentId: intentResult.data.paymentId, returnUrl: paymentCallbackUrl };
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
