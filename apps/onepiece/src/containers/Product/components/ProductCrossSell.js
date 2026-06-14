import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ProductList from 'components/ProductList';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import LazyLoad from 'react-lazyload';
import { useCurrentProduct } from '../hooks/product';
import style from './style.scss';
import ProductRecommendation from './ProductRecommendation';

const Collection = ({ productsId, title }) => (
  <>
    <h2>{title}</h2>
    <div>
      <ProductList listName={`Product - ${title}`} products={productsId} type="new" isUsedInPDP />
    </div>
  </>
);

Collection.propTypes = {
  productsId: PropTypes.array,
  title: PropTypes.string,
};

const CrossSell = () => {
  const product = useCurrentProduct();
  const { desktop } = useBreakpoints();

  return (
    <Container
      component="section"
      fixed
      className={classNames({
        [style.crossSell]: true,
      })}
      disableGutters={!desktop}
    >
      {/* same collection */}
      <div className={`${style.crossSell}__list`}>
        {product.collections?.length > 0 && <Collection title="Shop The Collection" productsId={product.collections} />}
      </div>

      {/* similar products */}
      <div className={`${style.crossSell}__list`}>
        <LazyLoad offset={300} once>
          <ProductRecommendation
            variantId={product?.id}
            selector="PDP Recommendation API #2"
            extraWidget={
              product.cross_sell?.length > 0 ? (
                <Collection title="Goes Well With" productsId={product.collections} />
              ) : (
                <></>
              )
            }
          />
        </LazyLoad>
        {/* <div data-campaign="PDP Recommendation Widget #2">
          {product.cross_sell?.length > 0 && <Collection title="Goes Well With" productsId={product.collections} />}
        </div> */}
      </div>

      {/* recent viewed products */}
      <div className={`${style.crossSell}__list`}>
        <LazyLoad offset={300} once>
          <ProductRecommendation variantId={product?.id} selector="PDP Recommendation API #3" />
        </LazyLoad>
        {/* <div data-campaign="PDP Recommendation Widget #3" /> */}
      </div>
    </Container>
  );
};

export default CrossSell;
