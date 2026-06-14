import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { loadIfNeeded as loadAddress, addAddress } from 'redux/modules/address';
import { confirmAddress, addCoupon } from 'redux/modules/cart';
import { getUrl } from 'pages';
import Spinner from 'components/Spinner';
import AddressList from 'components/Address/AddressList';
import Address from 'components/Address';
import AddressForm from 'components/Address/AddressForm';
import { get, remove } from 'helpers/Cookie';
import { ArrowBtn } from 'components/Button';
import { spliceByErrorTitle } from 'utils/error';
import { EVENT_ADD_ADDRESS } from 'utils/track/constants';
import style from './style.scss';

const ShippingAddress = (props, { frame, router }) => {
  const cart = useSelector((state) => state.cart);
  const addressState = useSelector((state) => state.address);
  const user = useSelector((state) => state.auth.user);
  const [addVisible, setAddVisible] = useState(false);
  const [continueVisible, setContinueVisible] = useState(true);
  const [formMode, setFormMode] = useState('');
  const [newAddress, setNewAddress] = useState({});
  const dispatch = useDispatch();

  const { data: order, processing: cartProcessing } = cart;
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { loading, data: addresses, processing: addressProcessing } = addressState;
  const processing = cartProcessing || addressProcessing;
  const showAddressList = (user && addresses.length > 0) || order.ship_address;

  const showError = useCallback(
    (error, address) => {
      if (error?.errors?.[0].code === 40011 && address) {
        if (!frame.isModalShown()) {
          frame.openModal('subscription', {
            type: 'ZIPCODE_FAILURE_POPUP',
            zipcode: address.zipcode,
          });
        }
      } else {
        spliceByErrorTitle(error);
        frame.openModal('response', { body: error });
      }
    },
    [frame]
  );

  const goToShippingMethod = useCallback(() => {
    router.push(getUrl('checkout-shipping-method'));
  }, [router]);

  const selectAddress = useCallback(
    (address) =>
      dispatch(
        confirmAddress({
          ...address,
        })
      ),
    [dispatch]
  );

  const dispatchAddAddress = useCallback(
    (address) => {
      const request = dispatch(addAddress(address));
      request.then(() => {
        const { city, country, zipcode } = address;
        dispatch({
          type: EVENT_ADD_ADDRESS,
          result: {
            addedLocation: `${city || country} ${zipcode || ''}`,
          },
        });
      });
      return request;
    },
    [dispatch]
  );

  const addAndSelectAddress = useCallback(
    (address) => {
      const request = dispatchAddAddress(address);
      request.then((addresses) => {
        const selectedAddr = addresses[addresses.length - 1];
        selectAddress(selectedAddr).catch((err) => {
          showError(err, selectedAddr);
        });
      });
      return request;
    },
    [dispatchAddAddress, selectAddress, showError]
  );

  const handleSelectAddress = useCallback(
    (address) => {
      if (!address) {
        setSelectedAddress(null);
        return;
      }
      const promise = selectAddress(address);
      promise.catch((error) => showError(error, address));
      return promise;
    },
    [selectAddress, showError]
  );

  const handleAddAddress = useCallback((address) => addAndSelectAddress(address), [addAndSelectAddress]);

  const handleContinue = useCallback(
    () =>
      // select the address again in case user stays on shipping address page for a long time.
      selectAddress(selectedAddress)
        .then(goToShippingMethod)
        .catch((error) => showError(error, selectedAddress)),
    [goToShippingMethod, showError, selectedAddress, selectAddress]
  );

  useEffect(() => {
    if (user) {
      dispatch(loadAddress());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (order.ship_address && !order.ship_address.is_temporary && order.ship_address.is_shippable) {
      setSelectedAddress(order.ship_address);
    } else {
      setSelectedAddress(null);
    }
  }, [order.ship_address]);

  useEffect(() => {
    const coupon = get('castlery_podcast');
    if (coupon && !order.coupon) {
      dispatch(addCoupon(coupon)).catch((err) => {
        const shouldRemove = err.errors
          ? !err.errors[0].title.startsWith("This Coupon Code Can't Be Applied To Orders Less Than")
          : true;
        if (shouldRemove) {
          remove('castlery_podcast');
        }
        frame.openModal('response', { body: err });
      });
    }
  }, [dispatch, frame, order.coupon]);

  const handleNewAddress = (data, mode) => {
    setNewAddress(data);
    setFormMode('edit');
    setAddVisible(true);
  };

  const handleCancel = () => {
    setAddVisible(false);
  };

  const handleAddContinue = useCallback(
    (data) =>
      handleAddAddress(data).then(() => {
        setAddVisible(false);
      }),
    [handleAddAddress]
  );

  const handleContinueVisible = (visible) => {
    setContinueVisible(visible);
  };

  let rendered;

  if (loading) {
    rendered = (
      <div className={`${style.shipping}__loading`}>
        <Spinner />
      </div>
    );
  } else if (showAddressList) {
    rendered = (
      <AddressList
        title="Add a new shipping address"
        addresses={addresses}
        onAddAddress={handleAddAddress}
        onSelectAddress={handleSelectAddress}
        selectedAddress={selectedAddress}
        handleContinueVisible={handleContinueVisible}
        showEditButton
      />
    );
  } else {
    rendered = addVisible ? (
      <AddressForm
        address={newAddress}
        newUser={!showAddressList}
        onCancel={handleCancel}
        onSubmit={handleAddContinue}
        mode={formMode}
      />
    ) : (
      (rendered = <Address className={`${style.shipping}__newUser`} onSubmit={handleNewAddress} />)
    );
  }

  return (
    <div className={style.shipping}>
      <div className={`${style.shipping}__title`}>Shipping address</div>

      {rendered}

      {!loading && showAddressList && !addVisible && continueVisible && (
        <div className={style.btns}>
          <div />
          <div className={`${style.shipping}__next`}>
            <ArrowBtn
              text="Continue"
              size="medium"
              type="button"
              disabled={addressProcessing || !selectedAddress}
              data-selenium="checkout-shipping-address"
              onClick={handleContinue}
              className={`${style.shipping}__button`}
            />
          </div>
        </div>
      )}

      {processing && (
        <div className={style.mask}>
          <Spinner />
        </div>
      )}
    </div>
  );
};

ShippingAddress.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default ShippingAddress;
