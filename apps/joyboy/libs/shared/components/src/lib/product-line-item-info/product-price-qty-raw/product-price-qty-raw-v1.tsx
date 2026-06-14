'use client';

import { Box, Typography } from '@castlery/fortress';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';

export function ProductPriceQtyRawV1({ price, qty }: { price: string; qty: number }) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PRODUCT, {
    keyPrefix: 'productLineItemInfo',
  });
  const isFree = price?.toUpperCase() === 'FREE';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      <Typography level="caption1">
        {isFree ? (t as any)('priceQtyRawFree', { qty }) : (t as any)('priceQtyRaw', { price, qty })}
      </Typography>
    </Box>
  );
}
