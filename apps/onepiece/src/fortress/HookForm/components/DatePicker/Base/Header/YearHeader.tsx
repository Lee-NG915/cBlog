import React, { useMemo, memo } from 'react';
import { IconButton, Box, Typography } from 'fortress';
import { ArrowBackIosNew, ArrowForwardIos } from 'fortress/Icons';
import dayjs from 'dayjs';

/** Refer to react-datepicker */
export interface HeaderProps {
  date?: Date;
  format?: (date: Date) => string | number /** Date formatting function */;
  changeYear: (mode: 'prev' | 'next') => void /** Event handles for the back/forwards buttons in the header */;
  changeView: () => void;
}
const YearMonthHeader: React.FC<HeaderProps> = ({ date, format, changeYear, changeView }) => {
  const dateString = useMemo(() => {
    if (!(date instanceof Date)) return '';
    return typeof format === 'function' ? format(date) : dayjs(date).format('MMM');
  }, [date, format]);

  const nextDisabled = useMemo(() => date instanceof Date && dayjs(date).year() >= dayjs().year(), [date]);

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
      <IconButton onClick={() => changeYear('prev')}>
        <ArrowBackIosNew />
      </IconButton>
      <Typography level="h2" role="button" onClick={changeView}>
        {dateString}
      </Typography>
      <IconButton disabled={nextDisabled} onClick={() => changeYear('next')}>
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
};

export default memo(YearMonthHeader);
