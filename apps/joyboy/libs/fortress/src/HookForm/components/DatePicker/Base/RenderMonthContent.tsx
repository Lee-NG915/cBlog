import React from 'react';
import { Grid } from '../../../../index';

type MonthSectionProps = {
  shortMonth: string;
};
const MonthSection: React.FC<MonthSectionProps> = ({ shortMonth }) => {
  if (!shortMonth) return null;

  return (
    <Grid
      sx={{
        width: 72,
        height: 48,
        lineHeight: '48px',
        textAlign: 'center',
      }}
    >
      {shortMonth}
    </Grid>
  );
};

export default React.memo(MonthSection);
