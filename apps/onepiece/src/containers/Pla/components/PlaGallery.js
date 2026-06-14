import React from 'react';
import PropTypes from 'prop-types';
import ProductGallery from 'containers/Product/components/ProductGallery';

import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from '../style.scss';

const PlaGallery = ({ forwardRef, handleScrollToDimension }) => {
  const { desktop } = useBreakpoints();
  return !desktop ? (
    <div className={style.plaGallery}>
      <ProductGallery />
    </div>
  ) : (
    <ProductGallery forwardRef={forwardRef} scrollToDimension={handleScrollToDimension} />
  );
};

PlaGallery.propTypes = {
  forwardRef: PropTypes.object,
  handleScrollToDimension: PropTypes.func,
};

export default PlaGallery;
