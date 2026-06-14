'use client';

import { Box } from '@castlery/fortress';
import { ServiceGurantee } from '@castlery/shared-components';
import {
  cartServiceGuaranteeImpressionEvent,
  cartServiceGuaranteePolicyClickedEvent,
  type CartServiceGuaranteePosition,
} from '@castlery/modules-cart-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useFirstInViewWithDelay } from '@castlery/modules-tracking-components';
import { useCallback } from 'react';

const IMPRESSION_DWELL_MS = 1000;

export interface CartServiceGuaranteeImpressionProps {
  position: CartServiceGuaranteePosition;
}

/**
 * Cart-side wrapper around the shared `<ServiceGurantee />` section. Reports a
 * GA `view_service_guarantee` impression once per mount when the section stays
 * in view for ≥1s. `position` distinguishes the cart surface and is forwarded
 * verbatim to the listener / GA payload.
 */
export function CartServiceGuaranteeImpression({ position }: CartServiceGuaranteeImpressionProps) {
  const dispatch = useAppDispatch();

  const handleImpression = useCallback(() => {
    dispatch(cartServiceGuaranteeImpressionEvent({ position }));
  }, [dispatch, position]);

  const handlePolicyLinkClick = useCallback(
    (label: string) => {
      dispatch(cartServiceGuaranteePolicyClickedEvent({ label, position }));
    },
    [dispatch, position]
  );

  const ref = useFirstInViewWithDelay(handleImpression, IMPRESSION_DWELL_MS);

  return (
    <Box ref={ref}>
      <ServiceGurantee onPolicyLinkClick={handlePolicyLinkClick} />
    </Box>
  );
}
