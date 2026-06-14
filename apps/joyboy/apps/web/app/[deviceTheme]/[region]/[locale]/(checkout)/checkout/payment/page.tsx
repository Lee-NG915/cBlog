import { CheckoutPermissionWrapper } from '@castlery/modules-checkout-components';
import { PaymentPageContent } from './page.client';

export type PaymentResumeSearchParams = {
  orderId?: string;
  orderNumber?: string;
  paymentStatus?: 'failure' | 'processing';
  provider?: string;
  paymentId?: string;
  traceId?: string;
  errorCode?: string;
};

export default function PaymentPage({ searchParams }: { searchParams: PaymentResumeSearchParams }) {
  return (
    <CheckoutPermissionWrapper orderId={searchParams.orderId}>
      <PaymentPageContent orderId={searchParams.orderId} resumeParams={searchParams} />
    </CheckoutPermissionWrapper>
  );
}
