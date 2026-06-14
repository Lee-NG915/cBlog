'use client';
import { memo } from 'react';
import { IconButton } from '@castlery/fortress';
import { Delete } from '@castlery/fortress/Icons';
import { useAsyncFn } from 'react-use';

export interface DeleteItemButtonProps {
  disabled?: boolean;
  handler: () => Promise<void>;
}
export const DeleteItemButton = memo(({ disabled = false, handler }: DeleteItemButtonProps) => {
  const [state, removeFn] = useAsyncFn(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      return await handler();
    },
    [handler]
  );

  return (
    <IconButton
      loading={state.loading}
      disabled={disabled}
      onClick={removeFn}
      sx={{ p: 0, minWidth: 24, minHeight: 24 }}
    >
      <Delete color="danger" />
    </IconButton>
  );
});

export default DeleteItemButton;
