'use client';
import { useState } from 'react';
import { Box } from '../..';
import { MonthPicker } from './MonthPicker';
import { YearPicker, YearPickerProps } from './YearPicker';

type YMPickerRestProps = Omit<YearPickerProps, 'selected' | 'onSelect'>;

export interface YMPickerBaseProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
}

export function YMPicker({ selected, onSelect, ...restProps }: YMPickerBaseProps & YMPickerRestProps) {
  const { start, end, excludesYears } = restProps as YearPickerProps;

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(selected ? new Date(selected) : undefined);

  const onYearClick = (date: Date) => {
    setSelectedDate(date);
    setShowMonthPicker(true);
  };

  const onMonthClick = (date: Date) => {
    setSelectedDate(date);
    onSelect(date);
  };

  return (
    <Box>
      {showMonthPicker ? (
        <MonthPicker
          selected={selectedDate}
          onSelect={onMonthClick}
          onBackToYearPicker={() => setShowMonthPicker(false)}
        />
      ) : (
        <YearPicker
          selected={selectedDate}
          onSelect={onYearClick}
          start={start}
          end={end}
          excludesYears={excludesYears}
        />
      )}
    </Box>
  );
}

export type YMPickerProps = YMPickerBaseProps & YMPickerRestProps;
