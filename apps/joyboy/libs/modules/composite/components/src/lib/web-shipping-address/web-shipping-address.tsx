'use client';
import { Box, Divider, useBreakpoints } from '@castlery/fortress';
import { WebCheckoutStepBar } from '@castlery/modules-checkout-components';
import { selectFetchCheckoutDataLoading } from '@castlery/modules-checkout-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { CheckoutAddressContent } from '../checkout-address-content/checkout-address-content';
import { WebCheckoutSummary } from '../web-checkout-summary/web-checkout-summary';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useHasOrderCreated } from '@castlery/shared-components';

export function WebShippingAddress() {
  const { desktop, mobile } = useBreakpoints();
  const fetchDataLoading = useAppSelector(selectFetchCheckoutDataLoading);
  const hasOrderCreated = useHasOrderCreated();

  if (desktop) {
    return (
      <>
        <Box>
          <WebCheckoutStepBar loading={fetchDataLoading} isOrderCreated={hasOrderCreated} />
          <CheckoutAddressContent />
        </Box>
        <Divider orientation="vertical" />
        <WebCheckoutSummary inEstimatedShippingStep />
      </>
    );
  }
  return (
    <Box>
      <WebCheckoutStepBar loading={fetchDataLoading} isOrderCreated={hasOrderCreated} />
      <Box sx={{ mt: 6 }}>
        <WebCheckoutSummary inEstimatedShippingStep />
      </Box>
      <Box sx={{ mt: mobile ? 4 : 5 }}>
        <CheckoutAddressContent />
      </Box>
    </Box>
  );
}
