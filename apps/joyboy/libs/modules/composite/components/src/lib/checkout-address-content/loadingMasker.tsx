'use client';

import { Stack, CircularProgress } from '@castlery/fortress';

export const LoadingMasker = () => {
  return (
    <Stack
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(246, 243, 231, .1)',
        backdropFilter: 'blur(1px)',
        zIndex: 2,
      }}
    >
      <CircularProgress size="lg" color="neutral" />
    </Stack>
  );
};
