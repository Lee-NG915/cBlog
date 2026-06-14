import React, { useCallback } from 'react';
import { Typography, Input, inputClasses } from '@castlery/fortress';
import { RowWrapper } from './row-wrapper';
import { EcEnv } from '@castlery/config';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

interface AmountInputProps {
  value: number | '';
  amountChange: (value: number) => void;
}

export const AmountInput = ({ value, amountChange }: AmountInputProps) => {
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      const regex = /^-?\d*(.\d{0,2})?$/;
      if (regex.test(value) && Number(value) >= 0) {
        amountChange(Number(value));
      }
    },
    [amountChange]
  );

  return (
    <RowWrapper>
      <Typography>Amount ({currencySymbol})</Typography>
      <Input
        type="number"
        sx={{
          paddingX: 2,
          paddingY: 1.5,
          fontSize: { xs: 'sm', sm: 'md' },
          color: (theme) => theme.palette.text.primary,
          [`&>.${inputClasses.input}`]: {
            color: (theme) => theme.palette.text.primary,
          },
        }}
        value={value}
        onChange={onChange}
      />
    </RowWrapper>
  );
};
export default AmountInput;
