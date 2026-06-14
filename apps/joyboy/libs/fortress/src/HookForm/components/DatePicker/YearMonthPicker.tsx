/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { CommonSliceComponentProps, DatePickerOwnProps } from '../../types';
import { useFormContext } from 'react-hook-form';
import { MonthHeader, YearHeader, YMContainer, CustomInput } from './Base';
import PickerGenerator from './helpers/pickerGenerator';
import useBreakpoints from '../../../hooks/useBreakpoints';
import YearSection, { type YearItem } from './Base/YearSection';
import { calcYears, getCurrentYear } from './helpers/utils';
import './index.css';
import { Box } from '../../../index';
import dayjs from 'dayjs';

export type BFMode = 'prev' | 'next';
export type HookDatePickerComponent = React.FC<CommonSliceComponentProps & Omit<DatePickerOwnProps, 'subType'>>;

const HookDatePicker: HookDatePickerComponent = ({
  field,
  placeholder,
  yearItemNumber,
  joyProps,
  disabledDates,
  disabledDateIntervals,
  defaultStartDate,
  calendarHeaderTitle,
  calendarHeaderDesc,
}) => {
  const { setValue } = useFormContext();
  const { value, name } = field;
  const [showYear, setShowYear] = useState<boolean>(true);
  const [years, setYears] = useState<YearItem[]>([]);
  const { mobile } = useBreakpoints() || {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant = 'borderplain', color, forceType = 'button', ...restJoyProps } = joyProps;

  const _yearItemNumber = yearItemNumber ? yearItemNumber : mobile ? 9 : 20;
  const _defaultStartYear =
    defaultStartDate instanceof Date ? dayjs(defaultStartDate).get('year') : getCurrentYear() - _yearItemNumber + 1;

  const monthPickerParams = useMemo(
    () => ({
      ...new PickerGenerator({ type: 'month' }).getYMMonthPicker(),
      showFourColumnMonthYearPicker: !mobile,
    }),
    [mobile]
  );

  const _disabledYear = React.useCallback(
    (year: number) => {
      if (
        Array.isArray(disabledDates) &&
        disabledDates.some((date) => date instanceof Date && dayjs(date).get('y') === year)
      ) {
        return true;
      }
      const { before, range, after } = disabledDateIntervals || {};
      if (before instanceof Date && year < dayjs(before).get('y')) {
        return true;
      }
      if (after instanceof Date && year > dayjs(after).get('y')) {
        return true;
      }
      if (
        Array.isArray(range) &&
        range.some(({ start, end }) => year >= dayjs(start).get('y') && year <= dayjs(end).get('y'))
      ) {
        return true;
      }
      return false;
    },
    [disabledDates, disabledDateIntervals]
  );

  const _calcYears = useCallback((start: number, yearItemNumber: number) => {
    const arr = calcYears(start, yearItemNumber);
    return arr.map((item) => ({
      value: item,
      disabled: _disabledYear(item),
    }));
  }, []);

  const monthChange = useCallback(
    (date: Date) => {
      setShowYear((pre) => !pre);
      const y = new Date(value).getFullYear();
      const d = new Date(date).setFullYear(y);
      handleSetValue(new Date(d));
    },
    [value]
  );

  const yearChange = useCallback(
    (date: Date | string) => {
      setShowYear((pre) => !pre);
      const m = !value ? new Date().getMonth() : new Date(value).getMonth();
      const d = new Date(date).setMonth(m);
      handleSetValue(new Date(d));
    },
    [value]
  );

  /** event handler for back/forwards buttons in header */
  const onYHeaderChange = useCallback(
    (mode: BFMode) => {
      const yearsStart = years[0]?.value;
      const goPrev = () => setYears(_calcYears(yearsStart - 5, _yearItemNumber));
      const goNext = () => setYears(_calcYears(yearsStart + 5, _yearItemNumber));
      if (!(value instanceof Date)) {
        mode === 'prev' ? goPrev() : goNext();
        return;
      }

      if (mode === 'prev') {
        const toYear = dayjs(value).subtract(1, 'year');
        if (toYear.year() < yearsStart) {
          goPrev();
        }
        handleSetValue(toYear.toDate());
      }
      if (mode === 'next') {
        const toYear = dayjs(value).add(1, 'year');
        if (toYear.year() >= yearsStart + _yearItemNumber) {
          goNext();
        }
        handleSetValue(toYear.toDate());
      }
    },
    [_yearItemNumber, value, years]
  );

  // @ts-ignore
  const handleSetValue = useCallback((date) => setValue(name, date), [name]);
  const onCalendarOpen = useCallback(() => setShowYear(true), []);

  useEffect(() => {
    /** Initialize year array */
    setYears(() => _calcYears(_defaultStartYear, _yearItemNumber));
  }, [_defaultStartYear, _yearItemNumber]);

  return (
    <DatePicker
      {...restJoyProps}
      selected={value}
      placeholderText={placeholder}
      {...monthPickerParams}
      onChange={monthChange}
      customInput={<CustomInput variant={variant} color={color} placeholder={placeholder} forceType={forceType} />}
      renderCustomHeader={({ changeMonth }) => (
        <MonthHeader
          date={value}
          changeMonth={changeMonth}
          changeDate={handleSetValue}
          changeView={() => setShowYear((pre) => !pre)}
        />
      )}
      calendarContainer={({ ...containerProps }) => (
        <YMContainer
          {...containerProps}
          showYear={showYear}
          calendarClassName={monthPickerParams.calendarClassName}
          calendarHeaderTitle={calendarHeaderTitle}
          calendarHeaderDesc={calendarHeaderDesc}
        />
      )}
      onCalendarOpen={onCalendarOpen}
    >
      {showYear ? (
        <Box>
          <YearHeader date={value} changeYear={onYHeaderChange} changeView={() => setShowYear((pre) => !pre)} />
          <YearSection years={years} date={value} onChange={yearChange} />
        </Box>
      ) : null}
    </DatePicker>
  );
};

export default HookDatePicker;
