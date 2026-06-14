'use client';
import { Button } from '@castlery/fortress';
import { Remove, Add } from '@castlery/fortress/Icons';

export enum QtyType {
  ADD = 'add',
  REDUCE = 'reduce',
}

export interface CartQtyButtonProps {
  loading: boolean;
  type: QtyType;
  handler: (type: QtyType) => void;
  disabled?: boolean;
}

export function CartQtyButton({ type, disabled = false, loading, handler }: CartQtyButtonProps) {
  return (
    <Button
      aria-label={type === QtyType.ADD ? 'cart-qty-button:increase' : 'cart-qty-button:reduce'}
      variant="secondary"
      color="neutral"
      sx={{ padding: 0, height: 24, minHeight: 24 }}
      disabled={disabled}
      loading={loading}
      onClick={() => handler(type)}
    >
      {type === QtyType.ADD ? <Add sx={{ width: 24, height: 24 }} /> : <Remove sx={{ width: 24, height: 24 }} />}
    </Button>
  );
}

export default CartQtyButton;
