'use client';

import { Box, Typography } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { toPrice } from '@castlery/utils';
import { WarrantyItemV1 } from '@castlery/types';
interface WarrantyOptionPresentationV1Props {
  warrantyItem: WarrantyItemV1;
}
export function WarrantyOptionPresentationV1({ warrantyItem }: WarrantyOptionPresentationV1Props) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PRODUCT, {
    keyPrefix: 'productLineItemInfo',
  });
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
      <Typography
        level="caption2"
        sx={{
          color: (theme) => theme.palette.brand.mono[700],
          textDecorationLine: warrantyItem.warrantyStatus === 'policyCanceled' ? 'line-through' : 'none',
        }}
      >
        {(t as any)('warrantyTipWithoutPrice', { durationMonths: warrantyItem.durationMonths })} /{' '}
        {toPrice(Number(warrantyItem.warrantyOfferPrice))}
      </Typography>
      {warrantyItem.warrantyStatus === 'policyCanceled' && (
        <Typography
          level="caption2"
          sx={{
            color: (theme) => theme.palette.brand.mono[700],
          }}
        >
          Cancelled
        </Typography>
      )}
    </Box>
  );
}

export default WarrantyOptionPresentationV1;
