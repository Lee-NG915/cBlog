'use client';
import { Box, Typography, Link } from '@castlery/fortress';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { FortressImage } from '../fortress-image/fortress-image';

const ECO_DELIVERY_CONFIG = {
  brandUrl: 'https://res.cloudinary.com/castlery/image/upload/v1701139572/Onepiece/eco_delivery_2.png',
  readMoreLink: 'https://www.maersk.com/transportation-services/eco-delivery',
};

export function EcoDeliveryDetails() {
  const { t } = useTranslation(LocalesNamespace.SHARED, { keyPrefix: 'ecoDelivery' });

  return (
    <>
      <Typography level="body2">{t('main.description' as any)}</Typography>

      <Box>
        <Typography
          level="subh1"
          sx={{
            mb: 2,
          }}
        >
          {t('whatThisMeansForYou.title' as any)}
        </Typography>
        <Typography level="body2">{t('whatThisMeansForYou.description' as any)}</Typography>
      </Box>

      <Box>
        <Typography
          level="subh1"
          sx={{
            mb: 2,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 'md',
          }}
        >
          {t('howItWorks.title' as any)}
        </Typography>
        <Typography level="body2">{t('howItWorks.description' as any)}</Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <FortressImage src={ECO_DELIVERY_CONFIG.brandUrl} alt={t('main.title' as any)} ratio={1995 / 1140} />
      </Box>

      <Typography level="body2" sx={{ mb: 1, display: 'block' }}>
        {t('tip' as any)}
      </Typography>

      <Box sx={{ textAlign: 'center' }}>
        <Link href={ECO_DELIVERY_CONFIG.readMoreLink} target="_blank" rel="noopener noreferrer">
          {t('readMoreLinkText' as any)}
        </Link>
      </Box>
    </>
  );
}
