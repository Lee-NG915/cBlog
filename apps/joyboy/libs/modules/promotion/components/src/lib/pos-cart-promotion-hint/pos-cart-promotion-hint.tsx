'use client';
import React from 'react';
import { Box } from '@castlery/fortress';
import { PromotionHint } from '../promotion-hint/promotion-hint';

export const PosCartPromotionHint = React.memo(function PosCartPromotionHint() {
  return (
    <Box sx={{ p: 2 }}>
      <PromotionHint showCreditBanner={false} showZipCodeBanner={false} />
    </Box>
  );
});

PosCartPromotionHint.displayName = 'PosCartPromotionHint';
