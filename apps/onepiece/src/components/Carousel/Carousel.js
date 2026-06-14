/**
 * @description Carousel component autoplay
 * @property children <elements>
 * @property className <string> class for root
 */

import React from 'react';
import Slick from 'react-slick';
import SvgIcon from 'components/SvgIcon';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import PropTypes from 'prop-types';
import style from './style.scss';

const PrevArrow = ({ currentSlide, slideCount, ...props }) => (
  <div {...props}>
    <SvgIcon name="line-left-arrow" hoverColor="primary" />
  </div>
);
const NextArrow = ({ currentSlide, slideCount, ...props }) => (
  <div {...props}>
    <SvgIcon name="line-right-arrow" hoverColor="primary" />
  </div>
);
const Carousel = ({ children, className, ...props }) => {
  const { desktop } = useBreakpoints();
  const slickSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: desktop,
    autoplay: true,
    autoplaySpeed: 5000,
    customPaging: () => <div className={`${style.carousel}__dot`} />,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    ...props,
  };
  return (
    <div className={`${style.carousel} ${className}`}>
      <Slick {...slickSettings}>{children}</Slick>
    </div>
  );
};
Carousel.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  className: PropTypes.string,
};
export default Carousel;
