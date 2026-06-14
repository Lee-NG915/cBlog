import React from 'react';
import { Grid } from '../../../../index';

type RenderDayContentProps = {
  day: number;
  customClass?: string;
};
const RenderDayContent: React.FC<RenderDayContentProps> = ({ day, customClass }) => {
  return (
    <Grid
      className={customClass}
      sx={{
        flex: 1,
        height: '39px',
        lineHeight: '39px',
        textAlign: 'center',
      }}
    >
      {day}
    </Grid>
  );
};

export default React.memo(RenderDayContent);
