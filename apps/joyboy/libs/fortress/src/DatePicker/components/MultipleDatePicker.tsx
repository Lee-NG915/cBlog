'use client';
import { addMonths, addYears } from 'date-fns';
import { useState } from 'react';
import type { PropsBase, PropsMultiRequired } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CustomNav } from './CustomNav';
import { CustomWeekDay } from './CustomWeekDay';
import { DatePickerStyleWrapper } from './DatePickerStyleWrapper';

/**
 * @interface PropsBase: https://daypicker.dev/api/interfaces/PropsBase
 * @interface PropsMultiRequired: https://daypicker.dev/api/interfaces/PropsMultiRequired
 */
export function MultipleDatePicker({ selected, ...rest }: PropsBase & Omit<PropsMultiRequired, 'mode' | 'required'>) {
  const currentSelected = selected ?? [];

  const getDefaultMonth = () => {
    if (Array.isArray(currentSelected) && currentSelected.length > 0 && currentSelected[0] instanceof Date) {
      return addMonths(currentSelected[0], 0);
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
        mode={'multiple'}
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

export type MultipleDatePickerProps = Parameters<typeof MultipleDatePicker>[0];
