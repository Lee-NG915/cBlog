import React, { useCallback } from 'react';
import { Checkbox, Stack, FormControl, FormHelperText, Typography, checkboxClasses } from '@castlery/fortress';

export interface CheckboxTermsProps {
  labelElement: string | React.ReactElement;
  helperTextElement?: string | React.ReactElement;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
  checked: boolean;
}
export function CheckboxTerms({
  checked,
  labelElement,
  helperTextElement,
  defaultChecked,
  onChange,
}: CheckboxTermsProps) {
  const changeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const status = event.target.checked;
      typeof onChange === 'function' && onChange(status);
    },
    [onChange]
  );
  return (
    <Stack
      spacing={2}
      sx={{
        p: 1,
        border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
        background: (theme) => (checked ? theme.palette.brand.terracotta[500] : 'white'),
      }}
    >
      <FormControl>
        <Checkbox
          variant="outlined"
          color="primary"
          defaultChecked={defaultChecked ?? false}
          value={checked?.toString()}
          onChange={changeHandler}
          label={
            <Stack sx={{ color: checked ? 'white' : 'auto' }}>
              {typeof labelElement === 'string' ? (
                <Typography level="body2" sx={{ color: 'inherit' }}>
                  {labelElement}
                </Typography>
              ) : (
                labelElement
              )}
            </Stack>
          }
          sx={{
            [`&>.${checkboxClasses.checkbox}`]: {
              mt: 0.5,
            },
          }}
        />
        <FormHelperText sx={{ mt: -0.5, color: checked ? 'white' : (theme) => theme.palette.brand.charcoal[500] }}>
          {typeof helperTextElement === 'string' ? (
            <Typography level="caption2" sx={{ color: 'inherit' }}>
              {helperTextElement}
            </Typography>
          ) : (
            helperTextElement
          )}
        </FormHelperText>
      </FormControl>
    </Stack>
  );
}

export default CheckboxTerms;
