import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import CitySearch from 'components/Address/CitySearch';
import { Button, CloseBtn } from 'components/Button';
import SvgIcon from 'components/SvgIcon';
import { FrameContext } from 'containers/Frame/FrameContext';
import { EVENT_CART_SHIPPING } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { enablePostcode } from 'config';
import { useProductOptions } from '../hooks/product';
import style from './style.scss';

const ShippingForm = ({ onSubmit }) => {
  const [city, setCity] = useState();
  const [inputValue, setInputValue] = useState('');
  const { estimating } = useProductOptions();
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const [isLoading, setIsLoading] = useState(false);

  const theme = useMemo(
    () => ({
      input: {
        position: 'relative',
        height: '50px',
        zIndex: 101,
        border: '1px solid #BEBEBE',
        borderRadius: '0px',
        padding: __COUNTRY__ === 'US' ? '10px 12px' : '0.375rem 1rem',
        outline: 'none',
      },
      suggestionsContainer: {
        width: '100%',
        backgroundColor: '#FFF',
        position: 'absolute',
        zIndex: 100,
        border: '1px solid #BEBEBE',
        ...(!desktop ? { bottom: 'calc(100% - 2px)' } : { top: 'calc(100% - 2px)' }),
      },
      suggestionsList: {
        margin: 0,
        padding: 0,
        ':hover': {
          backgroundColor: 'black',
        },
      },
      suggestion: {
        cursor: 'pointer',
        padding: __COUNTRY__ === 'US' ? '10px 12px' : '0.1rem 0',
        listStyleType: 'none',
      },
    }),
    [desktop]
  );

  const onBackupValueChange = useCallback((value) => {
    setInputValue(value);
  }, []);

  const handleChangeCity = useCallback(
    async (e, value = null) => {
      e.preventDefault();
      const useCity = value || city;

      if (!useCity && !inputValue) {
        return;
      }
      setIsLoading(true);
      dispatch({
        type: EVENT_CART_SHIPPING,
        result: {
          action: 'click_submit_zipcode',
        },
      });
      const result = useCity?.zipcode
        ? useCity
        : {
            zipcode: inputValue,
            state: '',
            city: '',
          };
      await onSubmit(result);
      setIsLoading(false);
    },
    [city, onSubmit, dispatch, inputValue]
  );

  return (
    <form className={`${style.shipping}__cityForm`} onSubmit={handleChangeCity} data-selenium="cart-shipping">
      <CitySearch
        disabled={estimating}
        onSelect={setCity}
        theme={theme}
        className={`${style.shipping}__cityForm__input`}
        onBackupValueChange={onBackupValueChange}
        onEnter={handleChangeCity}
      />

      <Button
        type="submit"
        backgroundcolor="dark-accent"
        rightIcon={<SvgIcon name="line-right-arrow" width={20} />}
        width={60}
        size="medium"
        loading={isLoading}
      />
    </form>
  );
};

ShippingForm.propTypes = {
  onSubmit: PropTypes.func,
  // useGooglePlace: PropTypes.bool,
};
/**
 * hook : useShippingPopup ==> ShippingPopup can be quickly used using useShippingPopup (Abby's tip)
 * src/containers/Product/hooks/useShippingPopup.tsx
 */
const ShippingPopup = ({ onSubmit, title, description, useGooglePlace }) => {
  const frame = useContext(FrameContext);
  const handleClose = () => frame.removeModal();
  const { desktop } = useBreakpoints();

  return (
    <div className={style.shippingPopup}>
      <h3 className={`${style.shippingPopup}__head`}>{title || 'How much will shipping cost?'}</h3>
      <div className={`${style.shippingPopup}__content`}>
        {description || `Enter a ${enablePostcode ? 'postcode' : 'zip code'} to accurately calculate shipping cost`}
      </div>
      <ShippingForm onSubmit={onSubmit} useGooglePlace={useGooglePlace} />
      {desktop && <CloseBtn className={`${style.shippingPopup}__close`} color="neutral" onClick={handleClose} />}
    </div>
  );
};

ShippingPopup.propTypes = {
  onSubmit: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  useGooglePlace: PropTypes.bool,
};

export { ShippingPopup };
