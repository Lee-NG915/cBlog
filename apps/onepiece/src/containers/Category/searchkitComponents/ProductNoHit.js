import React from 'react';
import PropTypes from 'prop-types';
import { Container } from '@castlery/fortress';
import ProductNoHitDy from './ProductNoHitDy';

import style from './style.scss';

const ProductNoHit = ({ bemBlocks }) => (
  <>
    <div data-qa="no-hits" className={bemBlocks.container()}>
      <div className={bemBlocks.container('info')}>
        <div className={style.nohit}>
          We couldn’t find any results that matched your criteria, but tweaking your search may help.
        </div>
      </div>
    </div>
    <Container fixed>
      <ProductNoHitDy />
    </Container>
  </>
);

ProductNoHit.propTypes = {
  bemBlocks: PropTypes.object,
};

export default ProductNoHit;
