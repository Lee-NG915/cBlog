'use client';
import { Button } from '@castlery/fortress';
import { Remove, Add } from '@castlery/fortress/Icons';

export enum QtyActionType {
  ADD = 'add',
  REDUCE = 'reduce',
}

export interface CartQtyActionsProps {
  loading: boolean;
  type: QtyActionType;
  handler: (type: QtyActionType) => void;
  disabled?: boolean;
}

export function CartQtyActions({ type, disabled = false, loading, handler }: CartQtyActionsProps) {
  const isAdd = type === QtyActionType.ADD;
  const ariaLabel = isAdd ? 'cart-qty-button:increase' : 'cart-qty-button:reduce';

  return (
    <Button
      aria-label={ariaLabel}
      variant="secondary"
      color="neutral"
      sx={{ padding: 0, height: 24, minHeight: 24 }}
      disabled={disabled}
      loading={loading}
      onClick={() => handler(type)}
    >
      {isAdd ? <Add sx={{ width: 24, height: 24 }} /> : <Remove sx={{ width: 24, height: 24 }} />}
    </Button>
  );
}

export default CartQtyActions;
