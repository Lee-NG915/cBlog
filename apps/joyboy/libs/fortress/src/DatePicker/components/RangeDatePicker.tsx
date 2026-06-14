'use client';
import { addMonths, addYears } from 'date-fns';
import { useState } from 'react';
import type { PropsBase, PropsRangeRequired } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CustomNav } from './CustomNav';
import { CustomWeekDay } from './CustomWeekDay';
import { DatePickerStyleWrapper } from './DatePickerStyleWrapper';

/**
 * @interface PropsBase: https://daypicker.dev/api/interfaces/PropsBase
 * @interface PropsRangeRequired: https://daypicker.dev/api/interfaces/PropsRangeRequired
 */
export function RangeDatePicker({ selected, ...rest }: PropsBase & Omit<PropsRangeRequired, 'mode' | 'required'>) {
  const currentSelected = selected;

  const getDefaultMonth = () => {
    if (!currentSelected) {
      return addMonths(new Date(), 0);
    }
    if ('from' in currentSelected && currentSelected.from instanceof Date) {
      return addMonths(currentSelected.from, 0);
    }
    if ('to' in currentSelected && currentSelected.to instanceof Date) {
      return addMonths(currentSelected.to, 0);
    }

    return addMonths(new Date(), 0);
  };

  const [month, setMonth] = useState<Date>(getDefaultMonth());

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
        mode={'range'}
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

export type RangeDatePickerProps = Parameters<typeof RangeDatePicker>[0];
