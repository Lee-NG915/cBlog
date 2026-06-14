'use client';

import { Box, CircularProgress } from '@castlery/fortress';

export const CircleLoadingState = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress size="lg" color="neutral" />
    </Box>
  );
};

export default CircleLoadingState;
