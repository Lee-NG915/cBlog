'use client';
import { WebShippingAddress } from '@castlery/modules-composite-components';
import { useLazyGetCheckoutInfoQuery, useLazyGetCheckoutAddressListQuery } from '@castlery/modules-checkout-domain';
import { useCallback, useEffect, useRef } from 'react';
import { CheckoutPermissionWrapper } from '@castlery/modules-checkout-components';

// export { generateMetadata } from './metedata';

export function ShippingAddressPageContent() {
  const fetchedRef = useRef(false);
  const [getCheckoutInfoTrigger] = useLazyGetCheckoutInfoQuery();
  const [getCheckoutAddressListTrigger] = useLazyGetCheckoutAddressListQuery();

  const fetchCheckoutData = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    await Promise.all([getCheckoutInfoTrigger({ noCache: true }), getCheckoutAddressListTrigger()]);
  }, [getCheckoutAddressListTrigger, getCheckoutInfoTrigger]);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  return <WebShippingAddress />;
}

export default function ShippingAddressPage() {
  return (
    <CheckoutPermissionWrapper>
      <ShippingAddressPageContent />
    </CheckoutPermissionWrapper>
  );
}
