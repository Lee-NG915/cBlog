'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { basePageConfig } from '@castlery/config';

export type CheckoutPageContext = {
  finalOrderId: string | undefined;
  isOnAddressPage: boolean;
  isOnPaymentPage: boolean;
  isOnPaymentCallbackPage: boolean;
};

export const useCheckoutPageContext = (orderId?: string): CheckoutPageContext => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const orderIdInSearchParams = searchParams.get('orderId');
  const finalOrderId = orderIdInSearchParams || orderId;

  return {
    finalOrderId,
    isOnAddressPage: !!pathname?.includes(basePageConfig['checkout-shipping-address']),
    isOnPaymentPage: !!pathname?.includes(basePageConfig['checkout-payment']),
    isOnPaymentCallbackPage: !!pathname?.includes(basePageConfig['checkout-payment-callback']),
  };
};
