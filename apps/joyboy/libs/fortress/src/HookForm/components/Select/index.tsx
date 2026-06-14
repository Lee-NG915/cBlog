import React from 'react';
import { CommonSliceComponentProps, SelectOwnProps } from '../../types';
import SingleSelect from './Single';
import MultipleSelect from './Multiple';

export type HookSelectProps = CommonSliceComponentProps & SelectOwnProps;
export type HookSelectComponent = React.FC<HookSelectProps>;

const HookSelect: HookSelectComponent = ({ subType, ...restProps }) => {
  return (
    <React.Fragment>
      {subType === 'single' && <SingleSelect {...restProps} />}
      {subType === 'multiple' && <MultipleSelect {...restProps} />}
    </React.Fragment>
  );
};

export default HookSelect;
