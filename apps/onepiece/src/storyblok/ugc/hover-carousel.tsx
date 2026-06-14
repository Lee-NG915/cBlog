import React from 'react';
import { Carousel } from '../components';

export type HoverCarouselProps = {
  blok: object;
};

const HoverCarousel = ({ blok }: HoverCarouselProps) => {
  const settings = {
    slidesToShow: 2.38,
  };

  return <Carousel blok={blok} sliderSettings={settings} widthPercentage="81.28%" />;
};

export { HoverCarousel };
