import React from 'react';
import { Input } from '../../../index';
import { CommonSliceComponentProps, InputOwnProps } from '../../types';
import { TextMaskAdapter } from './iMaskAdapter';

export type HookInputComponent = React.FC<CommonSliceComponentProps & InputOwnProps>;

const HookInput: HookInputComponent = ({ field, subType, placeholder, joyProps, imaskProps }) => {
  const adapter = imaskProps ? { input: { component: TextMaskAdapter, imaskProps: imaskProps || {} } } : {};

  return (
    <Input
      // @ts-ignore
      variant="borderplain"
      type={subType}
      placeholder={placeholder}
      {...field}
      value={field.value ?? ''}
      {...joyProps}
      slotProps={{ ...adapter, ...(joyProps?.slotProps || {}) }}
    />
  );
};

export default HookInput;
