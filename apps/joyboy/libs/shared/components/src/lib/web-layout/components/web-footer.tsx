'use client';
import { Box, Typography, Stack, Container, useBreakpoints } from '@castlery/fortress';
import { Lock } from '@castlery/fortress/Icons';
import { accessInAU, accessInSG, accessInUS, EcEnv } from '@castlery/config';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { getDate } from '@castlery/utils';

export const WebFooter = () => {
  const { t } = useTranslation(LocalesNamespace.SHARED);
  const { desktop } = useBreakpoints();
  return (
    <Container
      sx={{
        flex: '0 0 auto',
        maxWidth: '100vw !important',
      }}
      disableGutters
    >
      <Box
        component="footer"
        sx={{
          px: 6,
          py: 7,
          display: 'flex',
          alignItems: 'center',
          background: (theme) => theme.palette.brand.terracotta[500],
          color: (theme) => theme.palette.brand.warmLinen[500],
        }}
      >
        <Stack
          direction={desktop ? 'row' : 'column'}
          justifyContent={desktop ? 'space-between' : 'center'}
          alignItems={'center'}
          gap={desktop ? 0 : 6}
          sx={{
            width: '100%',
          }}
        >
          {!desktop && (
            <Stack justifyContent="center" alignItems="center">
              <Typography
                level="h4"
                sx={{
                  color: (theme) => theme.palette.brand.warmLinen[500],
                  a: {
                    color: 'var(--fortress-palette-brand-warmLinen-500)',
                    textDecoration: 'none',
                  },
                  fontWeight: 'var(--fortress-fontWeight-xl)',
                }}
              >
                Need help?&nbsp;
                {EcEnv.NEXT_PUBLIC_COUNTRY === 'SG' ? (
                  <a href={`https://wa.me/${t('common.whatsapp.value')}`}>
                    WhatsApp{t('common.whatsapp.presentation')}
                  </a>
                ) : (
                  <a href={`tel:${t('common.telephone.value')}`}>Call us:&nbsp;{t('common.telephone.presentation')}</a>
                )}
              </Typography>
              <Typography level="body1" sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }}>
                {accessInSG && 'Mon - Sun: 10:00am - 9:00pm'}
                {accessInAU && 'Mon - Fri: 9:30am - 8:00pm, Sat - Sun: 10:00am - 8:00pm'}
                {accessInUS && 'Mon - Fri: 10:00am - 6:00pm'}
              </Typography>
            </Stack>
          )}
          <Stack direction={'row'}>
            <Typography level="caption1" sx={{ color: 'inherit' }} startDecorator={<Lock />}>
              Secure Checkout.All transactions are encrypted.
            </Typography>
            {/* {desktop && (
              <Typography level="caption1" sx={{ color: 'inherit' }}>
                All transactions are encrypted.
              </Typography>
            )} */}
          </Stack>
          <Stack>
            <Typography level="caption1" sx={{ color: 'inherit' }}>
              &copy; {getDate().getFullYear()} Castlery. All rights reserved.
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};
