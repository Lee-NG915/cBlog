'use client';
import { Stack } from '@castlery/fortress';
import { PosQtyActions } from '../pos-qty-actions/pos-qty-actions';
import { PosDiscountEditor } from '../../pos-discount-editor/pos-discount-editor';
import { PosOverwritePriceEditor } from '../../pos-overwrite-price-editor/pos-overwrite-price-editor';
import { type LineItemSchema, type AddOnServiceLineItemSchema } from '@castlery/types';
import { ProductTypeMapping } from '@castlery/config';
import { PosWarrantyItem } from '../../pos-warranty-item/pos-warranty-item';

export interface PosItemActionsProps {
  item: LineItemSchema | AddOnServiceLineItemSchema;
  showWarrantyItem: boolean;
}
export function PosItemActions({ item, showWarrantyItem }: PosItemActionsProps) {
  const { id, productType, salePrice = '0', manualDiscountTotal = '0' } = item;
  const isServiceItem = productType === ProductTypeMapping.SERVICE;
  if (!id) return null;

  return (
    <Stack
      sx={{
        marginY: 0.5,
        gap: 1,
      }}
    >
      {isServiceItem ? (
        <PosOverwritePriceEditor amount={salePrice} lineItemId={id} />
      ) : (
        <>
          <PosDiscountEditor item={item as LineItemSchema} discount={manualDiscountTotal} />
          {showWarrantyItem && <PosWarrantyItem item={item as LineItemSchema} isExpanded />}
          <PosQtyActions item={item as LineItemSchema} />
        </>
      )}
    </Stack>
  );
}

export default PosItemActions;
