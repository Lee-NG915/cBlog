import React from 'react';
import { Checkbox } from '../../../index';
import { CommonSliceComponentProps, CheckboxOwnProps } from '../../types';

export type HookCheckboxComponent = React.FC<CommonSliceComponentProps & CheckboxOwnProps>;

const HookCheckbox: HookCheckboxComponent = ({ field, placeholder, joyProps = {} }) => {
  const { value, ...rest } = field;
  const { variant, ...restJoyProps } = joyProps;
  // @ts-ignore
  return <Checkbox checked={value} {...rest} label={placeholder} {...restJoyProps} variant={variant} />;
};

export default HookCheckbox;
