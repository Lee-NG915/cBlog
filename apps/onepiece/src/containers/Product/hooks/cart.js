import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { add as addToCart } from 'redux/modules/cart';
import ReactSVG from 'components/ReactSVG';
import { EVENT_LONG_LEAD_TIME, EVENT_MULBERRY_WARRANTY } from 'utils/track/constants';
import { selectedCurrentProductStockState, STOCK_STATE } from 'redux/modules/productOptions';
import { selectedShippingLocation } from 'redux/modules/geolocation';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { currency } from 'config';
import {
  useLocation,
  useMobileFrame,
  useCurrentProduct,
  useCurrentVariant,
  useCurrentSelectedVariants,
  useProductOptions,
} from './product';

const useCart = () => useSelector((state) => state.cart);

const useAddProductToCart = (warrantyInfo) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { frame } = useMobileFrame();
  const variant = useCurrentVariant();
  const product = useCurrentProduct();
  const selectedVariants = useCurrentSelectedVariants();
  const { quantity, isLongLeadTime, deliveryLeadTimeDisplay } = useProductOptions();
  const stockState = useSelector(selectedCurrentProductStockState);
  const shippingLocation = useSelector(selectedShippingLocation);
  const { desktop } = useBreakpoints();
  const listObject = useMemo(
    () => ({
      listName: location.state && location.state.listName,
      listPosition: location.state && location.state.listPosition,
    }),
    [location]
  );

  const trackLeadTime = useCallback(
    (detailAction) => {
      dispatch({
        type: EVENT_LONG_LEAD_TIME,
        result: {
          detailAction,
          label: `${variant.sku} | ${variant.name}`,
        },
      });
    },
    [dispatch, variant]
  );
  const trackMulberry = useCallback(() => {
    if (warrantyInfo?.isSelected) {
      const { label, skuId, skuName, position, price } = warrantyInfo;
      dispatch({
        type: EVENT_MULBERRY_WARRANTY,
        result: {
          detailAction: 'add_extended_warranty',
          label,
          skuId,
          skuName,
          position,
          price,
        },
      });
    }
  }, [dispatch, warrantyInfo]);

  const trackPixlee = () => {
    if (typeof pixlee_analytics !== 'undefined') {
      pixlee_analytics.events.trigger('add:to:cart', {
        product_sku: variant.sku,
        price: variant.price,
        quantity,
        currency,
      });
    }
  };

  const addProduct = useCallback(() => {
    trackMulberry();
    const promiseAddToCart = dispatch(
      addToCart({
        ...listObject,
        city: shippingLocation,
        product,
        variant,
        quantity,
        selectedVariants,
        warrantyInfo,
      })
    );
    trackPixlee();
    promiseAddToCart
      .then(() => {
        if (isLongLeadTime && stockState !== STOCK_STATE.OUT_OF_STOCK) {
          const deliveryLeadTime = deliveryLeadTimeDisplay.replace('Within ', '');

          trackLeadTime('popup_display');

          const handleClosePopup = () => {
            frame.removeModal();
            trackLeadTime('popup_close');

            frame.openModal('cart');
          };

          let options = [];
          if (desktop) {
            options = [
              {
                params: { deliveryLeadTime, variant },
                subOption: {
                  containerStyle: {
                    maxWidth: '620px',
                    borderRadius: 0,
                  },
                  dismiss: handleClosePopup,
                },
              },
            ];
          } else {
            options = [
              {
                params: { deliveryLeadTime, variant },
                subOption: {
                  closeHandler: handleClosePopup,
                  closeSVG: (
                    <ReactSVG
                      name="close"
                      style={{
                        height: '12px',
                        width: '12px',
                      }}
                    />
                  ),
                  styleOverflow: 'scroll',
                  closeDataSelenium: 'llt_close',
                },
              },
              { height: 70, styleOverflow: 'auto', dismiss: handleClosePopup },
            ];
          }

          return frame.openModal('lltPopup', ...options);
        }

        frame.openModal('cart');
      })
      .catch((error) => frame.openModal('response', { body: error }));
  }, [
    dispatch,
    listObject,
    frame,
    trackLeadTime,
    isLongLeadTime,
    stockState,
    deliveryLeadTimeDisplay,
    product,
    variant,
    shippingLocation,
    quantity,
    selectedVariants,
    warrantyInfo,
    trackMulberry,
  ]);

  return addProduct;
};

export { useAddProductToCart, useCart };
