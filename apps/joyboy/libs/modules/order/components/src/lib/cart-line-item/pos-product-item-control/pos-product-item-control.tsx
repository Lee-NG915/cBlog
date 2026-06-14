'use client';

import { useCallback, useMemo } from 'react';
import { Stack } from '@castlery/fortress';
import type { LineItem, AdjustmentType, AddonServiceLineItem } from '@castlery/modules-order-domain';
import { PosQtyEditor, type PosQtyType } from '../../pos-qty-editor/pos-qty-editor';
import { PosDiscountEditor } from '../../pos-discount-editor/pos-discount-editor';
import { PosOverwritePriceEditor } from '../../pos-overwrite-price-editor/pos-overwrite-price-editor';

export interface PosProductItemControlProps {
  item: Partial<LineItem & AddonServiceLineItem>;
  changeQty: (type: PosQtyType, itemId: number) => Promise<void>;
  setDiscount: (payload: {
    type: keyof typeof AdjustmentType;
    adjustment: number;
    lineItemId: number;
  }) => Promise<void>;
}
export function PosProductItemControl({ item, changeQty, setDiscount }: PosProductItemControlProps) {
  const { id, product_type, quantity = 0, amount = '0', manual_discount_total = '0' } = item;

  const isServiceItem = useMemo(() => product_type && ['service'].includes(product_type), [product_type]);

  const handleChangeQty = useCallback(
    async (type: PosQtyType) => {
      if (isServiceItem || !id) return Promise.resolve();
      await changeQty(type, id);
    },
    [changeQty, isServiceItem, id]
  );
  if (!item || !item.id || !id) return null;

  return (
    <>
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginY: 0.5,
          gap: 1,
        }}
      >
        {isServiceItem ? (
          <PosOverwritePriceEditor amount={amount} itemId={item.id} />
        ) : (
          <>
            <PosQtyEditor quantity={quantity} changeQty={handleChangeQty} />
            <PosDiscountEditor
              amount={amount}
              discount={manual_discount_total}
              discountFn={(type, discount) => setDiscount({ type, adjustment: -1 * discount, lineItemId: id })}
            />
          </>
        )}
      </Stack>
    </>
  );
}

export default PosProductItemControl;
