'use client';
import { Box, Loading } from '@castlery/fortress';

export function PermissionLoading() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Loading theme="dark" />
    </Box>
  );
}
