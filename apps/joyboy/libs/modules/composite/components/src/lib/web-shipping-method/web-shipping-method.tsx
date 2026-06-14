'use client';
import { Box, Divider, useBreakpoints } from '@castlery/fortress';
import { WebCheckoutStepBar } from '@castlery/modules-checkout-components';
import { selectFetchCheckoutDataLoading } from '@castlery/modules-checkout-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { CheckoutShippingMethod } from '../checkout-shipping-method/checkout-shipping-method';
import { WebCheckoutSummary } from '../web-checkout-summary/web-checkout-summary';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useHasOrderCreated } from '@castlery/shared-components';

export const WebShippingMethod = () => {
  const { desktop, mobile } = useBreakpoints();
  const fetchDataLoading = useAppSelector(selectFetchCheckoutDataLoading);
  const hasOrderCreated = useHasOrderCreated();

  if (desktop) {
    return (
      <>
        <Box>
          <WebCheckoutStepBar loading={fetchDataLoading} isOrderCreated={hasOrderCreated} />
          <CheckoutShippingMethod />
        </Box>
        <Divider orientation="vertical" />
        <WebCheckoutSummary />
      </>
    );
  }
  return (
    <Box>
      <WebCheckoutStepBar loading={fetchDataLoading} isOrderCreated={hasOrderCreated} />
      <Box sx={{ mt: 6 }}>
        <WebCheckoutSummary />
      </Box>
      <Box sx={{ mt: mobile ? 4 : 5 }}>
        <CheckoutShippingMethod />
      </Box>
    </Box>
  );
};
