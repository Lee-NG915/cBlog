'use client';
import { Stack, QuantitySelector } from '@castlery/fortress';
import { selectCartQtyActionLoading } from '@castlery/modules-cart-domain';
import { updateCartQtyCommand } from '@castlery/modules-cart-services';
import type { LineItemSchema } from '@castlery/types';
import { ProductTypeMapping } from '@castlery/config';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useState, useEffect } from 'react';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';

interface WebQtyActionsProps {
  item: LineItemSchema;
}
export function WebQtyActions({ item }: WebQtyActionsProps) {
  const [isActiveItem, setIsActiveItem] = useState<string | undefined>(undefined);
  const isLoading = useAppSelector(selectCartQtyActionLoading);
  const dispatch = useAppDispatch();
  const { id: lineItemId, variant, quantity } = item;
  const isSwatch = item.productType === ProductTypeMapping.SWATCH;

  useEffect(() => {
    setIsActiveItem(undefined);
  }, [item]);

  const handleChange = async (value: number) => {
    setIsActiveItem(lineItemId);
    await dispatch(updateCartQtyCommand({ lineItem: item, quantity: value }));
  };
  const loading = isActiveItem === lineItemId && isLoading;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', columnGap: 2 }}>
      <QuantitySelector
        loading={loading}
        value={quantity}
        min={variant.minSaleQty}
        max={variant.maxSaleQty}
        step={variant.qtyIncrements}
        disabled={isSwatch || loading}
        onChange={handleChange}
        minusDataSeleniumId={DATA_SELENIUM_ID_MAP.CART_ITEM_MINUS}
        plusDataSeleniumId={DATA_SELENIUM_ID_MAP.CART_ITEM_PLUS}
      />
    </Stack>
  );
}

export default WebQtyActions;
