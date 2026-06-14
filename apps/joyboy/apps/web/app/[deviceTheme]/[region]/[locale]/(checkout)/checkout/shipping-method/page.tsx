'use client';
import { useGetCheckoutInfoQuery } from '@castlery/modules-checkout-domain';
import { WebShippingMethod } from '@castlery/modules-composite-components';
import { CheckoutPermissionWrapper } from '@castlery/modules-checkout-components';

// export { generateMetadata } from './metedata';

export function ShippingMethodPageContent() {
  useGetCheckoutInfoQuery({ noCache: true, needsShippingMethod: true });

  return <WebShippingMethod />;
}

export default function ShippingMethodPage() {
  return (
    <CheckoutPermissionWrapper>
      <ShippingMethodPageContent />
    </CheckoutPermissionWrapper>
  );
}
