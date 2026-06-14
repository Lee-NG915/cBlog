import React from 'react';
import { Card, Grid, Typography, Box } from '../../../../index';

type InitialProps = {
  className?: string | undefined;
  children?: React.ReactNode | React.ReactNode[];
  showPopperArrow?: boolean | undefined;
  arrowProps?:
    | {
        [propName: string]: any;
      }
    | undefined;
};
export type CalendarContainerProps = {
  calendarClassName: string;
  calendarHeaderTitle?: string;
  calendarHeaderDesc?: string;
  CalendarFooter?: React.ReactNode;
};

const CalendarContainer: React.FC<InitialProps & Partial<CalendarContainerProps>> = ({
  calendarClassName,
  children,
  calendarHeaderTitle,
  calendarHeaderDesc,
  CalendarFooter = null,
}) => {
  return (
    <Card
      className={calendarClassName}
      sx={{
        background: (theme) => theme.palette.common.white,
        padding: { xs: 2.5, sm: 3 },
        boxShadow: (theme) => theme.shadow['md'],
        rowGap: 0,
      }}
    >
      {(calendarHeaderTitle || calendarHeaderDesc) && (
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
            padding: { xs: 1, sm: 1.5, lg: 2 },
            borderBottom: 0,
            position: 'relative',
          }}
        >
          <Typography level="h2" sx={{ mb: 1, fontSize: 'xl' }}>
            {calendarHeaderTitle}
          </Typography>
          <Typography level="caption1">{calendarHeaderDesc}</Typography>
        </Box>
      )}

      <Grid
        container
        sx={{
          width: '100%',
          border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
          padding: { xs: 1, sm: 1.5, lg: 2 },
        }}
      >
        {children}
      </Grid>
      {CalendarFooter}
    </Card>
  );
};

export default CalendarContainer;
