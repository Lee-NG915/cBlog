import React from 'react';
import { Box } from '@castlery/fortress';
import { useShippingPopup } from 'containers/Product/hooks/useShippingPopup';
import type { ZipcodeRes } from 'containers/Product/hooks/useShippingPopup';
import { handleChangeShippingLocation } from 'redux/modules/geolocation';
import { handleShippingLocationInCart } from 'redux/modules/cart';
import { useDispatch } from 'react-redux';
import { EVENT_CART_SHIPPING } from 'utils/track/constants';
import { useAlertMsg } from './Toast';
import ZipChip from './ZipChip';

interface ZipCodeBannerProps {
  fullCart: boolean;
}
const ZipCodeBanner: React.FC<ZipCodeBannerProps> = ({ fullCart }) => {
  const dispatch = useDispatch();
  const { show: showAlert, alertProps, AlertMsg } = useAlertMsg();
  const [showBanner, setShowBanner] = React.useState<boolean>(true);

  const changeZip = async (data: ZipcodeRes, frame: any) => {
    dispatch(handleChangeShippingLocation(data));
    dispatch(
      handleShippingLocationInCart(data, frame, () => {
        showAlert();
        setShowBanner(false);
      })
    );
  };

  const [openZipSelection] = useShippingPopup({ changeHandler: changeZip });
  const handleOpen = () => {
    dispatch({
      type: EVENT_CART_SHIPPING,
      result: {
        action: 'click_default_zipcode',
        rewriteLabel: (label: string) => `${label}_banner`,
      },
    });

    openZipSelection();
  };
  return (
    <Box>
      {showBanner && <ZipChip fullCart={fullCart} action={handleOpen} />}
      <AlertMsg
        {...alertProps}
        getContainer={fullCart ? () => document.querySelector('#root') : () => document.querySelector('#modal')}
      />
    </Box>
  );
};

export default React.memo(ZipCodeBanner);
