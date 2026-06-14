import React from 'react';
import { Card, Grid, Typography, Box } from 'fortress';
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
};

const CalendarContainer: React.FC<InitialProps & Partial<CalendarContainerProps>> = ({
  calendarClassName,
  children,
  calendarHeaderTitle,
  calendarHeaderDesc,
}) => {
  return (
    <Card
      className={calendarClassName}
      sx={{
        background: (theme) => theme.palette.common.white,
        padding: (theme) => theme.spacing(3),
        boxShadow: (theme) => theme.shadow['md'],
        rowGap: 0,
      }}
    >
      {(calendarHeaderTitle || calendarHeaderDesc) && (
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
            padding: 3,
            borderBottom: 0,
            position: 'relative',
          }}
        >
          <Typography level="h3" sx={{ mb: 1 }}>
            {calendarHeaderTitle}
          </Typography>
          <Typography level="body2">{calendarHeaderDesc}</Typography>
        </Box>
      )}

      <Grid
        container
        sx={{
          width: '100%',
          border: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
          padding: (theme) => theme.spacing(2),
        }}
      >
        {children}
      </Grid>
    </Card>
  );
};

export default CalendarContainer;
