import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { confirmDelivery, updateCart, changeDeliveryOption, complete } from 'redux/modules/cart';
import Spinner from 'components/Spinner';
import AddressDisplay from 'components/AddressDisplay';
import { getUrl } from 'pages';
import { CardOne } from 'components/Card';
import SvgIcon from 'components/SvgIcon';
import { ArrowBtn, GhostArrowBtn } from 'components/Button';
import classNames from 'classnames';
import {
  EVENT_SHIPPING_PREFERENCE,
  EVENT_ASSEMBLY_PREFERENCE,
  EVENT_SHIPPING_SERVICE_TYPE,
} from 'utils/track/constants';
import { loadShipmentOptions } from 'redux/modules/order';
import { Typography } from '@castlery/fortress';
import OrderShipments from './components/OrderShipments';

import style from './style.scss';

const ShippingMethod = (props, { frame, router }) => {
  const cart = useSelector((state) => state.cart);
  const { data: availableShipmentServices, loading } = useSelector((state) => state.addOnServices) || {};
  const [instructions, setInstructions] = useState(cart.data?.special_instructions || '');
  const [selectedAssembly, setSelectedAssembly] = useState(cart.data?.selected_assembly_preferences?.[0] || {});
  const { data: order, processing } = cart;

  console.log('order------------------------>', order);
  const assemblyPreferences = order?.available_assembly_preferences;
  const orderShipmentOptions = useSelector((state) => state.order.shipmentOptions);

  const selectedPreference = orderShipmentOptions?.delivery_option?.can_merge ? 'lead_time' : 'all_together';
  const showShippingPreference =
    orderShipmentOptions?.delivery_option?.can_split || orderShipmentOptions?.delivery_option?.can_merge;
  const isNeedToPay = +order?.total === 0;

  const dispatch = useDispatch();

  useEffect(() => {
    console.log('loadShipmentOptions', order?.number);
    if (order?.number) dispatch(loadShipmentOptions({ orderNumber: order.number }));
  }, [order]);

  useEffect(() => {
    dispatch({
      type: EVENT_SHIPPING_PREFERENCE,
      result: {
        label: !showShippingPreference ? 'Single shipment only' : 'Single & Combine shipment',
        position: null,
      },
    });

    if (selectedAssembly?.title && __COUNTRY__ === 'SG') {
      dispatch({
        type: EVENT_ASSEMBLY_PREFERENCE,
        result: {
          label: selectedAssembly.title,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (availableShipmentServices?.length > 0 && order) {
      const { shipments } = order;

      availableShipmentServices.forEach((service) => {
        const { available_service_types: serviceTypes = [], shipment_id: shipmentId } = service || {};
        const { type: defaultSelectedType } =
          shipments?.find((shipment) => shipment.id === shipmentId)?.selected_service_type || {};

        if (serviceTypes.length > 0 && shipmentId && defaultSelectedType) {
          const serviceName = (serviceTypes.find((item) => item.type === defaultSelectedType) || {})?.display_name;

          dispatch({
            type: EVENT_SHIPPING_SERVICE_TYPE,
            result: {
              label: serviceName,
              method: 'default',
              position: shipmentId,
            },
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.shipments?.length]);

  const handleConfirmDelivery = () => {
    dispatch(
      updateCart(
        {
          special_instructions: instructions,
          assembly_preferences: [selectedAssembly?.slug],
        },
        true,
        true,
        false
      )
    )
      .then(() =>
        dispatch(confirmDelivery()).then((order) => {
          if (+order.total === 0) {
            return dispatch(complete()).then(() => {
              router.push(getUrl('checkout-success'));
            });
          }
          router.push(getUrl('checkout-payment'));
        })
      )
      .catch((err) => {
        const { code } = err.errors[0];
        if (code === 40019) {
          frame.openModal('response', {
            body: err,
            button: {
              text: 'Got it',
              link: getUrl('cart'),
            },
          });
        } else {
          frame.openModal('response', { body: err });
        }
      });
  };

  const handleInputChange = (e) => {
    setInstructions(e.target.value);
  };

  const handlePreferenceChange = (type, selectedType) => {
    if (type === selectedType) return;

    dispatch(
      changeDeliveryOption({
        mode: type,
      })
    )
      .then(() => {
        dispatch({
          type: EVENT_SHIPPING_PREFERENCE,
          result: {
            label: 'Single & Combine shipment',
            position: type === 'lead_time' ? 'Single shipment' : 'Combine shipments',
          },
        });
      })
      .catch((err) => frame.openModal('response', { body: err }));
  };

  const handleAssemblyChange = (preference) => {
    const { slug, title } = preference || {};
    if (slug === selectedAssembly?.slug) return;

    setSelectedAssembly(preference);

    if (__COUNTRY__ === 'SG') {
      dispatch({
        type: EVENT_ASSEMBLY_PREFERENCE,
        result: {
          label: title,
        },
      });
    }
  };

  return (
    <div className={style.shipMethod}>
      <div className={style.shipAddress}>
        <Typography level="subh2" sx={{ mb: 2 }}>
          Shipping address
        </Typography>
        <AddressDisplay address={order.ship_address} />
      </div>

      {showShippingPreference && (
        <div className={`${style.shipMethod}__preference`}>
          <p className={`${style.title}__secondary`}>Shipping preference</p>

          <div className={`${style.shipMethod}__preference__content`}>
            <CardOne
              onSelect={() => handlePreferenceChange('lead_time', selectedPreference)}
              isSelected={selectedPreference === 'lead_time'}
              mainContent={
                <>
                  <div
                    className={classNames(`${style.shipMethod}__preference__icon-leadtime`, {
                      'is-selected': selectedPreference === 'lead_time',
                    })}
                  >
                    <SvgIcon name="shipping-preference-leadtime" />
                  </div>
                  <div className={`${style.shipMethod}__preference__desc`}>
                    I want my items faster. <br />
                    Ship them as they become available.
                  </div>
                </>
              }
            />

            <CardOne
              onSelect={() => handlePreferenceChange('all_together', selectedPreference)}
              isSelected={selectedPreference === 'all_together'}
              mainContent={
                <>
                  <div
                    className={classNames(`${style.shipMethod}__preference__icon-together`, {
                      'is-selected': selectedPreference === 'all_together',
                    })}
                  >
                    <SvgIcon name="shipping-preference-together" />
                  </div>
                  <div className={`${style.shipMethod}__preference__desc`}>
                    Group my items together. <br />
                    Ship them when all become available.
                  </div>
                </>
              }
            />
          </div>
        </div>
      )}

      {assemblyPreferences?.length > 0 && (
        <div className={`${style.shipMethod}__assembly`}>
          <p className={`${style.title}__secondary`}>Assembly preference</p>

          <div className={`${style.shipMethod}__assembly-wrapper`}>
            {assemblyPreferences.map((preference) => (
              <CardOne
                key={preference.slug}
                className={`${style.shipMethod}__assembly-preference`}
                onSelect={() => {
                  handleAssemblyChange(preference);
                }}
                isSelected={selectedAssembly?.slug === preference.slug}
                mainContent={
                  <div>
                    <div className={`${style.shipMethod}__assembly-title`}>{preference.title}</div>
                    <div className={`${style.shipMethod}__assembly-desc`}>{preference.description}</div>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}

      <OrderShipments
        availableShipmentServices={availableShipmentServices}
        handlePreferenceChange={handlePreferenceChange}
      />

      {__COUNTRY__ === 'SG' && (
        <div className={`${style.shipMethod}__instructions`}>
          <p className={`${style.title}__secondary`}>Delivery requests</p>
          <textarea
            placeholder="Please specify your requests."
            disabled={processing}
            onChange={handleInputChange}
            value={instructions}
            rows="3"
          />
          {__COUNTRY__ === 'SG' && (
            <Typography level="caption1" sx={{ mt: 1, color: '#63404b' }}>
              Note:
              <ul>
                <li>
                  Product package(s) might not fit into some lifts. Please compare package dimensions with your lift
                  size before purchasing.
                </li>
                <li>
                  While not guaranteed, we will try our best to carry out your requests where possible. For more info,
                  read our{' '}
                  <a href={`${__BASE_URL__}${getUrl('delivery')}`} target="_blank">
                    Delivery
                  </a>{' '}
                  policy.
                </li>
              </ul>
            </Typography>
          )}
        </div>
      )}

      <div className={style.btns}>
        <GhostArrowBtn
          className={`${style.btns}__prev`}
          onClick={() => router.push(getUrl('checkout-shipping-address'))}
          text="Back"
          // border={false}
          // direction="left"
          hasArrow={false}
          backgroundcolor="transparent"
        />

        <div className={`${style.shipping}__next ${isNeedToPay ? 'place-order-btn' : ''}`}>
          <ArrowBtn
            text={isNeedToPay ? 'Place Your Order' : 'Continue'}
            size="medium"
            type="button"
            disabled={processing || loading}
            data-selenium="checkout-shipping-method"
            onClick={handleConfirmDelivery}
            className={`${style.shipping}__button`}
            hasArrow={false}
          />
        </div>
      </div>
      {(processing || loading) && (
        <div className={style.mask}>
          <Spinner />
        </div>
      )}
    </div>
  );
};

ShippingMethod.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default ShippingMethod;
