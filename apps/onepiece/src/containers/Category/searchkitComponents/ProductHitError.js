import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@castlery/fortress';
import ProductNoHitDy from './ProductNoHitDy';

const ProductHitError = ({ bemBlocks }) => (
  <>
    <div data-qa="no-hits" className={bemBlocks.container()}>
      <div className={bemBlocks.container('info')}>An error has occurred!</div>
    </div>
    <Container fixed>
      <ProductNoHitDy />
    </Container>
  </>
);

ProductHitError.propTypes = {
  bemBlocks: PropTypes.object,
};

export default ProductHitError;
