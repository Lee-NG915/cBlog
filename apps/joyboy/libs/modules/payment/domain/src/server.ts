import 'server-only';
import { put, del } from '@castlery/utils';
import * as Sentry from '@sentry/nextjs';
import { EcEnv, MarketCurrency, X_CHANNEL } from '@castlery/config';
import type { CapturePaymentParams } from './lib/strategies/payment.strategy';

export const currentChannel = EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase();
const TRACE_HEADER = 'x-trace-id';

function getSentryTraceHeaders(): Partial<Record<'sentry-trace' | 'baggage', string>> {
  try {
    const maybeSentry = Sentry as typeof Sentry & {
      getTraceData?: () => Partial<Record<'sentry-trace' | 'baggage', string>>;
    };

    return maybeSentry.getTraceData?.() ?? {};
  } catch {
    return {};
  }
}

function buildTracingHeaders(traceId?: string): Record<string, string> {
  const sentryTraceHeaders = getSentryTraceHeaders();

  return {
    ...(traceId ? { [TRACE_HEADER]: traceId } : {}),
    ...(sentryTraceHeaders['sentry-trace'] ? { 'sentry-trace': sentryTraceHeaders['sentry-trace'] } : {}),
    ...(sentryTraceHeaders.baggage ? { baggage: sentryTraceHeaders.baggage } : {}),
  };
}

/** Base URL for server-side API calls; use API host so requests hit the backend. */
function getServerApiBaseUrl(): string {
  const base = EcEnv.NEXT_PUBLIC_API_HOST ?? '';
  return base.replace(/\/$/, '');
}

// ─── API response types ───────────────────────────────────────────────────────

type ApiResponse<T = undefined> = {
  code: number;
  msg: string;
  data?: T;
};

export type InitiatePaymentApiResponse = ApiResponse<{
  paymentId: string;
  paymentResult: {
    stripeResult?: { clientSecret: string };
    paypalResult?: { redirectUrl: string; orderId: string; intent: string };
    redirectUrl?: string;
    twoCTwoPResult?: { paymentToken?: string };
  };
}>;

export type CapturePaymentApiResponse = ApiResponse;

// ─── initiatePaymentIntent ────────────────────────────────────────────────────

export const requestToInitializePayment = async (
  payload: {
    orderNumber: string;
    orderId: string;
    amount: string;
    currency?: string;
    provider: string;
    idempotencyKey?: string;
    paymentConfig?: Record<string, unknown>;
  },
  traceId?: string
): Promise<InitiatePaymentApiResponse> => {
  const url = `${getServerApiBaseUrl()}/api/v1/order/payment/initiate`;
  const headers: Record<string, string> = {
    [X_CHANNEL]: currentChannel,
    ...buildTracingHeaders(traceId),
  };
  try {
    const res = await put(url, {
      authOption: true,
      headers,
      body: {
        orderNumber: payload.orderNumber,
        amount: payload.amount,
        currency: payload.currency ?? MarketCurrency,
        paymentConfig: {
          provider: payload.provider,
          ...payload.paymentConfig,
        },
      },
    });
    return res;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};

// ─── capturePayment ───────────────────────────────────────────────────────────

export const requestToCapturePayment = async (
  payload: CapturePaymentParams,
  traceId?: string
): Promise<CapturePaymentApiResponse> => {
  const url = `${getServerApiBaseUrl()}/api/v1/order/payment/confirm`;
  const headers: Record<string, string> = {
    [X_CHANNEL]: currentChannel,
    ...buildTracingHeaders(traceId),
  };
  try {
    const res = await put(url, {
      authOption: true,
      headers,
      body: {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        paymentId: payload.paymentId,
        ...(payload.idempotencyKey && { idempotencyKey: payload.idempotencyKey }),
        ...(payload.amount && { amount: payload.amount }),
        confirmData: {
          provider: payload.provider,
          ...(payload.affirmData && { affirmData: payload.affirmData }),
          ...(payload.grabPayData && { grabPayData: payload.grabPayData }),
          ...(payload.paypalData && { paypalData: payload.paypalData }),
          ...(payload.twoCTwoPData && { twoCTwoPData: payload.twoCTwoPData }),
        },
      },
    });
    return res;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};

// ─── removeInitiatedPayment ───────────────────────────────────────────────────

export const requestToRemovePayment = async (
  payload: { orderId: string; paymentId: string },
  traceId?: string
): Promise<ApiResponse> => {
  const url = `${getServerApiBaseUrl()}/api/v1/order/payment`;
  const headers: Record<string, string> = {
    [X_CHANNEL]: currentChannel,
    ...buildTracingHeaders(traceId),
  };
  try {
    const res = await del(url, {
      authOption: true,
      headers,
      body: JSON.stringify(payload),
    });
    return res;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
