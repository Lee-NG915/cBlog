'use client';

import React from 'react';
import { Box, Typography } from '@castlery/fortress';

interface CreditsItemProps {
  handler: (code: string) => void;
}
export const CreditsItem: React.FC<CreditsItemProps> = ({ handler }) => {
  return (
    <Box
      role="button"
      sx={{
        paddingY: 1.5,
        paddingX: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: (theme) => `1px solid ${theme.palette.brand.charcoal[300]}`,
        '&:nth-last-child(1)': {
          border: 'none',
        },
        cursor: 'pointer',
      }}
      onClick={() => handler('ABC1234')}
    >
      <Typography level="caption1">
        You have <Typography color="primary">1000 credits</Typography>! Redeem now.
      </Typography>
    </Box>
  );
};
export default CreditsItem;
