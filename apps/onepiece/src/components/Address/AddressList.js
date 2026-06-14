import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import AddressDisplay from 'components/AddressDisplay';
import ReactSVG from 'components/ReactSVG';

import { updateAddress } from 'redux/modules/address';
import { connect } from 'react-redux';
import { EVENT_SHIPPING_ADDRESS_EDIT } from 'utils/track/constants';

import AddressForm from './AddressForm';

import { findDiffAddressByid, unSavedAddressHandler } from './utils/index';

import style from './style.scss';

/**
 * @optimize The logic of adding/editing/displaying should not be handled by the upper component, but should be handled internally in this component
 */
const AddressList = (
  {
    onSelectAddress,
    onAddAddress,
    onDeleteAddress,
    addresses,
    selectedAddress,
    className,
    handleContinueVisible,
    showEditButton = false,
    updateUserAddress,
    user,
    trackShippingAddressEvent,
    processing,
  },
  { frame }
) => {
  const [formVisible, setFormVisible] = useState(false);
  const [address, setAddress] = useState({});
  const [formMode, setFormMode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [type, setType] = useState(''); // ADD/EDIT
  const [formChanged, setFormChanged] = useState(false);

  const handleFormAndContinueVisible = (visible) => {
    setFormVisible(visible);
    if (handleContinueVisible) {
      handleContinueVisible(!visible);
    }
  };

  const handleAddAddress = (data, mode) => {
    const payload = {
      ...data,
      id: undefined,
    };
    setAddress(payload);
    setFormMode(mode);
    setType('ADD');
    setFormTitle('Add a new shipping address');
    handleFormAndContinueVisible(true);
  };

  const resetStatus = () => {
    setType('');
    setFormChanged(false);
  };

  const handleCancel = () => {
    resetStatus();
    handleFormAndContinueVisible(false);
  };

  const handleContinue = (data) => {
    if (type === 'ADD') {
      return onAddAddress(data).then(() => {
        setTimeout(() => {
          resetStatus();
          handleFormAndContinueVisible(false);
        }, 10);
      });
    }
    if (type === 'EDIT') {
      const oldAddresses = addresses;
      trackShippingAddressEvent({
        action: 'save',
      });
      return updateUserAddress({ address: { id: address.id, ...data }, userId: user?.id }).then((res) => {
        if (address?.id === selectedAddress?.id) {
          // 因为修改后的地址id会变，所以需要找到新的地址并选中
          const diffAddress = findDiffAddressByid(oldAddresses, res);
          if (diffAddress && onSelectAddress) {
            if (diffAddress.is_shippable) {
              onSelectAddress(diffAddress);
            } else {
              onSelectAddress(null);
              frame.openModal('response', { body: 'This address is not shippable, please select another address.' });
            }
          }
        }
        setTimeout(() => {
          resetStatus();
          handleFormAndContinueVisible(false);
        }, 10);
      });
    }
  };

  const openAddressModal = useCallback(() => {
    frame.openModal('address', {
      onSubmit: (data, mode) => handleAddAddress(data, 'edit'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToAddressForm = () => {
    setTimeout(() => {
      const addressForm = document.querySelector('#address-form');
      addressForm &&
        addressForm.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 100);
  };

  const onClickAddressItem = (item) => {
    if ((type === 'EDIT' || type === 'ADD') && formChanged) {
      unSavedAddressHandler({
        frame,
        cancelCallbck: () => {
          resetStatus();
          handleFormAndContinueVisible(false);
          onSelectAddress(item);
        },
        confirmCallback: () => {
          scrollToAddressForm();
        },
      });
    } else {
      resetStatus();
      handleFormAndContinueVisible(false);
      onSelectAddress && onSelectAddress(item);
    }
  };

  // set edit mode
  const editAddress = (address) => {
    setAddress({ ...address, state: address.state_name || '' });
    setFormMode('edit');
    setType('EDIT');
    setFormTitle('Edit shipping address');

    handleFormAndContinueVisible(true);

    trackShippingAddressEvent({
      action: 'edit',
    });
    scrollToAddressForm();
  };

  // if address is changed, show modal to confirm if user want to leave the page without saving the address
  const handleEdit = (targetAddress) => {
    if (formChanged && type === 'EDIT' && targetAddress?.id !== address?.id) {
      unSavedAddressHandler({
        frame,
        cancelCallbck: () => {
          setFormChanged(false);
          editAddress(targetAddress);
        },
        confirmCallback: () => {
          scrollToAddressForm();
        },
      });
    } else {
      if (targetAddress?.id !== address?.id) {
        setFormChanged(false);
      }
      editAddress(targetAddress);
    }
  };

  const addressesArray = useMemo(() => {
    if (processing) {
      return addresses;
    }

    // if selectedAddress is not in addresses,
    // then append it to addresses.
    // this happens when user deletes all their addresses, but there is still order.ship_address.
    if (selectedAddress && !selectedAddress.is_temporary && !addresses.find((item) => item.id === selectedAddress.id)) {
      return [...addresses, selectedAddress];
    }

    return addresses;
  }, [addresses, selectedAddress, processing]);

  return (
    <div className={classNames(style.addressList, className)}>
      <div className={`${style.addressList}__list`} data-selenium="address_list">
        {addressesArray?.length > 0 &&
          addressesArray.map((item) => {
            const { id } = item;
            const isSelected = selectedAddress && id === selectedAddress.id;

            return (
              <button
                type="button"
                onClick={() => {
                  onClickAddressItem(item);
                }}
                className={classNames(`${style.addressList}__address`, `${style.addressList}__list__item`, {
                  'is-selected': isSelected,
                })}
                key={id}
              >
                <AddressDisplay address={item} showEditButton={showEditButton} onEditClick={handleEdit} />
                {isSelected && (
                  <div className={`${style.addressList}__address__check`}>
                    <ReactSVG name="check-circle-fill" />
                  </div>
                )}
                {onDeleteAddress && (
                  <div
                    role="button"
                    className={`${style.addressList}__address__delete`}
                    onClick={() => onDeleteAddress(item)}
                  >
                    <ReactSVG name="bin" />
                  </div>
                )}
              </button>
            );
          })}

        {onAddAddress && !formVisible && (
          <button
            type="button"
            onClick={openAddressModal}
            className={classNames(`${style.addressList}__add`, `${style.addressList}__list__item`)}
            style={{
              minHeight: showEditButton ? '170px' : '130px',
            }}
          >
            <span>Add new address</span>
            <ReactSVG name="plus" />
          </button>
        )}
      </div>

      {formVisible && (
        <AddressForm
          id="address-form"
          address={address}
          title={formTitle}
          onCancel={handleCancel}
          onSubmit={handleContinue}
          mode={formMode}
          type={type}
          onChange={(_, isChanged) => {
            setFormChanged(isChanged);
          }}
        />
      )}
    </div>
  );
};

AddressList.propTypes = {
  onSelectAddress: PropTypes.func,
  onAddAddress: PropTypes.func,
  onDeleteAddress: PropTypes.func,
  addresses: PropTypes.array,
  selectedAddress: PropTypes.object,
  className: PropTypes.string,
  handleContinueVisible: PropTypes.func,
  showEditButton: PropTypes.bool,
  updateUserAddress: PropTypes.func,
  user: PropTypes.object,
  trackShippingAddressEvent: PropTypes.func,
  processing: PropTypes.bool,
};

AddressList.contextTypes = {
  frame: PropTypes.object,
};

export default connect(
  (state) => ({
    user: state.auth.user,
    processing: state.address.processing || state.cart.processing,
  }),
  (dispatch) => ({
    updateUserAddress: (payload) => dispatch(updateAddress(payload)),
    trackShippingAddressEvent: (result) => dispatch({ type: EVENT_SHIPPING_ADDRESS_EDIT, result }),
  })
)(AddressList);
