'use client';
import { addMonths, addYears } from 'date-fns';
import { useState } from 'react';
import type { PropsBase, PropsSingleRequired } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CustomNav } from './CustomNav';
import { CustomWeekDay } from './CustomWeekDay';
import { DatePickerStyleWrapper } from './DatePickerStyleWrapper';

export function SingleDatePicker({ selected, ...rest }: PropsBase & Omit<PropsSingleRequired, 'mode' | 'required'>) {
  const currentSelected = selected ?? new Date();

  const [month, setMonth] = useState<Date>(currentSelected);

  const onMonthChange = (mode: 'previous' | 'next') => {
    setMonth(() => addMonths(month, mode === 'previous' ? -1 : 1));
  };
  const onYearChange = (mode: 'previous' | 'next') => {
    setMonth(() => addYears(month, mode === 'previous' ? -1 : 1));
  };
  return (
    <DatePickerStyleWrapper>
      {/* @ts-ignore */}
      <DayPicker
        animate
        navLayout="around"
        hideNavigation
        showOutsideDays
        mode={'single'}
        required={true}
        fixedWeeks
        locale={enUS}
        selected={currentSelected}
        month={month}
        components={{
          CaptionLabel: (props) => <CustomNav {...props} onMonthChange={onMonthChange} onYearChange={onYearChange} />,
          Weekday: CustomWeekDay,
        }}
        {...rest}
      />
    </DatePickerStyleWrapper>
  );
}

export type SingleDatePickerProps = Parameters<typeof SingleDatePicker>[0];
