'use client';
import React from 'react';
import { Link, Typography, Stack, Box, Button, useBreakpoints } from '@castlery/fortress';
import { OutlinedFacebook, OutlinedPinterest, OutlinedTiktok, OutlinedInstagram } from '@castlery/fortress/Icons';
import { EcEnv } from '@castlery/config';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';

export function MaintenanceView() {
  const { mobile } = useBreakpoints();
  const countryCode = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();

  const { t } = useTranslation(LocalesNamespace.SHARED, {
    keyPrefix: 'common',
  });
  const contactUsLink =
    EcEnv.NEXT_PUBLIC_COUNTRY === 'SG' ? `https://wa.me/${t('whatsapp.value')}` : `tel:${t('telephone.value')}`;

  return (
    <Box
      sx={{
        backgroundImage: `url(https://res.cloudinary.com/castlery/image/upload/v1760060120/Website%20Tech/maintenance-page-bg.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100vh',
        '&:after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <Box
        sx={{
          width: mobile ? '80%' : 1110,
          height: 430,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 'auto',
          textAlign: 'center',
          zIndex: 'var(--fortress-zIndex-modal)',
        }}
      >
        <Typography level="h1" sx={{ marginBottom: 6, color: (theme) => theme.palette.brand.warmLinen[500] }}>
          Be right back
        </Typography>
        <Box sx={{ marginBottom: 7, color: (theme) => theme.palette.brand.warmLinen[500] }}>
          <Typography level="body1">
            We’re updating the site to make your experience even better. Thanks for hanging tight.
          </Typography>
          <Typography level="body1">- The Castlery Team</Typography>
        </Box>
        <Button variant="primary" component={Link} href={contactUsLink} sx={{ marginBottom: 10 }}>
          CONTACT US
        </Button>
        <Typography level="h5" sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }}>
          Follow our socials
        </Typography>
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            zIndex: 'var(--fortress-zIndex-modal)',
            my: 2,
          }}
        >
          <Link variant="tertiary" href={`https://www.facebook.com/Castlery${countryCode}/`} sx={{ p: 1 }}>
            <OutlinedFacebook sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }} />
          </Link>
          <Link variant="tertiary" href={`https://www.pinterest.com/castlery${countryCode}/`} sx={{ p: 1 }}>
            <OutlinedPinterest sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }} />
          </Link>
          <Link variant="tertiary" href={`https://www.tiktok.com/@castlery${countryCode}/`} sx={{ p: 1 }}>
            <OutlinedTiktok sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }} />
          </Link>
          <Link variant="tertiary" href={`https://www.instagram.com/castlery${countryCode}/`} sx={{ p: 1 }}>
            <OutlinedInstagram sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }} />
          </Link>
        </Stack>
        <Typography level="caption2" sx={{ color: (theme) => theme.palette.brand.warmLinen[500] }}>
          #AtHomeWithCastlery
        </Typography>
      </Box>
    </Box>
  );
}
