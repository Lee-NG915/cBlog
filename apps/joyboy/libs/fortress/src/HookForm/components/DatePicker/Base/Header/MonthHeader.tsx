import React, { useMemo, memo } from 'react';
import { IconButton, Box, Typography } from '../../../../../index';
import { ArrowForwardIos, ArrowBackIosNew } from '../../../../../Icons';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: { xs: 1.5, sm: 2, lg: 3 },
      }}
    >
      <IconButton disabled={prevDisabled} onClick={decrease}>
        <ArrowBackIosNew sx={{ fontSize: { xs: 'xl2', sm: 'xl3', lg: 'xl4' } }} />
      </IconButton>
      <Typography level="h3" role="button" onClick={changeView}>
        {dateString}
      </Typography>
      <IconButton disabled={nextDisabled} onClick={increase}>
        <ArrowForwardIos sx={{ fontSize: { xs: 'xl2', sm: 'xl3', lg: 'xl4' } }} />
      </IconButton>
    </Box>
  );
};

export default memo(MonthHeader);
