import React from 'react';
import { CommonSliceComponentProps, DatePickerOwnProps } from '../../types';
import './index.css';
import CommonPicker from './CommonPicker';
import YearMonthPicker from './YearMonthPicker';

export type HookDatePickerComponent = React.FC<CommonSliceComponentProps & DatePickerOwnProps>;

const HookDatePicker: HookDatePickerComponent = ({
  subType,
  field,
  placeholder,
  joyProps,
  yearItemNumber,
  disabledDates,
  disabledDateIntervals,
  defaultStartDate,
  ...rest
}) => {
  const baseProps = {
    field,
    placeholder,
    joyProps,
    disabledDates,
    disabledDateIntervals,
    defaultStartDate,
    ...rest,
  };

  const ymOwnProps = {
    ...baseProps,
    yearItemNumber,
  };

  return (
    <React.Fragment>
      {subType === 'yearMonth' ? <YearMonthPicker {...ymOwnProps} /> : <CommonPicker {...baseProps} />}
    </React.Fragment>
  );
};

export default React.memo(HookDatePicker);
