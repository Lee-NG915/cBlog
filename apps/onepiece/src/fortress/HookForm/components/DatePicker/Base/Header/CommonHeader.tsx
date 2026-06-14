import React from 'react';
import { IconButton, Box, Typography } from 'fortress';
import { ArrowBackIosNew, ArrowForwardIos } from 'fortress/Icons';
import type { PickerHeaderProps } from './type';
import dayjs from 'dayjs';

const CommonHeader: React.FC<
  PickerHeaderProps & {
    onChange: (date: Date) => void;
  }
> = ({ date, increaseMonth, decreaseMonth, onChange }) => {
  const dateString = React.useMemo(() => {
    return date && date instanceof Date ? dayjs(date).format('MMMM YYYY') : '';
  }, [date]);

  const nbStep = (n: boolean) => {
    if (n) {
      increaseMonth();
      let d = dayjs(date).add(1, 'month');
      onChange(d.toDate());
    } else {
      decreaseMonth();
      let d = dayjs(date).subtract(1, 'month');
      onChange(d.toDate());
    }
  };

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
      <IconButton disabled={false} onClick={() => nbStep(false)}>
        <ArrowBackIosNew />
      </IconButton>
      <Typography level="h2">{dateString}</Typography>
      <IconButton disabled={false} onClick={() => nbStep(true)}>
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
};

export default React.memo(CommonHeader);
