import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Switch from 'components/Form/Switch';
import { useDispatch, useSelector } from 'react-redux';
import { useFrame } from 'hooks/frame';
import { ShippingPopup } from 'containers/Product/components/Shipping';
import { selectedShippingLocation } from 'redux/modules/geolocation';
import { fetchInventoryRegionCode } from 'redux/modules/products';
import { EVENT_CART_SHIPPING } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const QuickshipSwitch = ({ active, onClick }) => {
  const frame = useFrame();
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const shippingLocation = useSelector(selectedShippingLocation);

  const handleSubmit = useCallback(
    async (locationValue) => {
      await dispatch(fetchInventoryRegionCode({ frame, onClick, shippingLocation: locationValue }));
    },
    [dispatch, frame, onClick]
  );

  const handleChangeSwitch = useCallback(
    async (checked) => {
      if (checked) {
        await dispatch(fetchInventoryRegionCode({ frame, onClick, shippingLocation }));
      } else {
        onClick(false);
      }
    },
    [dispatch, frame, onClick, shippingLocation]
  );
  useEffect(() => {
    if (!shippingLocation.inventoryRegionCode && active) {
      handleChangeSwitch(true);
    }
    // When switching zipcode elsewhere, the inventoryRegionCode cannot be obtained.
  }, [active, handleChangeSwitch, onClick, shippingLocation.inventoryRegionCode]);

  const openShippingPopup = useCallback(() => {
    dispatch({
      type: EVENT_CART_SHIPPING,
      result: {
        action: 'click_default_zipcode',
      },
    });
    const content = (
      <ShippingPopup
        onSubmit={handleSubmit}
        title="Shipping Location"
        description="Enter your location post code to get an accurate estimate shipping info."
        useGooglePlace={false}
      />
    );

    if (!desktop) {
      frame.openModal(
        'mobileModal',
        {
          content,
        },
        { height: 40, styleOverflow: 'initial' }
      );
    } else {
      frame.addModal(content, 'side', {
        dismiss: () => frame.removeModal(),
        position: 'right',
        maxWidth: 500,
      });
    }
  }, [frame, handleSubmit]);

  return (
    <div>
      <div className={`${style.quickship}__row`}>
        <Switch checked={active} onChange={handleChangeSwitch} />
        <span className={`${style.quickship}__text`}>Quickship to</span>
        <button className={` ${style.quickship}__label`} type="button" onClick={openShippingPopup}>
          {shippingLocation.zipcode}
        </button>
      </div>
    </div>
  );
};
QuickshipSwitch.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
export default QuickshipSwitch;
