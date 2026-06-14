import React from 'react';
import DatePicker from 'react-datepicker';
import { CommonSliceComponentProps, DatePickerOwnProps } from '../../types';
import PickerGenerator from './helpers/pickerGenerator';
import useBreakpoints from '../../../hooks/useBreakpoints';
import { CalendarContainer, RenderDayContent, CustomInput, CommonHeader } from './Base';
import { useFormContext } from 'react-hook-form';
import './index.css';
import dayjs from 'dayjs';

export type HookDatePickerComponent = React.FC<CommonSliceComponentProps & Omit<DatePickerOwnProps, 'subType'>>;

const HookDatePicker: HookDatePickerComponent = ({
  field,
  placeholder,
  joyProps,
  disabledDates,
  disabledDateIntervals,
  defaultStartDate,
  calendarHeaderTitle,
  calendarHeaderDesc,
}) => {
  const { setValue } = useFormContext();
  const { value, name } = field;
  const { mobile } = useBreakpoints() || {};
  const { variant = 'borderplain', color } = joyProps;

  const pickerParams = React.useMemo(
    () => ({
      ...new PickerGenerator({ type: 'date' }).getPicker(),
      showFourColumnMonthYearPicker: !mobile,
    }),
    [mobile]
  );

  const onValueChange = React.useCallback(
    (date: Date) => {
      setValue(name, date);
    },
    [name]
  );
  const filterDays = (date: Date) => {
    let flagNow = value ? dayjs(value) : defaultStartDate ? dayjs(defaultStartDate) : dayjs();
    let baseFlag = !dayjs(date).isBefore(flagNow.startOf('month')) && !dayjs(date).isAfter(flagNow.endOf('month'));
    const { before, after } = disabledDateIntervals || {};

    if (before instanceof Date || after instanceof Date) {
      let beforeFlag = before ? !dayjs(date).isBefore(before) : true;
      let afterFlag = after ? !dayjs(date).isAfter(after) : true;
      return baseFlag && beforeFlag && afterFlag;
    }
    return baseFlag;
  };

  const disabledIntervals = React.useMemo(() => {
    const { range } = disabledDateIntervals || {};
    return range && Array.isArray(range)
      ? range.reduce((acr: any, cur) => {
          const { start, end } = cur;
          return [...acr, { start: start, end: end }];
        }, [])
      : [];
  }, [disabledDateIntervals]);

  return (
    <DatePicker
      selected={value}
      placeholderText={placeholder}
      onChange={onValueChange}
      filterDate={filterDays}
      excludeDates={Array.isArray(disabledDates) ? disabledDates : []}
      excludeDateIntervals={disabledIntervals}
      openToDate={value ? value : defaultStartDate instanceof Date ? defaultStartDate : new Date()}
      {...pickerParams}
      renderCustomHeader={({ ...defaultProps }) => <CommonHeader {...defaultProps} onChange={onValueChange} />}
      customInput={<CustomInput variant={variant} color={color} />}
      calendarContainer={({ ...containerProps }) => (
        <CalendarContainer
          {...containerProps}
          calendarClassName={pickerParams.calendarClassName}
          calendarHeaderTitle={calendarHeaderTitle}
          calendarHeaderDesc={calendarHeaderDesc}
        />
      )}
      renderDayContents={(day) => <RenderDayContent day={day} />}
    />
  );
};

export default React.memo(HookDatePicker);
