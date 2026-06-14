'use client';
import { addYears, getMonth, getYear } from 'date-fns';
import { useMemo, useState } from 'react';
import { Box, Grid } from '../..';
import { CustomYearNav } from './CustomYearNav';
import { YMPickerGrid } from './YMPickerGrid';

export interface YearPickerProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  start?: Date;
  end?: Date;
  excludesYears?: number[];
}

export function YearPicker({ selected, onSelect, start, end, excludesYears = [] }: YearPickerProps) {
  const YEARS_RANGE_OFFSET = 12;

  const getPickerYears = (firstYear: number | undefined) => {
    const beginYear = firstYear || getYear(addYears(new Date(), -4));
    const startYear = start ? getYear(start) : '';
    const endYear = end ? getYear(end) : 9999;
    const years = new Array(YEARS_RANGE_OFFSET)
      .fill(0)
      .map((_, index) => index + beginYear)
      .map((year) => ({
        label: year,
        value: year,
        outside: startYear ? year < startYear || year > endYear : year > endYear,
        disabled: excludesYears?.includes(year),
      }));
    return years;
  };

  const [pickerYears, setPickerYears] = useState(getPickerYears(start ? getYear(start) : undefined));
  const navYears = useMemo(() => {
    return {
      start: pickerYears[0].value,
      end: pickerYears[pickerYears.length - 1].value,
    };
  }, [pickerYears]);

  const onNavClick = (mode: 'previous' | 'next') => {
    const newStart = mode === 'previous' ? navYears.start - YEARS_RANGE_OFFSET : navYears.start + YEARS_RANGE_OFFSET;
    setPickerYears(getPickerYears(newStart));
  };

  const onYearClick = (year: number) => {
    const date = selected ? new Date(year, getMonth(selected), 1) : new Date(year, 0, 1);
    onSelect(date);
  };

  return (
    <Box>
      <CustomYearNav onYearChange={onNavClick}>{`${navYears.start} - ${navYears.end}`}</CustomYearNav>
      <Grid
        container
        sx={{
          width: '100%',
          rowGap: 8,
        }}
      >
        {pickerYears.map((item) => (
          <YMPickerGrid
            type="year"
            label={item.label.toString()}
            value={item.value}
            outside={item.outside}
            disabled={item.disabled}
            selected={selected ? item.value === getYear(selected) : false}
            onClick={() => onYearClick(item.value)}
            key={item.value}
          />
        ))}
      </Grid>
    </Box>
  );
}
