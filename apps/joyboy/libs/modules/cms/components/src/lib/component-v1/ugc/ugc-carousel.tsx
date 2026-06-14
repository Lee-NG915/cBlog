'use client';

import React from 'react';
import { Carousel } from '../components/Carousel';

export type UGCCarouselProps = {
  blok: object;
};

const UGCCarousel = ({ blok }: UGCCarouselProps) => {
  const settings = {
    slidesToShow: 4,
  };

  return <Carousel blok={blok} sliderSettings={settings} widthPercentage="70%" />;
};

export { UGCCarousel };
