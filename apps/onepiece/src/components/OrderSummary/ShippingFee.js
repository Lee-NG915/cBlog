import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { toPrice } from 'utils/number';
import { ShippingPopup } from 'containers/Product/components/Shipping';
import { handleShippingLocationInCart } from 'redux/modules/cart';
import { handleChangeShippingLocation, selectedShippingLocation } from 'redux/modules/geolocation';
import { EVENT_CART_SHIPPING } from 'utils/track/constants';
import { Edit as EditIcon } from '@castlery/fortress/Icons';

import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const ShippingFee = ({ shipmentTotal, shipmentOriginal, hideChangeBtn, showMask, showEstimateShipping }, { frame }) => {
  const dispatch = useDispatch();
  const order = useSelector((state) => state.cart.data);
  const shippingLocation = useSelector(selectedShippingLocation);
  const items = order && [...order.line_items, ...order.addon_service_line_items];
  const hasItems = !!(order && items.length > 0);
  const { desktop } = useBreakpoints();
  const shippingLocationText = useMemo(() => {
    const isMobile = !desktop;
    const city = isMobile ? '' : shippingLocation.city ? `${shippingLocation.city}, ` : '';
    const text = `${city}${shippingLocation.zipcode}`;
    return text;
  }, [shippingLocation.city, shippingLocation.zipcode, desktop]);

  const handleSubmit = useCallback(
    async (data) => {
      dispatch(handleChangeShippingLocation(data));
      await dispatch(handleShippingLocationInCart(data, frame));
    },
    [dispatch, frame]
  );

  const handleMobileZipCodeClick = useCallback(() => {
    dispatch({
      type: EVENT_CART_SHIPPING,
      result: {
        action: 'click_default_zipcode',
      },
    });

    if (!desktop) {
      frame.openModal(
        'mobileModal',
        {
          content: <ShippingPopup onSubmit={handleSubmit} useGooglePlace={false} />,
        },
        { height: 40, styleOverflow: 'initial' }
      );
    } else {
      frame.addModal(<ShippingPopup onSubmit={handleSubmit} useGooglePlace={false} />, 'side', {
        dismiss: () => frame.removeModal(),
        position: 'right',
        maxWidth: 500,
        showMask,
      });
    }
  }, [dispatch, frame, handleSubmit, showMask, desktop]);

  const ShippingTip = (
    <>
      {showEstimateShipping ? (
        <div className={`${style.row}__tip__new`}>
          Estimated Shipping{' '}
          {!hideChangeBtn && (
            <>
              <span onClick={handleMobileZipCodeClick} role="button" className={`${style.row}--underline`}>
                {shippingLocationText}
              </span>
              <EditIcon
                onClick={handleMobileZipCodeClick}
                fontSize="xl2"
                sx={{
                  cursor: 'pointer',
                  ml: 0.5,
                  color: '#D25C1B',
                  fill: '#D25C1B',
                  svg: {
                    fill: '#D25C1B',
                    color: '#D25C1B',
                  },
                }}
              />
            </>
          )}
        </div>
      ) : (
        <>
          Shipping{' '}
          {!hideChangeBtn && (
            <>
              (
              <span onClick={handleMobileZipCodeClick} role="button" className={`${style.row}--underline`}>
                {`${shippingLocation.city}, ${shippingLocation.zipcode}`}
              </span>
              )
            </>
          )}
        </>
      )}
    </>
  );

  return (
    <div className={style.row} data-selenium="cart-shipping">
      <div className={`${style.row}__tip`}>{ShippingTip}</div>
      {shipmentOriginal === shipmentTotal ? (
        <span data-selenium="order-shipment-total">{toPrice(shipmentTotal, hasItems)}</span>
      ) : (
        <div className={style.shippingCap}>
          <span data-selenium="order-shipment-original">{toPrice(shipmentOriginal, hasItems)}</span>
          <span data-selenium="order-shipment-total">{toPrice(shipmentTotal, hasItems)}</span>
        </div>
      )}
    </div>
  );
};
ShippingFee.propTypes = {
  shipmentTotal: PropTypes.number,
  shipmentOriginal: PropTypes.number,
  hideChangeBtn: PropTypes.bool,
  showMask: PropTypes.bool,
  showEstimateShipping: PropTypes.bool,
};
ShippingFee.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};
ShippingFee.defaultProps = {
  showMask: true,
};
export default ShippingFee;
