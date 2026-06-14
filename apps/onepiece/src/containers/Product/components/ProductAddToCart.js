import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'components/Button';
import { toPrice } from 'utils/number';
import { getHistory } from 'helpers/History';
import { selectedCurrentProductStockState, STOCK_STATE } from 'redux/modules/productOptions';
import { useSelector } from 'react-redux';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import lang from 'utils/lang';
import { usePrice } from '../hooks/price';
import { useAddProductToCart, useCart } from '../hooks/cart';
import { useCurrentProduct } from '../hooks/product';
import style from './style.scss';
import ProductPromotion from './ProductPromotion';

const ProductAddToCart = ({ showSticky, discontinued, warrantyInfo }) => {
  const { price } = usePrice();
  const product = useCurrentProduct();
  const clickHandler = useAddProductToCart(warrantyInfo);
  const cart = useCart();
  const stockState = useSelector(selectedCurrentProductStockState);
  const isOutOfStock = stockState === STOCK_STATE.OUT_OF_STOCK;
  const loading = cart.loading || cart.creating || cart.processing;
  const isCartLoaded = cart.loaded;
  const { desktop } = useBreakpoints();
  // Add product to cart when query atc in url is true, this is for testing out the Unbounce
  useEffect(() => {
    const history = getHistory();
    const { search, pathname } = history.getCurrentLocation();
    if (search?.includes('atc=true')) {
      if (!discontinued && !isOutOfStock && !loading && isCartLoaded) {
        clickHandler();
        history.replace({
          pathname,
          search: search.replace(/(\?)?atc=true/, ''),
        });
      }
    }
    // FIXME Wouldn't this lack of dependency be a problem?
  }, [isCartLoaded]);

  return (
    <>
      <ProductPromotion selector="PDP Promotion with API" product={product} rank="" />
      <ProductPromotion selector="PDP Promotion1 with API" product={product} rank="1" />
      <ProductPromotion selector="PDP Promotion2 with API" product={product} rank="2" />
      <div className={style.addToCart}>
        <Button
          data-selenium="add_to_cart"
          text={
            discontinued
              ? 'Unavailable'
              : isOutOfStock
              ? 'Out of stock'
              : `Add To Cart - ${lang.t('common.currency_symbol')}${price}`
          }
          block
          onClick={clickHandler}
          disabled={discontinued || isOutOfStock}
          loading={loading}
        />
      </div>
      {!desktop && (
        <div
          className={style.addToCartSticky}
          data-addtocart="mobile"
          style={{ display: showSticky ? 'flex' : 'none' }}
        >
          <div className={`${style.addToCartSticky}__intro`}>
            <div className={`${style.addToCartSticky}__intro-head`}>{product.name}</div>
            <div className={`${style.addToCartSticky}__intro-price`}>{toPrice(price)}</div>
          </div>
          <Button
            data-selenium="add_to_cart_mobile"
            type="button"
            text={discontinued ? 'Unavailable' : isOutOfStock ? 'Out of stock' : `Add To Cart`}
            onClick={clickHandler}
            disabled={discontinued || isOutOfStock}
            loading={loading}
          />
        </div>
      )}
    </>
  );
};

ProductAddToCart.propTypes = {
  showSticky: PropTypes.bool,
  discontinued: PropTypes.bool,
  warrantyInfo: PropTypes.object,
};

export default ProductAddToCart;
