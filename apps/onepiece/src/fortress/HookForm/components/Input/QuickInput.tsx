import React from 'react';
import { useForm, Validate } from 'react-hook-form';
import type { TFormValues } from '../../types';
import { Input, FormControl, FormLabel, FormHelperText } from 'fortress';

interface QuickInputProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
}
export type QuickInputHookProps = {
  name: string;
  validator?: Validate<any, TFormValues> | Record<string, Validate<any, TFormValues>> | undefined;
};
export const useQuickInput = (props: QuickInputHookProps) => {
  const { name, validator } = props;
  const { watch, register } = useForm({
    delayError: 200,
  });

  const value = watch(name);

  const QuickInput = ({ label, required = false, placeholder, defaultValue }: QuickInputProps) => {
    const mergeProps = {
      placeholder,
      defaultValue,
      ...register(name),
    };

    return (
      <FormControl required={required}>
        <FormLabel>{label}</FormLabel>
        <Input {...mergeProps} />
        <FormHelperText></FormHelperText>
      </FormControl>
    );
  };

  return [QuickInput, value];
};
