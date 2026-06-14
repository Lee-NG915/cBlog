import React from 'react';
import { CommonSliceComponentProps, CheckboxOwnProps } from '../../types';
import HookCheckbox from './checkbox';
import HookCheckboxGroup from './group';

export type CheckBoxProps = CommonSliceComponentProps & CheckboxOwnProps;

export type HookCheckboxComponent = React.FC<CheckBoxProps>;

const CheckboxMap: HookCheckboxComponent = (props) => {
  const realVariant = props?.optionJoyProps?.variant !== 'borderplain' ? props?.optionJoyProps?.variant : 'outlined';
  const newProps = { ...props, optionJoyProps: { ...props.optionJoyProps, variant: realVariant } };
  return (
    <React.Fragment>
      {props?.subType === 'checkbox' && <HookCheckbox {...newProps} />}
      {props?.subType === 'group' && <HookCheckboxGroup {...newProps} />}
    </React.Fragment>
  );
};
export default CheckboxMap;
