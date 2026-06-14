'use client';

import { Stack, Typography } from '@castlery/fortress';
import { SummaryRow } from './summary-row';
import { ShippingZipcodeButton } from '@castlery/modules-cart-components';
import { CheckoutChangeZipcodeButton } from '@castlery/modules-checkout-components';

export interface ShippingItemProps {
  label: string;
  amount: string;
  showShippingZipcode: boolean;
  originAmount: string;
  showOriginAmount: boolean;
  inCheckout: boolean;
  loading?: boolean;
  forcePadding?: boolean;
  originAmountFirst?: boolean;
  actionDisabled?: boolean;
}
export function ShippingItem({
  label,
  amount,
  showShippingZipcode,
  originAmount,
  showOriginAmount,
  inCheckout,
  loading,
  forcePadding,
  originAmountFirst = false,
  actionDisabled = false,
}: ShippingItemProps) {
  return (
    <SummaryRow loading={loading} forcePadding={forcePadding}>
      <Typography level="body2">
        {label}{' '}
        {showShippingZipcode ? (
          inCheckout ? (
            <CheckoutChangeZipcodeButton disabled={actionDisabled} />
          ) : (
            <ShippingZipcodeButton disabled={actionDisabled} />
          )
        ) : null}
      </Typography>
      <Stack direction="row" spacing={1}>
        {showOriginAmount && originAmountFirst && (
          <Typography level="body2" sx={{ textDecoration: 'line-through' }}>
            {originAmount}
          </Typography>
        )}
        <Typography level="body2">{amount}</Typography>
        {showOriginAmount && !originAmountFirst && (
          <Typography level="body2" sx={{ textDecoration: 'line-through' }}>
            {originAmount}
          </Typography>
        )}
      </Stack>
    </SummaryRow>
  );
}
