'use client';
import { accessInSG, accessInUS, EcEnv } from '@castlery/config';
import { Box, Typography, Stack, useBreakpoints, Container, WebLOGO } from '@castlery/fortress';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';

export const WebHeader = () => {
  const { t } = useTranslation(LocalesNamespace.SHARED);
  const { desktop, mobile } = useBreakpoints();
  return (
    <Container
      sx={{
        flex: '0 0 auto',
        maxWidth: '100vw !important',
      }}
      disableGutters
    >
      <Box
        component="header"
        sx={{
          px: 6,
          py: 4,
          display: 'flex',
          justifyContent: desktop ? 'space-between' : 'center',
          alignItems: 'center',
          background: (theme) => theme.palette.brand.warmLinen[500],
        }}
      >
        <Stack sx={{ px: 2 }}>
          {/* <CustomLink href={`${basePageConfig?.home}`}>
            <FortressImage src={textLogo} alt="castlery" imageWidth={200} imageHeight={50} ratio={4} sizes={'200px'} />
          </CustomLink> */}
          <WebLOGO usedInMobile={mobile} />
        </Stack>
        {desktop && (
          <Stack direction={'column'} sx={{ textAlign: 'right', gap: 1 }}>
            <Typography
              level="h4"
              sx={{
                a: {
                  color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                  textDecoration: 'none',
                },
              }}
            >
              Need help?&nbsp;
              {EcEnv.NEXT_PUBLIC_COUNTRY === 'SG' ? (
                <a href={`https://wa.me/${t('common.whatsapp.value')}`}>WhatsApp {t('common.whatsapp.presentation')}</a>
              ) : (
                <a href={`tel:${t('common.telephone.value')}`}>{t('common.telephone.presentation')}</a>
              )}
            </Typography>
            <Typography level="body1" sx={{ color: (theme) => theme.palette.brand.terracotta[500] }}>
              {accessInSG && 'Mon - Sun: 10:00am - 9:00pm'}
              {accessInUS && 'Mon - Fri: 10:00am - 6:00pm'}
            </Typography>
          </Stack>
        )}
      </Box>
    </Container>
  );
};
