import React from 'react';
import { Grid } from 'fortress';

type RenderDayContentProps = {
  day: number;
};
const RenderDayContent: React.FC<RenderDayContentProps> = ({ day }) => {
  return (
    <Grid
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
