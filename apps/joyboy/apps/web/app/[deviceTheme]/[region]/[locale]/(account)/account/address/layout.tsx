'use client';

import { Box } from '@castlery/fortress';

export default function AddressLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        px: {
          xs: 6,
          sm: 6,
          md: 9,
        },
        py: {
          xs: 4,
          sm: 6,
          md: 8,
        },
      }}
    >
      {children}
    </Box>
  );
}
