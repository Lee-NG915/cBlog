'use client';
import { useRouter } from 'next/navigation';
import { basePageConfig, EcEnv } from '@castlery/config';
import { useGetTransactionOrderDetailByIdQuery } from '@castlery/modules-order-domain';
import {
  CheckoutSuccessContent,
  CheckoutSuccessLoading,
  OrderCanceledNotice,
  useCheckoutSuccessParams,
  usePurchaseTracking,
} from '@castlery/modules-checkout-components';

const orderHistoryPath = `/${EcEnv.NEXT_PUBLIC_COUNTRY}`.toLowerCase() + basePageConfig['orders'];

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { orderId, token } = useCheckoutSuccessParams();

  const queryArg = token ? { id: orderId, token } : orderId;
  const { isLoading, data: order } = useGetTransactionOrderDetailByIdQuery(queryArg, { skip: !queryArg });

  const isCompletedPayment = order?.paymentStatus === 'PAYMENT_STATUS_PAID' || Number(order?.summary?.total) === 0;

  usePurchaseTracking({ order, isOrderLoading: isLoading, isCompletedPayment });

  if (isLoading) return <CheckoutSuccessLoading />;

  if (!isCompletedPayment) {
    if (token) return <OrderCanceledNotice />;
    router.replace(orderHistoryPath);
    return null;
  }

  return <CheckoutSuccessContent order={order!} orderId={orderId} />;
}
