import React, { useState, useMemo, createRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import { trackSubscription } from 'utils/tracking';
import { setSubscribed } from 'utils/cookies';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { hideSubscriptionBar } from 'redux/modules/subscriptionBar';
import { Button } from 'components/Button';
import { useCurrentVariant } from 'containers/Product/hooks/product';
import { EVENT_FORM_SUBMIT, EVENT_LONG_LEAD_TIME } from 'utils/track/constants';
import { selectedShippingLocation } from 'redux/modules/geolocation';
import { randomId } from 'utils/number';
import { enableZipcodeUpdate, globalFeatureInAU } from 'config';
import style from './style.scss';

const Input = ({
  className,
  btnColor,
  type,
  placeholder,
  onSuccess,
  deleteItem,
  inputDataSelenium,
  buttonDataSelenium,
  ctaText = 'Submit',
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const emailRef = createRef(null);
  const user = useSelector((state) => state.auth.user);
  const { quantity, selectedVariants } = useSelector((state) => state.productOptions);
  const shippingLocation = useSelector(selectedShippingLocation);
  const variant = useCurrentVariant();

  const client = useMemo(() => new ApiClient(), []);
  const dispatch = useDispatch();
  const validateEmail = useCallback((email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }, []);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const email = form.email.value.trim();

      if (email === '') {
        setError('Please provide your email address.');
      } else if (!validateEmail(email)) {
        setError('Please provide a valid email.');
      } else {
        setProcessing(true);
        setError('');
        emailRef.current?.blur();

        const params = {
          source: type,
          email,
        };

        if (type === 'LLT') {
          if (deleteItem) {
            params.extra = {
              variant_sku: deleteItem.variant.sku,
              quantity: deleteItem.quantity,
            };
          } else {
            params.extra = {
              variant_sku: variant.sku,
              quantity,
            };
          }

          if (deleteItem) {
            if (deleteItem.bundle_line_items?.length > 0) {
              params.extra.options = {
                bundle_options: deleteItem.bundle_line_items.map((item) => ({
                  bundle_option_id: item?.bundle_option?.id,
                  bundle_option_variant_id: item?.variant?.id,
                })),
              };
            }
          } else if (Object.keys(selectedVariants).length > 0) {
            params.extra.options = {
              bundle_options: Object.keys(selectedVariants).map((key) => ({
                bundle_option_id: key,
                bundle_option_variant_id: selectedVariants[key].id,
              })),
            };
          }

          if (enableZipcodeUpdate) {
            params.extra.zipcode = shippingLocation.zipcode;
          }
          if (globalFeatureInAU) {
            params.extra.city = shippingLocation.city;
            params.extra.state = shippingLocation.state;
          }
        }
        client
          .post('/subscriptions', {
            data: params,
          })
          .then(
            (res) => {
              setProcessing(false);
              form.email.value = '';

              if (onSuccess) {
                onSuccess(res?.email);
              }

              if (type === 'LLT') {
                dispatch({
                  type: EVENT_LONG_LEAD_TIME,
                  result: {
                    detailAction: 'subscribe',
                    label: deleteItem
                      ? `${deleteItem?.variant?.sku} | ${deleteItem?.variant?.name}`
                      : `${variant?.sku} | ${variant?.name}`,
                  },
                });
              } else {
                // set cookie to avoid future popup
                // setCookie('has_subscribed', JSON.stringify(true), 365);
                setSubscribed();

                if (hideSubscriptionBar) {
                  dispatch(
                    hideSubscriptionBar({
                      showOnProductPage: false,
                      showOnHomePage: false,
                    })
                  );
                }
                const eventId = randomId('NewsletterSubscription');
                /* record signup newsletter event */
                trackSubscription(email, { eventId });

                dispatch({
                  type: EVENT_FORM_SUBMIT,
                  result: {
                    action: 'Newsletter Sign-up',
                    label: user?.id,
                    eventId,
                    method: email,
                  },
                });
              }
            },
            (err) => {
              setProcessing(false);
              setError(err && err.errors && err.errors[0].detail);
            }
          );
      }
    },
    [
      shippingLocation,
      client,
      dispatch,
      emailRef,
      onSuccess,
      type,
      user,
      validateEmail,
      variant,
      quantity,
      selectedVariants,
      deleteItem,
    ]
  );

  return (
    <form action="/" onSubmit={onSubmit} noValidate className={classNames(className, style.form)}>
      <div className={`${style.form}__field`}>
        <input
          type="email"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="email"
          ref={emailRef}
          name="email"
          disabled={processing}
          placeholder={placeholder}
          aria-label="Enter your email to subscribe"
          data-selenium={inputDataSelenium}
        />

        <Button
          type="submit"
          text={ctaText}
          color={btnColor}
          border={false}
          loading={processing}
          data-selenium={buttonDataSelenium}
        />
      </div>

      <p className={`${style.form}__error`}>{error}</p>
    </form>
  );
};
Input.propTypes = {
  className: PropTypes.string,
  onSuccess: PropTypes.func,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  btnColor: PropTypes.string,
  deleteItem: PropTypes.object,
  inputDataSelenium: PropTypes.string,
  buttonDataSelenium: PropTypes.string,
  ctaText: PropTypes.string,
};

Input.defaultProps = {
  placeholder: 'Enter your email',
};

export default Input;
