'use client';
import { Box, Typography, Stack, useBreakpoints, Link } from '@castlery/fortress';
import { Lock } from '@castlery/fortress/Icons';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { getDate } from '@castlery/utils';

export const WebCheckoutFooter = () => {
  const { desktop } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutFooter' as any,
  });

  const year = getDate().getFullYear();

  const renderDesktopContent = () => {
    return (
      <>
        <Stack>
          <Typography level="caption1" sx={{ color: 'inherit' }} startDecorator={<Lock />}>
            {t('secureCheckout')}
          </Typography>
        </Stack>
        <Stack>
          <Typography level="caption1" sx={{ color: 'inherit' }}>
            &copy;{t('copyright', { year })}
          </Typography>
        </Stack>
      </>
    );
  };
  const renderMobileContent = () => {
    return (
      <>
        <Stack direction="column" gap={2}>
          <Link
            variant="tertiary"
            level="body1"
            underline="none"
            href={t('helpLink' as any)}
            target="_blank"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              textAlign: 'right',
              gap: 1,
            }}
          >
            {t('helpTip' as any)}
          </Link>
          <Typography level="body1" sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }}>
            {t('helpContent' as any)}
          </Typography>
        </Stack>

        <Stack>
          <Typography level="caption1" sx={{ color: 'inherit' }} startDecorator={<Lock />}>
            {t('shortSecureCheckout')}
          </Typography>
        </Stack>
        <Stack>
          <Typography level="caption1" sx={{ color: 'inherit' }}>
            &copy;{t('shortCopyright', { year })}
          </Typography>
        </Stack>
      </>
    );
  };

  return (
    <Box
      component="header"
      sx={{
        px: 6,
        py: 7,
        display: 'flex',
        flexDirection: desktop ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: (theme) => theme.palette.brand.terracotta[500],
        color: (theme) => theme.palette.brand.warmLinen[500],
        gap: 3,
      }}
    >
      {desktop ? renderDesktopContent() : renderMobileContent()}
    </Box>
  );
};

export default WebCheckoutFooter;
