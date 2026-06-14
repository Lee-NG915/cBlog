import { redirect } from 'next/navigation';
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';
import { PaymentService } from '@castlery/modules-payment-services/server';
import { PaymentStrategyFactory } from '@castlery/modules-payment-infrastructure/server';
import { reportTransactionMessage, TransactionDomain, TransactionResult } from '@castlery/observability';

function readParam(searchParams: Record<string, string | string[] | undefined>, keys: string[]): string {
  for (const key of keys) {
    const value = searchParams[key];
    if (typeof value === 'string' && value) return value;
  }
  return '';
}

function buildPaymentUrl(
  region: string,
  params: {
    orderId?: string;
    orderNumber?: string;
    paymentStatus: 'failure' | 'processing';
    provider: string;
    paymentId?: string;
    traceId?: string;
    errorCode?: string;
  }
) {
  const basePath = `/${region.toLowerCase()}/checkout/payment`;
  const target = new URL(basePath, 'https://castlery.local');

  if (params.orderId) target.searchParams.set('orderId', params.orderId);
  if (params.orderNumber) target.searchParams.set('orderNumber', params.orderNumber);
  if (params.paymentId) target.searchParams.set('paymentId', params.paymentId);
  if (params.traceId) target.searchParams.set('traceId', params.traceId);
  if (params.errorCode) target.searchParams.set('errorCode', params.errorCode);
  target.searchParams.set('paymentStatus', params.paymentStatus);
  target.searchParams.set('provider', params.provider);

  return `${target.pathname}${target.search}`;
}

function buildSuccessUrl(
  region: string,
  params: {
    orderId: string;
    orderNumber?: string;
    paymentId?: string;
    traceId?: string;
    provider: string;
  }
) {
  const basePath = `/${region.toLowerCase()}/checkout/success`;
  const target = new URL(basePath, 'https://castlery.local');

  target.searchParams.set('orderId', params.orderId);
  if (params.orderNumber) target.searchParams.set('orderNumber', params.orderNumber);
  if (params.paymentId) target.searchParams.set('paymentId', params.paymentId);
  if (params.traceId) target.searchParams.set('traceId', params.traceId);
  target.searchParams.set('provider', params.provider);

  return `${target.pathname}${target.search}`;
}

export default async function GrabPayCallbackPage({
  params,
  searchParams,
}: {
  params: { region: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const orderId = readParam(searchParams, ['orderId', 'orderID']);
  const orderNumber = readParam(searchParams, ['orderNumber', 'orderNo']);
  const paymentId = readParam(searchParams, ['paymentId']);
  const traceId = readParam(searchParams, ['traceId']);
  const grabTxID = readParam(searchParams, ['grabTxID', 'grabTxId', 'grab_tx_id']);
  const partnerTxID = readParam(searchParams, ['partnerTxID', 'partnerTxId', 'partner_tx_id']);

  reportTransactionMessage(
    {
      domain: TransactionDomain.PAYMENT,
      step: 'payment_callback_receive',
      traceId: traceId || undefined,
      orderId: orderId || undefined,
      orderNumber: orderNumber || undefined,
      paymentId: paymentId || undefined,
      provider: PaymentMethodProviderEnum.GRABPAY,
      result: TransactionResult.SUCCESS,
    },
    {
      message: 'transaction.payment.payment_callback_receive.grabpay',
      skipSentry: true,
    }
  );

  if (!orderId || !paymentId || !traceId) {
    redirect(
      buildPaymentUrl(params.region, {
        orderId: orderId || undefined,
        orderNumber: orderNumber || undefined,
        paymentStatus: 'failure',
        provider: PaymentMethodProviderEnum.GRABPAY,
        paymentId: paymentId || undefined,
        traceId: traceId || undefined,
        errorCode: 'INVALID_CALLBACK',
      })
    );
  }

  const service = new PaymentService(new PaymentStrategyFactory());
  const result = await service.capturePayment(
    {
      orderId,
      orderNumber,
      paymentId,
      provider: PaymentMethodProviderEnum.GRABPAY,
      grabPayData: grabTxID && partnerTxID ? { grabTxID, partnerTxID } : undefined,
      idempotencyKey: traceId,
    },
    traceId
  );

  if (result.success) {
    redirect(
      buildSuccessUrl(params.region, {
        orderId,
        orderNumber,
        paymentId,
        traceId,
        provider: PaymentMethodProviderEnum.GRABPAY,
      })
    );
  }

  redirect(
    buildPaymentUrl(params.region, {
      orderId,
      orderNumber,
      paymentStatus: result.error.code === 'processing' ? 'processing' : 'failure',
      provider: PaymentMethodProviderEnum.GRABPAY,
      paymentId,
      traceId,
      errorCode: result.error.code,
    })
  );
}
