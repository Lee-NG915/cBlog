import React from 'react';
import { Input } from 'fortress';
import { CommonSliceComponentProps, InputOwnProps } from '../../types';

export type HookInputComponent = React.FC<CommonSliceComponentProps & InputOwnProps>;

const HookInput: HookInputComponent = ({ field, subType, placeholder, joyProps }) => {
  return <Input variant="borderplain" {...field} {...joyProps} type={subType} placeholder={placeholder} />;
};

export default HookInput;
