'use client';
import React from 'react';
import { Box, Typography, Link, useBreakpoints, Stack } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { EcEnv } from '@castlery/config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

/**
 * WebCheckoutHeader component
 * @see https://castlery.atlassian.net/wiki/x/woDCtw
 * @returns WebCheckoutHeader component
 */
export const WebCheckoutHeader = () => {
  const textLogo = 'https://res.cloudinary.com/castlery/image/upload/v1751874448/Website%20Tech/castlery-text-logo.png';
  const homeUrl = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`;
  const { desktop } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPageHeader',
  });

  return (
    <Box
      component="header"
      sx={{
        px: 6,
        ...(desktop ? { py: 4 } : { py: 1 }),
        display: 'flex',
        justifyContent: desktop ? 'space-between' : 'center',
        alignItems: 'center',
        background: (theme) => theme.palette.brand.warmLinen[500],
      }}
    >
      <Link href={homeUrl} sx={{ px: 2 }}>
        <FortressImage src={textLogo} alt="castlery" imageWidth={200} imageHeight={50} ratio={4} />
      </Link>
      {desktop ? (
        <Stack>
          <Link
            variant="secondary"
            level="h4"
            underline="none"
            href={t('link' as any)}
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
            {t('helpGuide' as any)}
          </Link>
          <Typography level="body1" sx={{ color: (theme) => theme.palette.brand.terracotta[500] }}>
            {t('accessTime' as any)}
          </Typography>
        </Stack>
      ) : null}
    </Box>
  );
};

export default WebCheckoutHeader;
