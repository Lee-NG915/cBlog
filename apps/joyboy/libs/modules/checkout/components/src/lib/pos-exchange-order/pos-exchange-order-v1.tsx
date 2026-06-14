'use client';
import React, { useCallback } from 'react';
import { Box, Typography, Input, Checkbox, Stack, inputClasses, FormHelperText } from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';

export interface PosExchangeOrderV1Props {
  name: string;
  checked: boolean;
  value: string;
  showRequiredError?: boolean;
  onCheckedChange: (checked: boolean) => void;
  onChange: (value: string) => void;
}

export function PosExchangeOrderV1({
  name,
  checked,
  value,
  showRequiredError = false,
  onCheckedChange,
  onChange,
}: PosExchangeOrderV1Props) {
  const handler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let nextValue = e.target.value;
      if (nextValue.length > 200) {
        nextValue = nextValue.slice(0, 200);
      }
      onChange(nextValue);
    },
    [onChange]
  );

  const handleCheck = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const status = event.target.checked;
      onCheckedChange(status);
    },
    [onCheckedChange]
  );

  return (
    <Box>
      <Box>
        <Checkbox
          checked={checked}
          onChange={handleCheck}
          label={
            !checked ? (
              <Typography level="body2">Exchange Order</Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  level={'body2'}
                  sx={{
                    lineHeight: 'normal',
                  }}
                >
                  Exchange Order
                </Typography>
                <FormHelperText
                  sx={{ lineHeight: 'normal', fontSize: '12px', color: 'var(--fortress-palette-brand-mono-700)' }}
                >
                  Castlery staff to create return DO after placing this exchange order
                </FormHelperText>
              </Box>
            )
          }
          sx={{
            alignItems: 'center',
            width: '100%',
            '& .form-helper-text-container': {
              position: 'unset',
            },
          }}
        />
      </Box>
      {checked && (
        <Stack spacing={1} onClick={(e) => e.stopPropagation()} sx={{ position: 'relative' }}>
          <Input
            name={name}
            value={value}
            placeholder="Add original order number"
            onChange={handler}
            required={true}
            error={showRequiredError}
          />
          {showRequiredError && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Error width={20} height={20} />
              <Typography level="caption1" sx={{ color: 'var(--fortress-palette-danger-500)' }}>
                This field cannot be empty
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default PosExchangeOrderV1;
