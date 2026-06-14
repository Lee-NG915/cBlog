'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { HookForm, Button, useBreakpoints, DatePickerOwnProps } from '@castlery/fortress';
import { useAsyncFn } from 'react-use';
import { CustomInput } from './custom-input';
import { enableBlackOut } from '@castlery/config';
import { DISABLED_DELIVERY_DATES, DISABLED_DELIVERY_DATES_STATES } from './config';
import {
  isValidDate,
  addSomeDays,
  toGetZonedTime,
  addBusinessDays,
  isBeforeDate,
  toFormZonedTime,
} from '@castlery/utils';

export interface DeliveryCalendarProps {
  sort: number;
  start: string;
  min: string;
  max: string;
  confirm: (date: string) => Promise<void>;
  bufferDays: number;
  leastBufferDays: number;
  basedState: string;
}
export function DeliveryCalendar({ sort, start, min, max, confirm, bufferDays, basedState }: DeliveryCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    isValidDate(start) ? toGetZonedTime(start) : toGetZonedTime(new Date())
  );

  const [open, setOpen] = useState(false);
  const { xs, md, sm } = useBreakpoints();
  const isSmall = xs || md || sm;

  const calculateBufferDaysWithWeekends = useCallback((startDate: Date, bufferDays: number) => {
    const calcMaxDate = addBusinessDays(startDate, bufferDays - 1);
    const array = [startDate];
    let currentDate = startDate;

    for (let i = 0; i < bufferDays * 2; i++) {
      if (!isBeforeDate(currentDate, calcMaxDate)) {
        break;
      }
      currentDate = addSomeDays(currentDate, 1);
      array.push(currentDate);
    }
    return array;
  }, []);

  const [confirmState, handleConfirm] = useAsyncFn(async () => {
    return confirm(toFormZonedTime(selectedDate).toISOString()).then(() => {
      setOpen(false);
    });
  }, [selectedDate, setOpen]);

  const disabledDateIntervals = useMemo(() => {
    let disabledIntervals: Partial<DatePickerOwnProps['disabledDateIntervals']> = {};
    if (min) {
      disabledIntervals = { ...disabledIntervals, before: toGetZonedTime(min) };
    }
    if (max) {
      disabledIntervals = { ...disabledIntervals, after: toGetZonedTime(max) };
    }
    if (enableBlackOut && DISABLED_DELIVERY_DATES_STATES.includes(basedState)) {
      disabledIntervals = {
        ...disabledIntervals,
        range: [
          {
            // @ts-ignore
            start: toGetZonedTime(DISABLED_DELIVERY_DATES[basedState]?.[0]?.from),
            // @ts-ignore
            end: toGetZonedTime(DISABLED_DELIVERY_DATES[basedState]?.[0]?.to),
          },
        ],
      };
    }
    return disabledIntervals;
  }, [min, max, basedState]);

  const formJson = useMemo(() => {
    const defaultConfig = {
      title: `Schedule Your Delivery for Shipment ${sort ? sort : ''}`,
      desc: 'Confirmation of delivery date is subject to the availability of our delivery partners. You will receive a scheduling link via SMS & email closer to your preferred date to select the actual delivery date & timeslot.',
    };

    return {
      key: 'delivery',
      type: 'datePicker',
      subType: 'date',
      calendarHeaderTitle: defaultConfig.title,
      calendarHeaderDesc: defaultConfig.desc,
      customInput: <CustomInput handler={() => setOpen(true)} />,
      open: open,
      defaultStartDate: toGetZonedTime(start),
      shouldCloseOnSelect: false,
      disabledDateIntervals: disabledDateIntervals,
      highlightDates: calculateBufferDaysWithWeekends(selectedDate, bufferDays),
      popperPlacement: isSmall ? 'bottom-start' : 'bottom-end',
      CalendarFooter: (
        <Button fullWidth loading={confirmState?.loading} variant="secondary" type="submit" sx={{ borderTop: 0 }}>
          Confirm
        </Button>
      ),
      joyProps: {
        variant: 'borderplain',
        color: 'primary',
      },
      onChange: (value: Date) => {
        setSelectedDate(value);
      },
      value: selectedDate,
      onCalendarClose: () => {
        setOpen(false);
      },
    };
  }, [
    bufferDays,
    calculateBufferDaysWithWeekends,
    start,
    selectedDate,
    setSelectedDate,
    setOpen,
    open,
    disabledDateIntervals,
    confirmState?.loading,
    sort,
    isSmall,
  ]);

  return (
    <HookForm
      // @ts-ignore
      form={[formJson]}
      validators={{
        delivery: {
          required: false,
        },
      }}
      submit={handleConfirm}
      formSxProps={{
        display: 'inline-block',
      }}
    ></HookForm>
  );
}

export default DeliveryCalendar;
