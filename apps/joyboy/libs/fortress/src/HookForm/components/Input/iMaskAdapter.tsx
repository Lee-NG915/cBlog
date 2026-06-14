'use client';
import { IMaskInput } from 'react-imask';
import React from 'react';

export interface CustomProps {
  name: string;
  onChange: (event: { target: { name: string; value: string } }) => void;
  imaskProps?: Record<string, any>;
}

/**
 * @see https://github.com/uNmAnNeR/imaskjs/tree/master
 */
export const TextMaskAdapter = React.forwardRef<HTMLInputElement, CustomProps>(function TextMaskAdapter(props, ref) {
  const { imaskProps = {}, onChange, ...other } = props;

  return (
    <IMaskInput
      {...imaskProps}
      {...other}
      inputRef={ref}
      onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});
TextMaskAdapter.displayName = 'TextMaskAdapter';
