import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { changeDeliveryOption, changeDeliveryServices } from 'redux/modules/cart';

import { toPrice } from 'utils/number';
import { calculateBufferDaysExcludingWeekends, daysBetweenStartToEnd, daysToDate, getDate } from 'utils/time';
import { Typography } from '@castlery/fortress';
import { EVENT_DELIVERY_PERIOD_CLICK } from 'utils/track/constants';
import { loadShipmentOptions } from 'redux/modules/order';
import config from 'config';
import MultipleItemsA from './MultipleItemsA';
import MultipleItemsB from './MultipleItemsB';
import style from './style.scss';
import EcoDeliveryTip from './EcoDeliveryTip';
import { DISABLED_DELIVERY_DATES } from '../config/index';

const OrderShipments = ({ availableShipmentServices, handlePreferenceChange }, { frame }) => {
  const cart = useSelector((state) => state.cart);
  const { data: order } = cart;
  const dispatch = useDispatch();
  const [editedShipments, setEditedShipments] = useState([]); // [shipmentId1, shipmentId2]
  const orderShipmentOptions = useSelector((state) => state.order.shipmentOptions);

  const handleCombinePopup = async ({ shipmentId }) => {
    console.log('handleCombinePopup');
    const res = await dispatch(loadShipmentOptions({ orderNumber: order.number })).catch((err) => {
      console.error(
        JSON.stringify(
          {
            message: 'handleCombine error',
            error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
          },
          null,
          2
        )
      );
    });
    if (res?.delivery_option && res?.delivery_option?.can_merge) {
      if (order?.shipments && order.shipments.length > 1) {
        if (!editedShipments.includes(shipmentId)) {
          setEditedShipments([...editedShipments, shipmentId]);
        }
        console.log('editedShipments', editedShipments);
        // only show popup when there are edited second shipment
        if (editedShipments.length && !editedShipments.includes(shipmentId)) {
          frame.openModal('confirmation', {
            title: 'Do you want to combine or split your shipments?',
            cancelText: 'Split',
            confirmText: 'Combine',
            onConfirm: () => {
              handlePreferenceChange('all_together');
              setEditedShipments([]);
            },
            onCancel: () => {
              setEditedShipments([...editedShipments]);
            },
          });
        }
      }
    } else if (res?.delivery_option && res?.delivery_option?.can_split) {
      frame.openModal('confirmation', {
        title: 'Do you want to split your shipments?',
        description:
          'Actions cannot be undone. You will have to reselect your preferred delivery dates for all shipments.',
        cancelText: 'Back',
        confirmText: 'Split shipments',
        onConfirm: () => {
          handlePreferenceChange('lead_time');
          setEditedShipments([]);
        },
        onCancel: () => {
          setEditedShipments([]);
        },
      });
    }
  };

  const changeDeliveryDate = ({ date, shipmentId }) => {
    frame.removeModal();

    const data = {
      // preferred_estimated_delivery_date: date.toISOString(),
      shipments_attributes: [
        {
          id: shipmentId,
          preferred_delivery_date: date.toISOString(),
        },
      ],
    };
    try {
      dispatch(changeDeliveryOption(data)).catch((err) => frame.openModal('response', { body: err }));
      // if (res && res.number) {
      //   handleCombinePopup({ shipmentId });
      // }
    } catch (err) {
      console.error(
        JSON.stringify(
          {
            message: 'changeDeliveryDate error',
            error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
          },
          null,
          2
        )
      );
    }
  };

  const handleConfirmServices = (shipment, type, deliveryServices, selectedDeliveryServices) => {
    const servicesWithAnotherType = selectedDeliveryServices.filter((s) => s.type !== type);
    const formattedServices = servicesWithAnotherType.concat(deliveryServices);

    return new Promise((resolve, reject) => {
      dispatch(
        changeDeliveryServices({
          shipment_id: shipment.id,
          services: formattedServices,
        })
      )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
          frame.openModal('response', { body: err });
        });
    });
  };

  return (
    <div className={style.orderShipments}>
      {order.shipments?.length > 1 && (
        <>
          <div className={`${style.orderShipments}__title`}>Shipping method</div>
          <Typography level="body2" sx={{ mt: 1 }}>
            Please note that all the order items will be sent in multiple shipments.
          </Typography>
          <EcoDeliveryTip sx={{ mb: 2.5 }} />
        </>
      )}

      {order.shipments.map((shipment, index) => {
        const items = [];
        // For US, https://castlery.atlassian.net/wiki/spaces/TEC/pages/715489281/Product+Level+Fulfillment
        if (shipment.line_items) {
          shipment.line_items.forEach((lineItem) => {
            const item = order.line_items.find((i) => i.id === lineItem.id);
            const modifiedItem = { ...item, quantity: lineItem.quantity };
            if (item) {
              items.push(modifiedItem);
            }
          });
        } else {
          shipment.manifest.forEach((id) => {
            const item = order.line_items.find((i) => i.id === id);
            if (item) {
              items.push(item);
            }
          });
        }

        const deliveryServices = shipment.available_service_products;

        console.log('deliveryServices------------------------>', deliveryServices);
        const selectedDeliveryServices = shipment.selected_service_products.map((service) => {
          if (service.type === 'disposal') {
            return {
              ...service,
              name: service.custom_attributes.disposal_item_type,
              size: service.custom_attributes.disposal_item_size,
            };
          }
          if (service.type === 'carry_up') {
            return service;
          }
          return service;
        });

        const { available_service_types: availableServiceTypes } =
          availableShipmentServices?.find((item) => item.shipment_id === shipment.id) || {};

        const tags = [];
        const tagsContent = null;
        if (items.some((it) => it.variant?.is_clearance)) {
          tags.push('clearance');
        }
        if (items.some((it) => it.variant?.is_customized)) {
          tags.push('customised');
        }
        if (tags.length > 0) {
          // tagsContent = (
          //   <div className={`${style.multipleItems}__tag`}>
          //     Note: Cancellations or Returns are not applicable for {tags.join(' and ')} item.{' '}
          //     <Link target="_blank" to={getUrl('sales-and-refunds')} onClick={(e) => e.stopPropagation()}>
          //       {'More details >'}
          //     </Link>
          //   </div>
          // );
        }

        let shipmentTotal = 0;

        if (config.enableNewPromotion) {
          shipmentTotal = toPrice(
            shipment.line_items.reduce(
              (acc, cur) => acc + (cur.line_item.is_free_item ? 0 : cur.line_item.price * cur.quantity),
              0
            ),
            true
          );
        } else {
          shipmentTotal = toPrice(
            shipment.line_items.reduce((acc, cur) => acc + cur.line_item.price * cur.quantity, 0),
            true
          );
        }

        const isFromDamco = __COUNTRY__ === 'SG' && daysToDate(shipment.min_dispatch_date) === 2;
        const selectedDate = shipment.estimated_delivery_date_start || shipment.estimated_dispatch_date;
        const minDate = shipment.min_delivery_date || shipment.min_dispatch_date;

        // only show single date when it is minDate and isFromDamco
        const isSingleDate = isFromDamco && getDate(selectedDate).isSame(minDate, 'day');

        const handleSelectDate = (e) => {
          e.stopPropagation();
          dispatch({ type: EVENT_DELIVERY_PERIOD_CLICK });
          const description = {
            SG: 'Confirmation of delivery date is subject to the availability of our delivery partners. You will receive a scheduling link via SMS & email closer to your preferred date to select the actual delivery date & timeslot.',
            AU: 'Confirmation of delivery date is subject to the availability of our delivery partners. They will reach out to you directly to schedule the actual delivery date & timeslot.',
            US: null,
            CA: null,
            UK: 'Confirmation of delivery date is subject to the availability of our delivery partners. They will reach out to you directly to schedule the actual delivery date & timeslot.',
          };
          frame.openModal('calendar', {
            title: `Schedule Your Delivery for Shipment${order.shipments.length > 1 ? ` ${index + 1}` : ''}`,
            description: description[__COUNTRY__],
            isFromDamco,
            minDate,
            maxDate: shipment.max_delivery_date || shipment.max_dispatch_date,
            selectedDate,
            defaultEstimatedDate: shipment.default_estimated_delivery_date || shipment.default_estimated_dispatch_date,
            onDaySelect: (date) => changeDeliveryDate({ date, shipmentId: shipment.id }),
            disabledDays:
              DISABLED_DELIVERY_DATES[__COUNTRY__]?.[order?.country_state] || DISABLED_DELIVERY_DATES[__COUNTRY__]?.ALL,
            bufferDays: calculateBufferDaysExcludingWeekends(
              shipment.estimated_delivery_date_start,
              shipment.estimated_delivery_date_end
            ),
            leastBufferDays: daysBetweenStartToEnd(
              shipment.estimated_delivery_date_start,
              shipment.estimated_delivery_date_end
            ),
          });
        };

        if (order.shipments?.length === 1) {
          return (
            <MultipleItemsA
              key={index}
              order={order}
              items={items}
              shipment={shipment}
              deliveryServices={deliveryServices}
              selectedDeliveryServices={selectedDeliveryServices}
              handleSelectDate={handleSelectDate}
              isSingleDate={isSingleDate}
              handleConfirmServices={handleConfirmServices}
              tags={tagsContent}
              shipmentTotal={shipmentTotal}
              availableServiceTypes={availableServiceTypes}
              orderShipmentOptions={orderShipmentOptions}
            />
          );
        }

        return (
          <MultipleItemsB
            key={index}
            className={`${style.orderShipments}__itemsB`}
            index={index}
            order={order}
            items={items}
            shipment={shipment}
            deliveryServices={deliveryServices}
            selectedDeliveryServices={selectedDeliveryServices}
            handleSelectDate={handleSelectDate}
            handleConfirmServices={handleConfirmServices}
            tags={tagsContent}
            shipmentTotal={shipmentTotal}
            availableServiceTypes={availableServiceTypes}
            orderShipmentOptions={orderShipmentOptions}
          />
        );
      })}
    </div>
  );
};

OrderShipments.propTypes = {
  availableShipmentServices: PropTypes.array,
  handlePreferenceChange: PropTypes.func,
};

OrderShipments.contextTypes = {
  frame: PropTypes.object,
};

export default OrderShipments;
