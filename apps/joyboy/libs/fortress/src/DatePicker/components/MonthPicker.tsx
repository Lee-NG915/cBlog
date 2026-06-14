'use client';
import { addYears, getYear } from 'date-fns';
import { useState } from 'react';
import { Box, Grid } from '../..';
import { CustomMonthNav } from './CustomMonthNav';
import { YMPickerGrid } from './YMPickerGrid';

const Months = [
  {
    value: 1,
    label: 'Jan',
  },
  {
    value: 2,
    label: 'Feb',
  },
  {
    value: 3,
    label: 'Mar',
  },
  {
    value: 4,
    label: 'Apr',
  },
  {
    value: 5,
    label: 'May',
  },
  {
    value: 6,
    label: 'Jun',
  },
  {
    value: 7,
    label: 'Jul',
  },

  {
    value: 8,
    label: 'Aug',
  },
  {
    value: 9,
    label: 'Sep',
  },
  {
    value: 10,
    label: 'Oct',
  },
  {
    value: 11,
    label: 'Nov',
  },
  {
    value: 12,
    label: 'Dec',
  },
];

export interface MonthPickerProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  onBackToYearPicker?: () => void;
}

export function MonthPicker({ selected, onSelect, onBackToYearPicker }: MonthPickerProps) {
  const [selectedDate, setSelectedDate] = useState(selected ? new Date(selected) : new Date());

  const pickerMonths = Months.map((month) => ({
    value: month.value,
    label: month.label,
    outside: false,
    disabled: false,
  }));

  const onNavClick = () => {
    onBackToYearPicker?.();
  };

  const onYearChange = (mode: 'previous' | 'next') => {
    const date = addYears(selectedDate, mode === 'previous' ? -1 : 1);
    setSelectedDate(date);
    onSelect(date);
  };

  const handleSelect = (month: number) => {
    const date = new Date(getYear(selectedDate), month - 1, 1);
    setSelectedDate(date);
    onSelect(date);
  };

  return (
    <Box>
      <CustomMonthNav onNavClick={onNavClick} onYearChange={onYearChange}>
        {getYear(selectedDate)}
      </CustomMonthNav>
      <Grid
        container
        sx={{
          width: '100%',
          rowGap: 8,
        }}
      >
        {pickerMonths.map((item) => (
          <YMPickerGrid
            type="month"
            label={item.label}
            value={item.value}
            outside={item.outside}
            disabled={item.disabled}
            selected={selectedDate ? item.value === selectedDate.getMonth() + 1 : false}
            onClick={() => handleSelect(item.value)}
            key={item.value}
          />
        ))}
      </Grid>
    </Box>
  );
}
