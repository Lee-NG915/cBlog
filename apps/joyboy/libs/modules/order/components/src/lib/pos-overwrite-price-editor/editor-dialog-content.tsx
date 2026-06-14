'use client';

import { useState } from 'react';
import { KeyBoards, CalculatorKeyBoards } from '../calculator-key-boards/calculator-key-boards';
import { Stack, Button, Typography } from '@castlery/fortress';
import { DynamicDialogContent } from '@castlery/shared-fortress-client';
import { useAsyncFn } from 'react-use';
import { EcEnv } from '@castlery/config';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

export interface EditorDialogContentProps {
  defaultAmount: string;
  overwritePrice: (price: string) => Promise<void>;
  afterSet?: () => void;
}

export function EditorDialogContent({ defaultAmount, overwritePrice, afterSet }: EditorDialogContentProps) {
  const [value, setValue] = useState(defaultAmount || '');
  const [hasManualInput, setHasManualInput] = useState(false);

  const keyChange = (key: keyof typeof KeyBoards) => {
    const letter = KeyBoards[key];
    const keyValue = KeyBoards[key];
    let str = hasManualInput ? value : '';

    if (keyValue === KeyBoards.key_dot) {
      str = str.includes('.') ? str : str + '.';
      setValue(str);
      setHasManualInput(true);
      return;
    }
    if (keyValue === KeyBoards.key_reset) {
      str = str?.substring(0, str.length - 1);
      setValue(str);
      setHasManualInput(true);
      return;
    }
    str = str + letter;
    setValue(str);
    setHasManualInput(true);
  };

  const [loadingState, setHandler] = useAsyncFn(async () => {
    return overwritePrice(value).then(() => {
      afterSet && afterSet();
    });
  }, [value, overwritePrice, afterSet]);

  return (
    <DynamicDialogContent sx={{ gap: 0, p: 0 }}>
      <Typography
        sx={{
          width: '100%',
          height: 60,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          paddingX: 2,
          paddingY: 0.5,
          textAlign: 'center',
          fontSize: '45px',
          lineHeight: 1.5,
        }}
      >
        {currencySymbol}
        {value}
      </Typography>
      <CalculatorKeyBoards onChange={keyChange} />
      <Stack>
        <Button disabled={!value} loading={loadingState.loading} onClick={setHandler}>
          Set
        </Button>
      </Stack>
    </DynamicDialogContent>
  );
}
