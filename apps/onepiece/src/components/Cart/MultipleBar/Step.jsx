import React from 'react';
import { Grid, Typography, Box } from '@castlery/fortress';
import PropTypes from 'prop-types';

export const Step = React.memo(({ progress = 0, children }) => (
  <Grid
    sx={{
      height: 8,
      position: 'relative',
      background: (theme) => theme.palette.brand.wheat[100],
      '&:nth-last-child(1) > .step_label': {
        right: 0,
        textAlign: 'right',
      },
    }}
  >
    <Box
      className="step_label"
      sx={{
        width: 62,
        textAlign: 'center',
        position: 'absolute',
        top: '8px',
        right: '-31px',
      }}
    >
      {children}
    </Box>
    <Box
      sx={{
        width: progress,
        height: 8,
        background: (theme) => theme.palette.brand.terracotta[500],
        ml: 1 / 4,
      }}
    />
  </Grid>
));
Step.propTypes = {
  progress: PropTypes.number,
  children: PropTypes.node,
};
export const StepLabel = React.memo(({ sx, children }) => (
  <Typography level="caption2" sx={{ ...sx }}>
    {children}
  </Typography>
));
StepLabel.propTypes = {
  sx: PropTypes.object,
  children: PropTypes.node,
};
