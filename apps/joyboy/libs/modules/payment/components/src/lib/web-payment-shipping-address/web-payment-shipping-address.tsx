'use client';

import { memo } from 'react';
import { ShippingAddressCard } from '@castlery/shared-components';
import { CustomerAddressEntity_V2 } from '@castlery/types';

export interface WebPaymentShippingAddressProps {
  /**
   * Shipping address to display
   */
  address?: CustomerAddressEntity_V2 | null;
  /**
   * Whether to show loading skeleton
   */
  isLoading?: boolean;
}

function WebPaymentShippingAddressComponent({ address, isLoading = false }: WebPaymentShippingAddressProps) {
  return <ShippingAddressCard title="Shipping Address" address={address} isLoading={isLoading} />;
}

export const WebPaymentShippingAddress = memo(WebPaymentShippingAddressComponent);
