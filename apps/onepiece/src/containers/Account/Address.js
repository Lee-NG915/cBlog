import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { deleteAddress, loadIfNeeded as loadAddress, addAddress } from 'redux/modules/address';
import Spinner from 'components/Spinner';
import AddressList from 'components/Address/AddressList';

import style from './style.scss';

const Address = (props, { frame }) => {
  const addressState = useSelector((state) => state.address);
  const dispatch = useDispatch();

  const { loading, processing, data: addresses } = addressState;

  const showError = useCallback(
    (error) => {
      frame.openModal('response', { body: error });
    },
    [frame]
  );

  const handleAddAddress = useCallback((address) => dispatch(addAddress(address)), [dispatch]);

  const handleDeleteAddress = useCallback(
    (address) => {
      frame.openModal('confirm', {
        content: <p className={`${style.address}__confirm`}>Are you sure you would like to delete this address?</p>,
        onConfirm: () => {
          dispatch(deleteAddress(address.id)).catch(showError);
        },
      });
    },
    [dispatch, showError, frame]
  );

  useEffect(() => {
    dispatch(loadAddress()).catch(showError);
  }, [dispatch, showError]);

  return (
    <div className={classNames(style.address, 'address')}>
      <h1 className={style.header}>Address Book</h1>
      <div className={`${style.address}__current`}>
        {loading ? (
          <div className={`${style.address}__loading`}>
            <Spinner />
          </div>
        ) : (
          <AddressList
            onAddAddress={handleAddAddress}
            addresses={addresses}
            onDeleteAddress={handleDeleteAddress}
            className={`${style.address}__box`}
          />
        )}
        {processing && (
          <div className={`${style.address}__current__mask`}>
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};

Address.contextTypes = {
  frame: PropTypes.object,
};

export default Address;
