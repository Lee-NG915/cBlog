import React from 'react';
import lang from 'utils/lang';
import { Stack, Typography, Link } from '@castlery/fortress';
import { globalFeatureInUS } from 'config';
import SvgIcon from 'components/SvgIcon';

const socialMap = {
  facebook: {
    icon: <SvgIcon name="outlined-facebook" width={24} height={24} />,
    ariaLabel: 'facebook link',
    href: lang.t('social.facebook'),
  },
  pinterest: {
    icon: <SvgIcon name="outlined-pinterest" width={24} height={24} />,
    ariaLabel: 'pinterest link',
    href: lang.t('social.pinterest'),
  },
  tiktok: {
    icon: <SvgIcon name="outlined-tiktok" width={24} height={24} />,
    ariaLabel: 'tiktok link',
    href: lang.t('social.tiktok'),
  },
  instagram: {
    icon: <SvgIcon name="outlined-instagram" width={24} height={24} />,
    ariaLabel: 'instagram link',
    href: lang.t('social.instagram'),
  },
};

const Social = () => (
  <Stack
    spacing={1}
    sx={{
      '--fortress-fontFamily-body': 'Aime',
    }}
  >
    <Typography level="h5">Social</Typography>
    <Stack direction="row" spacing={2}>
      {Object.entries(socialMap).map(([key, value]) => {
        if (!value) return;
        const { ariaLabel, href, icon } = value;
        return (
          <Link
            key={key}
            aria-label={ariaLabel}
            target="_blank"
            rel="noopener"
            href={href}
            sx={(theme) => ({
              color: '#F6F3E7',
              bgcolor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ':hover': {
                color: '#F6F3E7',
              },
              svg: {
                fill: '#F6F3E7',
                width: '32px',
                height: '32px',
                path: {
                  width: '24px',
                  height: '24px',
                },
              },
            })}
          >
            {icon}
          </Link>
        );
      })}
    </Stack>
    <Typography level="caption2">#AtHomeWithCastlery</Typography>
  </Stack>
);

export default Social;
