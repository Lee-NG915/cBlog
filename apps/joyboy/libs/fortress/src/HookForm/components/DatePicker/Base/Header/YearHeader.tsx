import React, { useMemo, memo } from 'react';
import { IconButton, Box, Typography } from '../../../../../index';
import { ArrowBackIosNew, ArrowForwardIos } from '../../../../../Icons';
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
        marginBottom: { xs: 1.5, sm: 2, lg: 3 },
      }}
    >
      <IconButton onClick={() => changeYear('prev')}>
        <ArrowBackIosNew sx={{ fontSize: { xs: 'xl2', sm: 'xl3', lg: 'xl4' } }} />
      </IconButton>
      <Typography level="h3" role="button" onClick={changeView}>
        {dateString}
      </Typography>
      <IconButton disabled={nextDisabled} onClick={() => changeYear('next')}>
        <ArrowForwardIos sx={{ fontSize: { xs: 'xl2', sm: 'xl3', lg: 'xl4' } }} />
      </IconButton>
    </Box>
  );
};

export default memo(YearMonthHeader);
