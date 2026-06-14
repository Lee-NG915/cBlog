import React, { useCallback } from 'react';
import RenderYearContent from './RenderYearContent';
import { Box } from 'fortress';
import { getYear } from '../helpers/utils';

export interface YearItem {
  value: number;
  disabled: boolean;
}
export interface YearSectionProps {
  date: Date;
  years: Array<YearItem>;
  onChange: (year: Date) => void;
}
const YearSection: React.FC<YearSectionProps> = ({ date, years, onChange }) => {
  const isSelected = useCallback((year: number) => (date instanceof Date ? getYear(date) === year : false), [date]);

  const changeHandler = useCallback(
    ({ value, disabled }) => {
      !disabled && onChange(new Date(new Date().setFullYear(value)));
    },
    [onChange]
  );

  return (
    <Box sx={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'space-between' }}>
      {years.map(({ value, disabled }) => (
        <Box key={value} onClick={() => changeHandler({ value, disabled })}>
          <RenderYearContent year={value} selected={isSelected(value)} disabled={disabled} />
        </Box>
      ))}
    </Box>
  );
};

export default YearSection;
