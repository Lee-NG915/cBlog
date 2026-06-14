import React, { memo } from 'react';
import { Button } from '@castlery/fortress';
import { Plus } from '@castlery/fortress/Icons';

export interface AddButtonProps {
  disabled?: boolean;
  handler: () => void;
  children: React.ReactNode;
}

export const AddButton = memo(({ disabled = false, handler, children }: AddButtonProps) => {
  return (
    <Button variant="secondary" color="neutral" disabled={disabled} startDecorator={<Plus />} onClick={handler}>
      {children}
    </Button>
  );
});

export default AddButton;
