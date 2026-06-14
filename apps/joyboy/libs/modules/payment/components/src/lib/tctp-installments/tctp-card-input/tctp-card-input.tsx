'use client';
import { Stack, Input, FormControl, FormHelperText } from '@castlery/fortress';
import { useState } from 'react';

export function TcTpCardInput({ onChange }: { onChange: (cardNumber: string) => void }) {
  const [cardNumber, setCardNumber] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  return (
    <Stack>
      <FormControl required error={!!inputError}>
        <Input
          id="2c2pCardNumber"
          name="2c2pCardNumber"
          aria-label="TcTp Card Number Input"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <FormHelperText>{inputError}</FormHelperText>
      </FormControl>
    </Stack>
  );
}

export default TcTpCardInput;

export type TcTpCardInputProps = Parameters<typeof TcTpCardInput>[0];
