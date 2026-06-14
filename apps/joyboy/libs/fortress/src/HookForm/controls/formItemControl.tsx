'use client';
import React, { useState } from 'react';
// import { Box } from '../../index';
// import sx from './formItemControlSx';
import { FormControl, FormLabel } from '../../index';
import { FormHelperText } from '../../FormHelperText';
import { useController, useFormContext } from 'react-hook-form';
// import { Error } from '../../Icons';
import { FiledReturns } from '../types';

interface HookFormItemControlProps {
  data: Record<string, any>;
  customError?: (value: any) => { isError: boolean; message: string };
  children: (field: FiledReturns, isError: boolean) => JSX.Element | React.ReactNode;
}

const HookFormItemControl: React.FC<HookFormItemControlProps> = ({ data, children }) => {
  const { key, label, required = false, show } = data;
  const {
    field,
    formState: { errors },
  } = useController({ name: key });
  const [showThis, setShowThis] = useState(true);
  const { watch, unregister } = useFormContext();

  if (typeof show === 'function') {
    const values = watch();
    const status = show(values);
    if (status !== showThis) {
      setShowThis(status);
      !status && unregister(key);
    }
  }
  if (!showThis) return null;

  return (
    <FormControl required={required} error={!!errors[key]}>
      {!!label && <FormLabel>{label}</FormLabel>}
      {typeof children === 'function' && children(field, !!errors[key])}
      {!!errors[key]?.message && <FormHelperText>{errors[key]?.message?.toString()}</FormHelperText>}
    </FormControl>
  );
};

export default HookFormItemControl;
