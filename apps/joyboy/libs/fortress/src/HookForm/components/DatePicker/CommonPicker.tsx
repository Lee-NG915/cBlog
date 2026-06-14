'use client';
import React from 'react';
import DatePicker, { type ReactDatePickerProps } from 'react-datepicker';
import { CommonSliceComponentProps, DatePickerOwnProps } from '../../types';
import PickerGenerator from './helpers/pickerGenerator';
import useBreakpoints from '../../../hooks/useBreakpoints';
import { CalendarContainer, RenderDayContent, CustomInput, CommonHeader } from './Base';
import { useFormContext } from 'react-hook-form';
import './index.css';
import { isBeforeDate, isAfterDate, isWeekend } from '@castlery/utils';

export type HookDatePickerComponent = React.FC<
  CommonSliceComponentProps & Omit<DatePickerOwnProps, 'subType'> & ReactDatePickerProps
>;

const HookDatePicker: HookDatePickerComponent = ({
  field,
  placeholder,
  joyProps,
  disabledWeekends = false,
  disabledDates,
  disabledDateIntervals,
  defaultStartDate,
  calendarHeaderTitle,
  calendarHeaderDesc,
  CalendarFooter,
  ...rest
}) => {
  const { setValue } = useFormContext();
  const { value, name } = field;
  const { mobile } = useBreakpoints() || {};
  const { variant = 'borderplain', color, ...restJoyProps } = joyProps;

  const pickerParams: Record<string, any> = React.useMemo<Record<string, any>>(
    //@ts-ignore
    () => ({
      ...(new PickerGenerator({ type: 'date' }).getPicker() || {}),
      showFourColumnMonthYearPicker: !mobile,
    }),
    [mobile]
  );

  const onValueChange = React.useCallback(
    (date: Date) => {
      setValue(name, date);
    },
    [name, setValue]
  );

  /**
   * Filter days based on disabled date intervals.
   * @param date `Date`
   * @returns `boolean` false if the date is disabled
   */
  const filterDays = (date: Date) => {
    const { before, after } = disabledDateIntervals || {};

    if (before instanceof Date || after instanceof Date) {
      const isBefore = before ? !isBeforeDate(date, before) : true;
      const isAfter = after ? !isAfterDate(date, after) : true;
      return isBefore && isAfter && (disabledWeekends ? !isWeekend(date) : true);
    }

    return true;
  };

  /**
   * Get disabled intervals.
   * @returns `Array<{ start: Date, end: Date }>`
   */
  const disabledIntervals = React.useMemo(() => {
    const { range } = disabledDateIntervals || {};
    return range && Array.isArray(range)
      ? range.reduce((acr: any, cur) => {
          const { start, end } = cur;
          return [...acr, { start: start, end: end }];
        }, [])
      : [];
  }, [disabledDateIntervals]);

  const hasHighlightDays = Array.isArray(rest?.highlightDates) && rest?.highlightDates.length > 0;

  return (
    <DatePicker
      selected={value}
      placeholderText={placeholder}
      // @ts-ignore
      onChange={onValueChange}
      filterDate={filterDays}
      excludeDates={Array.isArray(disabledDates) ? disabledDates : []}
      excludeDateIntervals={disabledIntervals}
      openToDate={value ? value : defaultStartDate instanceof Date ? defaultStartDate.getTime() : new Date()}
      {...pickerParams}
      renderCustomHeader={({ ...defaultProps }) => <CommonHeader {...defaultProps} onChange={onValueChange} />}
      customInput={<CustomInput variant={variant} color={color} />}
      calendarContainer={({ ...containerProps }) => (
        <CalendarContainer
          {...containerProps}
          calendarClassName={`${pickerParams.calendarClassName} ${hasHighlightDays ? 'highlight-days-picker' : ''} ${
            disabledWeekends ? 'disabled-weekends-picker' : ''
          }`}
          calendarHeaderTitle={calendarHeaderTitle}
          calendarHeaderDesc={calendarHeaderDesc}
          CalendarFooter={CalendarFooter}
        />
      )}
      renderDayContents={(day) => (
        <RenderDayContent customClass={hasHighlightDays ? 'highlight-days-picker--day' : ''} day={day} />
      )}
      {...restJoyProps}
      {...rest}
    />
  );
};

export default React.memo(HookDatePicker);
