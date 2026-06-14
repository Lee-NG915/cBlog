'use client';

import { Button } from '@castlery/fortress';
import throttle from 'lodash.throttle';
import { useEffect, useMemo } from 'react';

export interface PlaceOrderButtonProps {
  /** Translated label, e.g. "Place your order" / "Place Your Order" */
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  /** Optional data attribute for E2E / selenium */
  'data-selenium'?: string;
}

/**
 * Shared "Place Order" button used in:
 * - Payment flow (Stripe card submit in PaymentSubmitSection)
 * - Checkout flow (zero-total order in WebCheckoutContinueButton)
 */
export function PlaceOrderButton({
  label,
  disabled = false,
  loading = false,
  onClick,
  'data-selenium': dataSelenium,
}: PlaceOrderButtonProps) {
  const handleClick = useMemo(() => throttle(onClick, 1000, { trailing: false }), [onClick]);

  useEffect(() => () => handleClick.cancel(), [handleClick]);

  return (
    <Button
      disabled={disabled}
      loading={loading}
      onClick={handleClick}
      data-selenium={dataSelenium}
      sx={{ minWidth: 154 }}
    >
      {label}
    </Button>
  );
}
