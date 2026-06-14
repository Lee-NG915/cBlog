'use client';

import { Box } from '@castlery/fortress';

export const DisabledMasker = () => (
  <Box
    sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255, 0.5)',
      zIndex: 10,
      left: 0,
      top: 0,
    }}
  />
);

export default DisabledMasker;
