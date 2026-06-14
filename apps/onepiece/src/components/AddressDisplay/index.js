import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import config from 'config';
import style from './style.scss';

const AddressDisplay = ({ title, address, className, showEditButton, onEditClick }) => {
  const {
    firstname,
    lastname,
    phone,
    zipcode,
    street,
    street_number,
    building_name,
    level,
    flat,
    company,
    country,
    state,
    city,
    address1,
    address2,
    state_name,
  } = address || {};

  let addressLine1String = config.addressFeatureInSG
    ? address1
    : `${building_name ? `${building_name}, ` : ''}${address1}`;
  const addressLine2String = config.addressFeatureInSG ? address2 || building_name : address2;

  // for old address data
  if (config.addressFeatureInSG && !address1) {
    addressLine1String = `${street_number ? `${street_number} ` : ''}${street || ''}${
      flat || level ? `, #${level || ''}${flat ? `-${flat}` : ''}` : ''
    }`;
  }

  if (!address) {
    return null;
  }

  const onEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEditClick) {
      onEditClick({ ...address });
    }
  };

  return (
    <div className={classNames(className, style.address)}>
      {title && <div className={`${style.address}__title`}>{title}</div>}

      <div>
        {firstname} {lastname}
      </div>

      {company && <div>{company}</div>}

      {config.showApartmentBeforeStreet ? (
        <>
          {addressLine2String && <div>{addressLine2String}</div>}
          <div>{addressLine1String}</div>
        </>
      ) : (
        <>
          <div>{addressLine1String}</div>
          {addressLine2String && <div>{addressLine2String}</div>}
        </>
      )}

      <div>{config.addressFeatureInSG ? `${country}, ${zipcode}` : `${city}, ${state_name} ${zipcode}`}</div>

      <div>{phone}</div>

      {showEditButton && (
        <div className={`${style.address}__edit`}>
          <span onClick={onEdit}>Edit</span>
        </div>
      )}
    </div>
  );
};

AddressDisplay.propTypes = {
  title: PropTypes.string,
  address: PropTypes.object.isRequired,
  className: PropTypes.string,
  showEditButton: PropTypes.bool,
  onEditClick: PropTypes.func,
};

export default AddressDisplay;
