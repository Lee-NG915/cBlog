'use client';
import React, { useCallback, useState, useEffect } from 'react';
import { Card, Typography, Input, Checkbox, Stack, inputClasses } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';

export interface PosExchangeOrderProps {
  name: string;
  onChange: (value: string) => void;
}

export function PosExchangeOrder({ name, onChange }: PosExchangeOrderProps) {
  // @ts-ignore
  const defaultExchangeOrder = useAppSelector((state) => state.checkout?.[name]);
  const [checked, setChecked] = useState<boolean>(false);

  const handler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (value.length > 200) {
        value = value.slice(0, 200);
      }
      onChange(value);
    },
    [onChange]
  );

  const handleCheck = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const status = event.target.checked;
      setChecked(status);
    },
    [setChecked]
  );

  useEffect(() => {
    defaultExchangeOrder && setChecked(defaultExchangeOrder);
    return () => {};
  }, [defaultExchangeOrder, setChecked]);

  return (
    <Card>
      <Checkbox
        checked={checked}
        onChange={handleCheck}
        label={<Typography level="subh1">Exchange Order</Typography>}
        sx={{ alignItems: 'center' }}
      />
      {checked && (
        <Stack spacing={1} onClick={(e) => e.stopPropagation()}>
          <Typography level="body2">Castlery staff to create return DO after placing this exchange order.</Typography>
          <Input
            name={name}
            value={defaultExchangeOrder}
            placeholder="Add original order number"
            onChange={handler}
            sx={{
              [`&>.${inputClasses.input}`]: {
                color: (theme) => theme.palette.text.primary,
              },
            }}
          />
        </Stack>
      )}
    </Card>
  );
}

export default PosExchangeOrder;
