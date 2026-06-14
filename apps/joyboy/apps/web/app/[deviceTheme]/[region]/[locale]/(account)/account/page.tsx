'use client';
import { UserPagContent } from '@castlery/modules-user-components';
import { Box } from '@castlery/fortress';

export default function UserPage() {
  return (
    <Box
      sx={{
        px: {
          xs: 6,
          sm: 6,
          md: 9,
        },
        py: {
          xs: 7,
          sm: 7,
          md: 8,
        },
      }}
    >
      <UserPagContent />
    </Box>
  );
}
