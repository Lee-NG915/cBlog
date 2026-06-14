import React, { useState } from 'react';
import { Box } from 'fortress';
import sx from './formItemControlSx';
import { FormControl, FormLabel, FormHelperText } from '../index';
import { useController, useFormContext } from 'react-hook-form';
import { Error } from 'fortress/Icons';

interface HookFormItemControlProps {
  data: Record<string, any>;
  customError?: (value: any) => { isError: boolean; message: string };
  children: React.ReactNode;
}

const HookFormItemControl: React.FC<HookFormItemControlProps> = ({ data, children }) => {
  const { key, label, required = false, show } = data;
  const {
    field,
    formState: { errors },
  } = useController({ name: key });
  const [showThis, setShowThis] = useState(true);

  if (typeof show === 'function') {
    const { watch, unregister } = useFormContext();
    const values = watch();
    const status = show(values);
    if (status !== showThis) {
      setShowThis(status);
      !status && unregister(key);
    }
  }

  return (
    <>
      {showThis ? (
        <FormControl required={required} error={!!errors[key]}>
          {!!label && <FormLabel sx={sx.label}>{label}</FormLabel>}
          {typeof children === 'function' && children(field, !!errors[key])}
          {!!errors[key]?.message && (
            <Box sx={sx.helperRow}>
              <Error sx={sx.errorIcon} />
              <FormHelperText sx={sx.helperText}>{errors[key]?.message}</FormHelperText>
            </Box>
          )}
        </FormControl>
      ) : null}
    </>
  );
};
export default HookFormItemControl;
