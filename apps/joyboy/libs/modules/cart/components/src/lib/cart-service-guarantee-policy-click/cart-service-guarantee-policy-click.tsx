'use client';

import { ServiceGurantee } from '@castlery/shared-components';
import {
  cartServiceGuaranteePolicyClickedEvent,
  type CartServiceGuaranteePolicyPosition,
} from '@castlery/modules-cart-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useCallback } from 'react';

export interface CartServiceGuaranteePolicyClickProps {
  position: CartServiceGuaranteePolicyPosition;
}

export function CartServiceGuaranteePolicyClick({ position }: CartServiceGuaranteePolicyClickProps) {
  const dispatch = useAppDispatch();

  const handlePolicyLinkClick = useCallback(
    (label: string) => {
      dispatch(cartServiceGuaranteePolicyClickedEvent({ label, position }));
    },
    [dispatch, position]
  );

  return <ServiceGurantee onPolicyLinkClick={handlePolicyLinkClick} />;
}
