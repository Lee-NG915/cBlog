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
import { CartItemInfo, LAYOUT_MODE } from '@castlery/modules-cart-components';
import { Suspense } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useGetPaymentDataSource } from '@castlery/shared-components';

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

export function WebPaymentSummary() {
  const { desktop } = useBreakpoints();
  const { lineItems, summary } = useGetPaymentDataSource();

  const lineItemList = (
    <Stack sx={{ py: 6 }} spacing={4}>
      {lineItems.map((lineItem) => (
        <Stack key={lineItem.id} spacing={4}>
          <CartItemInfo item={lineItem} {...cartItemProps} />
          <Divider />
        </Stack>
      ))}
    </Stack>
  );

  if (desktop) {
    return (
      <Box>
        <Typography level="h3">Order summary</Typography>
        {lineItemList}
        <WebOrderSummaryList summary={summary as any} inCheckout />
      </Box>
    );
  }

  return (
    <Accordion>
      <AccordionSummary sx={{ background: (theme) => theme.palette.brand.warmLinen[500], px: 4, py: 3 }}>
        <Typography level="h3">Order summary</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 4, background: (theme) => theme.palette.brand.warmLinen[500] }}>
        {lineItemList}
        <Suspense>
          <WebOrderSummaryList summary={summary as any} inCheckout />
        </Suspense>
      </AccordionDetails>
    </Accordion>
  );
}
