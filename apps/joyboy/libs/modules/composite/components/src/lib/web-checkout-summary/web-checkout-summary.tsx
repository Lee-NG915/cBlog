'use client';
import {
  Box,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  useBreakpoints,
} from '@castlery/fortress';

import { WebOrderSummaryList } from '../web-order-summary-list/web-order-summary-list';
import { useAppSelector } from '@castlery/shared-redux-store';
import {
  selectCheckoutSummary,
  selectCheckoutLineItems,
  selectCheckoutLoading,
  selectCheckoutGiftLineItems,
  selectFetchCheckoutDataLoading,
} from '@castlery/modules-checkout-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { BackdropLoading } from '@castlery/shared-components';
import { CartItemInfo, LAYOUT_MODE } from '@castlery/modules-cart-components';
import { CheckoutSummaryLineItemSkeleton } from './checkout-summary-line-item-skeleton';
import { CheckoutSummarySkeleton } from './checkout-summary-skeleton';

const cartItemProps = {
  layoutMode: LAYOUT_MODE.SUMMARY,
  showReviews: false,
  showWarranty: true,
  showCustomized: true,
  showLeadTime: false,
  showLLTTag: false,
  showO2OTag: false,
  supportChooseWarranty: false,
  showCartActionSection: false,
};

const giftItemProps = {
  layoutMode: LAYOUT_MODE.SUMMARY,
  showReviews: false,
  showWarranty: false,
  showCustomized: false,
  showLeadTime: false,
  showLLTTag: false,
  showO2OTag: false,
  supportChooseWarranty: false,
  showCartActionSection: false,
};

export function WebCheckoutSummary({ inEstimatedShippingStep = false }: { inEstimatedShippingStep?: boolean }) {
  const { desktop, mobile } = useBreakpoints();
  const summary = useAppSelector(selectCheckoutSummary);
  const lineItems = useAppSelector(selectCheckoutLineItems);
  const giftLineItems = useAppSelector(selectCheckoutGiftLineItems);
  const loading = useAppSelector(selectCheckoutLoading);
  const fetchCheckoutDataLoading = useAppSelector(selectFetchCheckoutDataLoading);
  const showBackdropLoading = fetchCheckoutDataLoading;

  const hasNoItems = lineItems.length === 0 && giftLineItems.length === 0;
  const showItemSkeleton = showBackdropLoading && hasNoItems;
  const showSummarySkeleton = showBackdropLoading && !summary;
  const showSummaryBackdrop = fetchCheckoutDataLoading && !!summary;

  const lineItemList = (
    <Stack sx={{ py: 6 }} spacing={4}>
      {lineItems.map((lineItem) => (
        <Stack key={lineItem.id} spacing={4}>
          <CartItemInfo item={lineItem} {...cartItemProps} />
          <Divider />
        </Stack>
      ))}
      {giftLineItems.map((lineItem) => (
        <Stack key={lineItem.id} spacing={4}>
          <CartItemInfo item={lineItem} {...giftItemProps} />
          <Divider />
        </Stack>
      ))}
    </Stack>
  );

  const summarySection = showSummarySkeleton ? (
    <CheckoutSummarySkeleton />
  ) : (
    <Box sx={{ position: 'relative' }}>
      <BackdropLoading loading={showSummaryBackdrop} />
      <WebOrderSummaryList
        summary={summary as any}
        inCheckout
        inEstimatedShippingStep={inEstimatedShippingStep}
        loading={loading}
      />
    </Box>
  );

  if (desktop) {
    return (
      <Box>
        <Typography level="h3">Order summary</Typography>
        {showItemSkeleton ? <CheckoutSummaryLineItemSkeleton /> : lineItemList}
        {summarySection}
      </Box>
    );
  }

  return (
    <Accordion>
      <AccordionSummary sx={{ background: (theme) => theme.palette.brand.warmLinen[500], px: 4, py: mobile ? 3 : 7 }}>
        <Typography level={mobile ? 'h5' : 'h4'}>Order summary</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 4, background: (theme) => theme.palette.brand.warmLinen[500] }}>
        {showItemSkeleton ? <CheckoutSummaryLineItemSkeleton /> : lineItemList}
        {summarySection}
      </AccordionDetails>
    </Accordion>
  );
}

export default WebCheckoutSummary;
