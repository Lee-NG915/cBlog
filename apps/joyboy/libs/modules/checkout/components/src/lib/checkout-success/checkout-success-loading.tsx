'use client';
import { Box } from '@castlery/fortress';
import { ContentLoading } from '@castlery/shared-components';

export const CheckoutSuccessLoading = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}
  >
    <ContentLoading loading={true} />
  </Box>
);
