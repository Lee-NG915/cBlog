import { forwardRef } from 'react';
import { Button } from '@castlery/fortress';

interface CustomInputProps {
  onClick?: () => void;
  handler: () => void;
}

export const CustomInput = forwardRef(({ onClick, handler }: CustomInputProps, ref) => (
  <Button
    variant="tertiary"
    onClick={() => {
      handler();
      onClick && onClick();
    }}
    sx={{ p: 0, minHeight: 'auto', minWidth: 'auto', width: 115 }}
  >
    Change Dates
  </Button>
));

export default CustomInput;
