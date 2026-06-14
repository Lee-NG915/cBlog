'use client';

import { Box } from '@castlery/fortress';

export default function VouchersLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        px: {
          xs: 6,
          sm: 6,
          md: 9,
        },
        py: {
          xs: 6,
          sm: 7,
          md: 7,
        },
      }}
    >
      {children}
    </Box>
  );
}
