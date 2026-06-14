'use client';

import { Box, Typography } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

interface WarrantyOptionPresentationProps {
  warrantyOfferPrice: string; //warranty_offer_price
  durationMonths: string; //duration_months
}
export function WarrantyOptionPresentation({ warrantyOfferPrice, durationMonths }: WarrantyOptionPresentationProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PRODUCT, {
    keyPrefix: 'productLineItemInfo',
  });
  return (
    <Box>
      <Typography
        level="caption2"
        sx={{
          color: (theme) => theme.palette.brand.mono[700],
        }}
      >
        {t('warrantyTipWithoutPrice', { durationMonths })}
      </Typography>
    </Box>
  );
}

export default WarrantyOptionPresentation;
