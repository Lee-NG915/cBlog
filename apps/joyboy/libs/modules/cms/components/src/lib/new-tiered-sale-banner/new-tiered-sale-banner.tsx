'use client';

import { Stack, Typography } from '@castlery/fortress';
import React from 'react';
import { NewTieredItemStoryblok, NewTieredSaleBannerStoryblok } from '@castlery/types';
import Slider from 'react-slick';
import { DtStack } from '@castlery/modules-tracking-components';

interface NewTieredItemProps {
  blok: NewTieredItemStoryblok;
}

const NewTieredItem = ({ blok }: NewTieredItemProps) => {
  const { sub_header, text } = blok;
  return (
    <Stack
      sx={{
        alignItems: 'center',
        minWidth: { xs: '278px', md: 'auto' },
        flex: { xs: 'none', md: '1 1 auto' },
      }}
    >
      <Typography
        level="subh2"
        sx={(theme) => ({
          color: theme.palette.brand.maroonVelvet[500],
          mb: { xs: '4px', md: '8px' },
          fontWeight: 400,
        })}
      >
        {sub_header.toLocaleUpperCase()}
      </Typography>
      <Typography
        level="body2"
        sx={(theme) => ({
          color: theme.palette.brand.maroonVelvet[500],
        })}
      >
        {text}
      </Typography>
    </Stack>
  );
};

interface NewTieredSaleBannerProps {
  blok: NewTieredSaleBannerStoryblok;
}

const NewTieredSaleBanner = ({ blok }: NewTieredSaleBannerProps) => {
  const { items, _uid } = blok;

  return (
    <DtStack useImpression key={_uid} uid={_uid} componentName="New Tiered Sale Banner">
      {/* Desktop layout */}
      <Stack
        sx={(theme) => ({
          display: { xs: 'none', md: 'flex' },
          width: '100%',
          backgroundColor: theme.palette.brand.warmLinen[500],
          py: '20px',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        })}
      >
        {items.map((item) => (
          <NewTieredItem key={item._uid} blok={item} />
        ))}
      </Stack>

      {/* Mobile layout */}
      <Stack
        sx={(theme) => ({
          display: { xs: 'flex', md: 'none' },
          position: 'relative',
          height: '103px',
          paddingTop: '16px',
          width: '100%',
          backgroundColor: theme.palette.brand.warmLinen[500],
          '.slick-track': {
            display: 'flex',
          },
          '.slick-list': {
            overflow: 'hidden',
          },
          '.slick-slide': {
            div: {
              position: 'relative',
            },
          },
          '.slick-dots': {
            display: 'flex !important',
            position: 'absolute',
            bottom: '16px',
            width: '155px',
            left: '50%',
            transform: 'translateX(-50%)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
            margin: 0,
            '.slick-active': {
              backgroundColor: theme.palette.brand.mono[700],
            },
            li: {
              minWidth: '8px',
              minHeight: '8px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.palette.brand.mono[300]}`,
              'list-style-type': 'none',
              marginRight: '8px',
            },
            button: {
              display: 'none',
            },
          },
        })}
      >
        <Slider
          arrows={false}
          dots={true}
          slidesToShow={1}
          slidesToScroll={1}
          infinite={true}
          autoplay={true}
          autoplaySpeed={3000}
          pauseOnHover={true}
        >
          {items.map((item) => (
            <NewTieredItem key={item._uid} blok={item} />
          ))}
        </Slider>
      </Stack>
    </DtStack>
  );
};

export { NewTieredSaleBanner };
