/* eslint-disable camelcase */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Link as Mlink, Container, Typography } from '@castlery/fortress';
import { getUrl } from 'pages';
import { wrapPage } from 'utils/page';
import { getDate } from 'utils/time';
import { load as loadDelivery } from 'redux/modules/scheduleDelivery';
import { scheduleDelivery } from 'redux/modules/cart';
import { login } from 'redux/modules/auth';
import AddressDisplay from 'components/AddressDisplay';
import DeliverySlot from 'components/DeliverySlot';
import DeliveryService from 'components/DeliveryService';
import Spinner from 'components/Spinner';
import ApiClient from 'helpers/ApiClient';
import * as Cookie from 'helpers/Cookie';
import { EVENT_TRANSACTION } from 'utils/track/constants';

import greeLeaf from './leaf.svg';

import style from './style.scss';

const GlobalNotice = ({ block }) => (
  <div className={block.elm('global_notice')}>
    For deliveries to condominium, your management may require you to fill up an application form. Should you require
    further details, feel free to contact us{' '}
    <Link target="_blank" href="https://wa.me/6582410030">
      here
    </Link>
    .
  </div>
);

const ScheduleDelivery = (
  { delivery = {}, order, scheduleDelivery, loadDelivery, login, trackScheduleDelivery },
  { router, frame }
) => {
  const { data: deliveryInfo = {}, loading: loadingDelivery } = delivery;
  const {
    order_number: orderNumber,
    shipment_number: shipmentNumber,
    line_items: lineItems,
    selected_slot: currentSlot,
    ship_address: shipAddress,
    selected_services: currentServices,
    service_products: serviceProducts,
    delivery_instructions: currentDeliveryInstructions,
    is_confirmed: isConfirmed,
    is_delivered: isDelivered,
    allow_earlier_delivery: allowEarlierDelivery,
    delivery_type: deliveryType,
    slots,
    is_special_customized_order: isSpecialCustomizedOrder,
    is_installation,
  } = deliveryInfo;

  const { creating, loading } = order;
  const isScheduled = !!currentSlot;

  const [error, setError] = useState(false);
  const [scheduled, setScheduled] = useState(isScheduled);
  const [selectedSlot, setSelectedSlot] = useState(currentSlot || {});
  const [selectedServices, setSelectedServices] = useState([]);
  const [deliveryInstructions, setDeliveryInstructions] = useState(currentDeliveryInstructions);
  const [earlierDelivery, setEarlierDelivery] = useState(allowEarlierDelivery);
  const client = useRef(new ApiClient());
  const accessToken = Cookie.get('access_token');

  const isContinueDisabled =
    !(selectedSlot && selectedSlot.id) ||
    (currentSlot && selectedSlot.id === currentSlot.id && selectedServices.length === 0);
  const isStaleLink = !!router.location.query.shipment_id;
  const isLalaMove = deliveryType === 'FULFILLMENT_ORDER_DELIVERY_TYPE_HOMEWARE';

  const isSpecialOrder =
    isSpecialCustomizedOrder &&
    (deliveryType === 'FULFILLMENT_ORDER_DELIVERY_TYPE_FURNITURE' ||
      deliveryType === 'FULFILLMENT_ORDER_DELIVERY_TYPE_HOMEWARE');

  const isRepairOrder = deliveryType === 'FULFILLMENT_ORDER_DELIVERY_TYPE_REPAIR';
  const isInstallationCharge = is_installation;

  const openLoginModal = ({ orderId } = {}) => {
    const { fulfillment_order_id } = router.location.query;
    const order = orderId || fulfillment_order_id;
    frame.openModal('login', {
      onSuccess: () => {
        if (order) loadDelivery(order);
      },
      onClose: () => {
        setError(true);
      },
    });
  };

  useEffect(() => {
    const { token, fulfillment_order_id: orderId } = router.location.query;

    // query has token is a link from a redirect
    if (!accessToken) {
      openLoginModal({ orderId });
    } else {
      // logged in
      loadDelivery(orderId);
    }
  }, [loadDelivery, login, router.location.query, frame]);

  useEffect(() => {
    Cookie.remove('service_order_id');
  }, []);

  useEffect(() => {
    setScheduled(!!currentSlot);
    setSelectedSlot(currentSlot);
    setDeliveryInstructions(currentDeliveryInstructions);
    setEarlierDelivery(allowEarlierDelivery);
  }, [currentSlot, currentDeliveryInstructions, allowEarlierDelivery]);

  const getFullUrl = useCallback((path) => {
    if (__CLIENT__) {
      return `${window.location.origin}/${__COUNTRY__?.toLowerCase()}${path}`;
    }
    return '';
  }, []);

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleReschedule = () => {
    setScheduled(false);
  };

  const handleCancel = () => {
    setScheduled(true);
    frame.scrollToTop();
  };

  const handleConfirmServices = (type, services) =>
    Promise.resolve().then(() => {
      const servicesWithAnotherType = selectedServices.filter((s) => s.type !== type);
      if (type === 'carry_up') {
        setSelectedServices(servicesWithAnotherType.concat(services));
      } else if (type === 'disposal') {
        setSelectedServices(services.concat(servicesWithAnotherType));
      }
    });

  const handleDeliveryInstructionsChange = (e) => {
    setDeliveryInstructions(e.target.value);
  };

  const handleToggleEarlierDelivery = () => {
    setEarlierDelivery(!earlierDelivery);
  };

  const handleContinue = () => {
    const { fulfillment_order_id: orderId } = router.location.query;

    const data = {
      fulfillment_order_id: orderId,
      shipment_number: shipmentNumber,
      slot_id: selectedSlot && selectedSlot.id,
      services: selectedServices,
      delivery_instructions: deliveryInstructions,
      allow_earlier_delivery: earlierDelivery,
    };
    scheduleDelivery(data)
      .then((order) => {
        if (order) {
          if (+order.total === 0) {
            loadDelivery(orderId).then(() => {
              trackScheduleDelivery();
            });

            router.push({
              pathname: getUrl('schedule-delivery'),
              query: {
                fulfillment_order_id: order.fulfillment_order_id,
              },
            });
          } else {
            router.push({
              pathname: getUrl('checkout-payment'),
              query: {
                serviceOrder: order.number,
              },
            });
          }
        } else {
          throw new Error('Something went wrong, please try again later.');
        }
      })
      .catch((error) => {
        frame.openModal('response', { body: error });
      });
  };

  const getDeliverySlotEle = (slot) => (
    <>
      <strong>{getDate(slot.start_time).format('h:mma')}</strong> -{' '}
      <strong>{getDate(slot.end_time).format('h:mma')}</strong> on{' '}
      <strong>{getDate(slot.start_time).format('dddd, D MMM YYYY')}</strong>
    </>
  );

  const block = new Bem(style.scheduleDelivery);
  let rendered;
  let selectedServicesEle;
  if (currentServices && currentServices.length > 0) {
    const selectedDisposal = currentServices.filter((s) => s.service_code === 'disposal');
    const selectedCarryUp = currentServices.find((s) => s.service_code === 'carry_up');
    let selectedDisposalEle;
    let selectedCarryUpEle;
    if (selectedDisposal.length > 0) {
      selectedDisposalEle = (
        <div className={block.elm('last').elm('disposal')}>
          <span>Last Selected Disposal Service:</span>{' '}
          {selectedDisposal.map((s) => `${s.quantity} x ${s.custom_attributes.disposal_item_type}`).join(', ')}
        </div>
      );
    }
    if (selectedCarryUp) {
      const { number_of_items: numOfItems, number_of_stories: numOfStories } = selectedCarryUp.custom_attributes;
      selectedCarryUpEle = (
        <div className={block.elm('last').elm('carry_up')}>
          <span>Last Selected Carry Up Stairs Service:</span>{' '}
          {`${numOfStories} x ${numOfStories > 1 ? 'Storeys' : 'Storey'}, ${numOfItems} x ${
            numOfItems > 1 ? 'Items' : 'Item'
          }`}
        </div>
      );
    }

    selectedServicesEle = (
      <div className={block.elm('last')}>
        {selectedDisposalEle}
        {selectedCarryUpEle}
      </div>
    );
  }

  let notedSelectedServicesEle;
  if (currentServices && currentServices.length > 0) {
    const selectedDisposal = currentServices.filter((s) => s.service_code === 'disposal');
    const selectedCarryUp = currentServices.find((s) => s.service_code === 'carry_up');
    let selectedDisposalEle;
    let selectedCarryUpEle;
    if (selectedDisposal.length > 0) {
      selectedDisposalEle = (
        <span className={block.elm('last').elm('disposal')}>
          <strong>Disposal Service</strong> for{' '}
          {selectedDisposal.map((s) => `${s.quantity} x ${s.custom_attributes.disposal_item_type}`).join(', ')}
        </span>
      );
    }
    if (selectedCarryUp) {
      const { number_of_items: numOfItems, number_of_stories: numOfStories } = selectedCarryUp.custom_attributes;
      selectedCarryUpEle = (
        <span className={block.elm('last').elm('carry_up')}>
          <strong>Carry-up Service</strong> for{' '}
          {`${numOfStories} x ${numOfStories > 1 ? 'Storeys' : 'Storey'}, ${numOfItems} x ${
            numOfItems > 1 ? 'Items' : 'Item'
          }`}
        </span>
      );
    }

    notedSelectedServicesEle = (
      <div
        className={block.elm('last')}
        style={{ maxWidth: '830px', width: '100%', marginBottom: '12px', marginTop: 0 }}
      >
        <strong>Please note:</strong> You've already added {selectedDisposalEle} {selectedCarryUp ? ';' : ''}{' '}
        {selectedCarryUpEle}
      </div>
    );
  }

  if (isStaleLink) {
    return (
      <Container fixed>
        <div className={block}>
          <h1>Delivery Schedule & Services</h1>
          <div className={block.elm('error')}>
            <p>Sorry, this is an old delivery scheduling link and it is no longer valid.</p>
            <p>To schedule your delivery, please refer to the new link that we have sent you via email.</p>
            <p>
              If you are unable to retrieve the link, please <Link to={getUrl('contact-us')}>Contact Us</Link>.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (!accessToken) {
    return (
      <Container fixed>
        <div className={block}>
          <h1>Delivery Schedule & Services</h1>
          <div className={block.elm('error')}>
            <p>
              Sorry, you are required to log in to schedule your delivery. Please{' '}
              <Mlink
                onClick={() => {
                  openLoginModal();
                }}
              >
                log in
              </Mlink>{' '}
              to your account.
            </p>
            <p>
              Please <Link to={getUrl('contact-us')}>Contact Us</Link> for help if you still face issues.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (loadingDelivery) {
    return (
      <Container fixed>
        <div className={block}>
          <h1>Delivery Schedule & Services</h1>
          <div className={block.elm('placeholder')} />
          <div className={block.elm('mask')}>
            <Spinner />
          </div>
        </div>
      </Container>
    );
  }

  if (!orderNumber) {
    return (
      <Container fixed>
        <div className={block}>
          <h1>Delivery Schedule & Services</h1>
          <div className={block.elm('error')}>
            <p>Sorry, this is an invalid schedule delivery link.</p>
            <p>
              Please <Link to={getUrl('contact-us')}>Contact Us</Link> if you need help.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (isConfirmed) {
    rendered = (
      // TODO Layout
      <div className={block.elm('container')}>
        <div className={block.elm('notice')}>
          <p>Your order has been scheduled on {getDeliverySlotEle(currentSlot)}.</p>
          <p>
            Check out our Delivery FAQ at <Link to={getUrl('delivery')}>{getFullUrl(getUrl('delivery'))}</Link>.
          </p>
          <p>
            If you require any further assistance, you can reach us at{' '}
            <Link to={getUrl('contact-us')}>{getFullUrl(getUrl('contact-us'))}</Link>
          </p>
        </div>
      </div>
    );
  } else if (isDelivered) {
    rendered = (
      <div className={block.elm('container')}>
        <div className={block.elm('notice')}>
          <p>Your order has been delivered.</p>
        </div>
      </div>
    );
  } else if (scheduled) {
    rendered = (
      <div className={block.elm('container')}>
        <h2>Thank you for your order!</h2>
        <div className={block.elm('notice')}>Your scheduled slot is between {getDeliverySlotEle(currentSlot)}.</div>
        {selectedServicesEle}
        <GlobalNotice block={block} />
        <div className={block.elm('actions')}>
          <button type="button" onClick={handleReschedule} className="btn btn-grey">
            Reschedule
          </button>
          <Link href={__BASE_URL__} className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  } else {
    const isSlotAvailable = slots.find((s) => !!s.data.find((slot) => slot.is_available));
    if (!isSlotAvailable) {
      rendered = (
        <div className={block.elm('container')}>
          <div className={block.elm('notice')}>
            <p>
              sorry, there are no slots available now. Please try again later or{' '}
              <Link to={getUrl('contact-us')}>contact us.</Link>
            </p>
          </div>
        </div>
      );
    } else {
      rendered = (
        <>
          <div className={block.elm('container')}>
            <h2>Please Select Your Delivery Slot</h2>
            <DeliverySlot slots={slots} selectedSlot={selectedSlot} selectSlot={selectSlot} />
            {!isLalaMove && !isRepairOrder && !isInstallationCharge && (
              <div className={block.elm('checkboxes')}>
                <label htmlFor="earlierDelivery" className={block.elm('checkbox')}>
                  <input
                    type="checkbox"
                    id="earlierDelivery"
                    name="earlierDelivery"
                    checked={earlierDelivery}
                    onChange={handleToggleEarlierDelivery}
                  />
                  <span>Allow earlier delivery within the day</span>
                </label>
                <div className={block.elm('earlier')}>
                  <p className={block.elm('earlier').elm('green')}>
                    <img src={greeLeaf} alt="green leaf" />
                    Go greener by reducing petrol wastage!
                  </p>
                  <p>
                    You will be contacted 1 hour in advance of the earlier time slot with a choice to accept delivery or
                    stick to your selected time slot.
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isLalaMove &&
            !isSpecialOrder &&
            !isRepairOrder &&
            !isInstallationCharge &&
            (serviceProducts.length > 0 || selectedServicesEle) && (
              <div
                className={block.elm('container')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2>Additional Services</h2>
                <div className={block.elm('services')} style={{ flexDirection: 'column', alignItems: 'center' }}>
                  {notedSelectedServicesEle}
                  <div className={block.elm('services')}>
                    {serviceProducts.map((serviceProduct) => (
                      <DeliveryService
                        key={serviceProduct.type}
                        className={block.elm('service')}
                        serviceProduct={serviceProduct}
                        selectedService={selectedServices.filter((s) => s.type === serviceProduct.type)}
                        handleConfirmServices={handleConfirmServices}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          {!isRepairOrder && (
            <div className={block.elm('container')}>
              <h2>Delivery requests</h2>
              <div className={block.elm('instructions')}>
                <textarea
                  placeholder="Please specify your delivery requests."
                  onChange={handleDeliveryInstructionsChange}
                  name="deliveryInstructions"
                  value={deliveryInstructions}
                  rows="3"
                />
                <Typography level="caption1">
                  Note: While not guaranteed, we will try our best to carry out your requests where possible. For more
                  info, read our{' '}
                  <a href={`${__BASE_URL__}${getUrl('delivery')}`} target="_blank">
                    Delivery
                  </a>{' '}
                  policy.
                </Typography>
              </div>
            </div>
          )}

          <div className={block.elm('container')}>
            <GlobalNotice block={block} />
            <div className={block.elm('actions')}>
              {currentSlot && (
                <button type="button" onClick={handleCancel} className="btn btn-grey">
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleContinue}
                disabled={loading || creating || isContinueDisabled}
                className="btn btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <Container fixed>
      <div className={block}>
        <h1>Delivery Schedule & Services</h1>

        <div className={block.elm('row').mod('small')}>
          <div className={block.elm('field')}>
            <label>Order No.:</label>
            <span>{orderNumber}</span>
          </div>
          <div className={block.elm('field')}>
            <label>Shipment No.:</label>
            <span>{shipmentNumber}</span>
          </div>
        </div>

        <div className={block.elm('row').mod('large')}>
          <div className={block.elm('largeField')}>
            <label>Shipping address</label>
            <AddressDisplay address={shipAddress} />
          </div>
          <div className={block.elm('largeField')}>
            <label>Products</label>
            <div className={block.elm('largeField_content')}>
              {lineItems.map((item, index) => (
                <p key={index}>
                  {`${item.quantity} x `}
                  {item.variant.product_name}
                </p>
              ))}
            </div>
          </div>
        </div>

        {rendered}

        {(creating || loading) && (
          <div className={block.elm('mask')}>
            <Spinner />
          </div>
        )}
      </div>
    </Container>
  );
};

ScheduleDelivery.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};

export default connect(
  (state) => ({
    delivery: state.scheduleDelivery,
    order: state.cart,
  }),
  {
    loadDelivery,
    scheduleDelivery,
    login,
    trackScheduleDelivery: (result) => (dispatch) => dispatch({ type: EVENT_TRANSACTION, result }),
  }
)(wrapPage({ border: true, isOnlineScheduleV2: true })(ScheduleDelivery));
