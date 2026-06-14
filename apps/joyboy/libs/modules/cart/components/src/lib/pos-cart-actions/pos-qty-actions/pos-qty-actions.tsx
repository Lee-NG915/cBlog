'use client';
import { useState } from 'react';
import { Stack, QuantitySelector } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useUpdateCartItemQtyMutation, selectCartQtyActionLoading } from '@castlery/modules-cart-domain';
import type { LineItemSchema, LineItemVariantSchema } from '@castlery/types';

export enum PosQtyActionsType {
  ADD = 'add',
  REDUCE = 'reduce',
}

export type PosQtyType = PosQtyActionsType;

export interface PosQtyActionsProps {
  item: {
    id: LineItemSchema['id'];
    quantity: LineItemSchema['quantity'];
    variant: {
      id: LineItemVariantSchema['id'];
      maxSaleQty: LineItemVariantSchema['maxSaleQty'];
      minSaleQty: LineItemVariantSchema['minSaleQty'];
      qtyIncrements: LineItemVariantSchema['qtyIncrements'];
    };
  };
  disabled?: boolean;
}

export function PosQtyActions({ disabled, item }: PosQtyActionsProps) {
  const { quantity, variant } = item;
  const qtyIncrements = variant?.qtyIncrements;
  const [qtyType, setQtyType] = useState<PosQtyActionsType | ''>('');

  const qtyActionLoading = useAppSelector(selectCartQtyActionLoading);
  const [updateCartItemQty] = useUpdateCartItemQtyMutation();

  const maxSaleQty = variant?.maxSaleQty ?? 9999;
  const minSaleQty = variant?.minSaleQty ?? 1;
  const safeQtyIncrements = qtyIncrements ?? 0;

  const selectorDisabled = disabled || safeQtyIncrements <= 0;

  const qtyActionHandler = async (value: number) => {
    if (safeQtyIncrements <= 0) {
      return;
    }
    const type = value < quantity ? PosQtyActionsType.REDUCE : PosQtyActionsType.ADD;
    setQtyType(type);
    const payload = {
      lineItemId: item.id,
      variantId: item.variant.id,
      quantity: value,
    };
    await updateCartItemQty(payload);
    setQtyType('');
  };

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }}>
      <QuantitySelector
        value={quantity}
        min={minSaleQty}
        max={maxSaleQty}
        step={safeQtyIncrements || 1}
        disabled={selectorDisabled}
        loading={qtyActionLoading && Boolean(qtyType)}
        onChange={qtyActionHandler}
      />
    </Stack>
  );
}

export default PosQtyActions;
