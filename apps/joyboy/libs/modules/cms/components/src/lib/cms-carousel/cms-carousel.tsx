'use client';

import { Box, useBreakpoints } from '@castlery/fortress';
import { WebCarousel } from '@castlery/modules-product-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useMemo } from 'react';

export const CmsCarousel = (props: { blok: any }) => {
  const {
    image_ratio_mobile,
    banner_ratio_mobile,
    image_ratio_tablet,
    banner_ratio_tablet,
    image_ratio_desktop,
    banner_ratio_desktop,
  } = props.blok || {};
  const { desktop, mobile } = useBreakpoints();
  const image_ratio = useMemo(() => {
    if (desktop) {
      return image_ratio_desktop;
    } else if (mobile) {
      return image_ratio_mobile;
    } else {
      return image_ratio_tablet;
    }
  }, [desktop, image_ratio_desktop, image_ratio_mobile, image_ratio_tablet, mobile]);
  const banner_ratio = useMemo(() => {
    if (desktop) {
      return banner_ratio_desktop;
    } else if (mobile) {
      return banner_ratio_mobile;
    } else {
      return banner_ratio_tablet;
    }
  }, [banner_ratio_desktop, banner_ratio_mobile, banner_ratio_tablet, desktop, mobile]);
  return (
    <Box {...storyblokEditable(props.blok)} key={props.blok?._uid}>
      <WebCarousel {...props.blok} image_ratio={image_ratio} banner_ratio={banner_ratio} />
    </Box>
  );
};
