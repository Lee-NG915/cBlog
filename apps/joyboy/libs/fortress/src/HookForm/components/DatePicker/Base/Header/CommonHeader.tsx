import React from 'react';
import { IconButton, Box, Typography } from '../../../../../index';
import { ArrowBackIosNew, ArrowForwardIos } from '../../../../../Icons';
import type { PickerHeaderProps } from './type';
import { formatDate, isValidDate } from '@castlery/utils';

const CommonHeader: React.FC<
  PickerHeaderProps & {
    onChange: (date: Date) => void;
  }
> = ({ date, increaseMonth, decreaseMonth }) => {
  const dateString = React.useMemo(() => {
    let d = '';
    if (isValidDate(date)) {
      d = formatDate(date, 'MMMM yyyy');
    }
    return d;
  }, [date]);

  const nbStep = (n: boolean) => {
    if (n) {
      increaseMonth();
      // const d = dayjs(date).add(1, 'month');
      // onChange(d.toDate());
    } else {
      decreaseMonth();
      // const d = dayjs(date).subtract(1, 'month');
      // onChange(d.toDate());
    }
  };

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
      {/*| xl2  | 1.375  | 22   |
       * | xl3  | 1.5    | 24   |
       * | xl4  | 1.75   | 28   | */}
      <IconButton disabled={false} onClick={() => nbStep(false)}>
        <ArrowBackIosNew sx={{ fontSize: { xs: 'xl2', sm: 'xl3', lg: 'xl4' } }} />
      </IconButton>
      <Typography level="h3">{dateString}</Typography>
      <IconButton disabled={false} onClick={() => nbStep(true)}>
        <ArrowForwardIos sx={{ fontSize: { xs: 'xl2', sm: 'xl3', lg: 'xl4' } }} />
      </IconButton>
    </Box>
  );
};

export default React.memo(CommonHeader);
