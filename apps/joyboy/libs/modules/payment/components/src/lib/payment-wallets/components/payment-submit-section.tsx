import { ReactNode } from 'react';
import { Stack, Typography, Button } from '@castlery/fortress';
import { PlaceOrderButton, CustomLink } from '@castlery/shared-components';

export interface PaymentSubmitSectionProps {
  isLoading: boolean;
  isDisabled: boolean;
  /**
   * Controls visibility of the custom submit button (Stripe Online).
   * The button is ALWAYS in the DOM — this flag only toggles display so that
   * layout shift is avoided when switching between payment methods.
   */
  showSubmitButton: boolean;
  isOrderCreatedProp: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  /**
   * Slot for the express checkout element (Apple Pay / Google Pay / Link).
   * ALWAYS rendered in the DOM so that the Stripe SDK can probe for available
   * express payment methods in the background.
   * Visibility of the button inside the slot is controlled by the container layer.
   */
  expressSlot?: ReactNode;
  /**
   * Slot for SDK popup payment buttons (PayPal / Affirm).
   * Conditionally rendered — only mounted when a SDK popup provider is selected,
   * because these SDKs do not require background availability probing.
   */
  sdkSlot?: ReactNode;
  /** Inline validation / payment error shown directly below the submit area. */
  inlineError?: string;
}

export function PaymentSubmitSection({
  isLoading,
  isDisabled,
  showSubmitButton,
  onSubmit,
  submitLabel,
  expressSlot,
  sdkSlot,
  inlineError,
  isOrderCreatedProp,
}: PaymentSubmitSectionProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={4}>
      <Button
        disabled={isOrderCreatedProp}
        variant="outlined"
        linkKey={'checkout-shipping-method'}
        component={CustomLink}
        sx={{ minWidth: 154 }}
      >
        Back
      </Button>
      <Stack direction="column" justifyContent="flex-end" alignItems="flex-end" gap={2}>
        {/* Express checkout slot — always in DOM, visibility controlled by container */}
        {expressSlot}

        {/* SDK popup slot (PayPal / Affirm) — conditionally rendered */}
        {sdkSlot}

        {/* Custom submit button — always in DOM, display toggled by showSubmitButton */}
        <Stack sx={{ display: showSubmitButton ? 'block' : 'none' }}>
          {onSubmit && submitLabel && (
            <PlaceOrderButton label={submitLabel} disabled={isDisabled} loading={isLoading} onClick={onSubmit} />
          )}
        </Stack>

        {inlineError && (
          <Typography level="caption1" color="danger" role="alert">
            {inlineError}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
