import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import { EVENT_SEARCH_ADDRESS } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import config from 'config';
import style from './style.scss';
import AddressSearch from './AddressSearch';
import GooglePlacedAutocomplete from './GooglePlacesAutocomplete';

const Address = ({ address: initialAddress, className, buttonLayout, cancelButton, submitButton, onSubmit }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const wrapperRef = useRef();
  const { desktop } = useBreakpoints();
  useEffect(() => {
    if (desktop) {
      wrapperRef?.current?.querySelector('input')?.focus();
    }
  }, [desktop]);

  const onSearchSelect = (data) => {
    const address = data.name ? {} : data;
    const mode = data.name ? 'edit' : 'partial-edit';

    dispatch({
      type: EVENT_SEARCH_ADDRESS,
      result: {
        searchedLocation: data.name ? '' : `${data.city} ${data.zipcode || ''}`,
      },
    });

    // determine the address passed to AddressForm
    const passedAddress = initialAddress || {
      ...user,
      ...address,
    };

    if (onSubmit) {
      onSubmit(passedAddress, mode);
    }
  };

  const addressInput = config.googlePlaceEnabledInSearchAddress ? (
    <GooglePlacedAutocomplete className={`${style.address}__addressSearch`} onSelect={onSearchSelect} />
  ) : (
    <AddressSearch className={`${style.address}__addressSearch`} onSelect={onSearchSelect} />
  );

  return (
    <div className={classNames(style.address, className)} ref={wrapperRef}>
      {/* headers */}
      <div className={`${style.address}__header`}>
        <h2>Search your location</h2>
        <ReactSVG name="location" />
      </div>

      {addressInput}

      {/* button for search */}
      {cancelButton && (
        <div
          className={classNames(`${style.address}__submit`, `${style.address}__submit--normal`, {
            [`${style.address}__submit--float`]: buttonLayout === 'float',
          })}
        >
          <button type="button" className={classNames('btn btn-primary', submitButton.className)} disabled>
            {submitButton.text || 'Submit'}
          </button>
          <button
            type="button"
            className={classNames('btn btn-grey', cancelButton.className)}
            onClick={cancelButton.onClick}
          >
            {cancelButton.text || 'Cancel'}
          </button>
        </div>
      )}
    </div>
  );
};

Address.propTypes = {
  /**
   * an object represent a button:
   * {
   *   text: string,
   *   onClick: Object, // must provide
   *   className: string
   * }
   */
  buttonLayout: PropTypes.string, // 'float' or 'block'
  cancelButton: PropTypes.object,
  submitButton: PropTypes.object.isRequired,
  className: PropTypes.string,
  address: PropTypes.object, // pass existing address if exist
  onSubmit: PropTypes.func,
};

Address.contextTypes = {
  frame: PropTypes.object,
};

Address.defaultProps = {
  buttonLayout: 'block',
};

export default Address;
