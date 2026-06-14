import React, { useMemo, memo } from 'react';
import { IconButton, Box, Typography } from 'fortress';
import { ArrowBackIosNew, ArrowForwardIos } from 'fortress/Icons';
import type { PickerHeaderProps } from './type';
import dayjs from 'dayjs';

/** Refer to react-datepicker */
export interface HeaderProps extends Pick<PickerHeaderProps, 'changeMonth'> {
  date?: Date;
  format?: (date: Date) => string | number /** Date formatting function */;
  changeView: () => void;
  changeDate: (date: Date) => void;
}
const MonthHeader: React.FC<HeaderProps> = ({ date, format, changeView, changeDate, changeMonth }) => {
  const dateString = useMemo(() => {
    if (!(date instanceof Date)) return '';
    return typeof format === 'function' ? format(date) : dayjs(date).format('YYYY');
  }, [date, format]);

  const prevDisabled = React.useMemo(() => date instanceof Date && dayjs(date).month() <= 0, [date]);

  const nextDisabled = useMemo(() => date instanceof Date && dayjs(date).month() >= 11, [date]);

  const decrease = () => {
    if (!(date instanceof Date)) return;
    const toMonth = dayjs(date).subtract(1, 'month');
    changeDate(toMonth.toDate());
  };
  const increase = () => {
    if (!(date instanceof Date)) return;
    const toMonth = dayjs(date).add(1, 'month');
    changeDate(toMonth.toDate());
  };
  React.useEffect(() => {
    if (date instanceof Date) {
      const month = dayjs(date).month();
      changeMonth(month);
    }
  }, [date]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: (theme: any) => theme.spacing(3),
      }}
    >
      <IconButton disabled={prevDisabled} onClick={decrease}>
        <ArrowBackIosNew />
      </IconButton>
      <Typography level="h2" role="button" onClick={changeView}>
        {dateString}
      </Typography>
      <IconButton disabled={nextDisabled} onClick={increase}>
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
};

export default memo(MonthHeader);
