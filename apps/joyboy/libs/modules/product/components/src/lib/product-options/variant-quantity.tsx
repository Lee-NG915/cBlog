import { changeVariantQuantity, selectProduct } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { QuantitySelector } from '@castlery/fortress';
import { useMount } from 'react-use';
import { refreshLeadtimeCommand } from '@castlery/modules-product-services';
/* eslint-disable-next-line */
export interface VariantQuantityProps {
  disabled?: boolean;
  currentVariantId?: number;
}

export function VariantQuantity({ disabled, currentVariantId: _currentVariantId }: VariantQuantityProps) {
  const dispatch = useAppDispatch();
  const currentProduct = useAppSelector(selectProduct);
  const defaultValue = currentProduct?.min_sale_qty || 1;

  useMount(() => {
    dispatch(changeVariantQuantity(defaultValue));
  });

  return (
    <QuantitySelector
      step={currentProduct?.qty_increments || 1}
      defaultValue={defaultValue}
      min={defaultValue}
      max={99}
      disabled={disabled}
      onChange={(value) => {
        if (!value) return;
        dispatch(changeVariantQuantity(value));
        dispatch(refreshLeadtimeCommand({})).unwrap();
      }}
    />
  );
}
