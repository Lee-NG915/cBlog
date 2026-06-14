import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { changeShipmentServices } from 'redux/modules/cart';
import classNames from 'classnames';
import { CardTwo } from 'components/Card';
import ReactSVG from 'components/ReactSVG';
import { EVENT_SHIPPING_SERVICE_TYPE } from 'utils/track/constants';
import { serviceConfig } from 'config';
import AddOnServicePrice from './AddOnServicePrice';

import style from './style.scss';

const SERVICE_CONFIG = serviceConfig;

const ShipmentService = ({ shipment, onChange, onSuccess, onError }, { frame }) => {
  const { id, selected_service_type: selectedServiceType } = shipment || {};
  const { data: availableShipmentServices } = useSelector((state) => state.addOnServices) || {};
  const serviceTypes = availableShipmentServices?.find(
    (service) => service.shipment_id === id
  )?.available_service_types;
  const defaultSelected = selectedServiceType?.type;
  const [serviceSelected, setServiceSelected] = useState(defaultSelected);
  const dispatch = useDispatch();

  const handleServiceChange = (item, shipmentId) => {
    const { type: serviceType, display_name: serviceName } = item || {};
    if (serviceSelected === serviceType) {
      return;
    }

    if (onChange) {
      onChange();
    }

    dispatch(
      changeShipmentServices({
        shipment_service_types: [
          {
            shipment_id: shipmentId,
            service_type: serviceType,
          },
        ],
      })
    )
      .then(() => {
        setServiceSelected(serviceType);
        dispatch({
          type: EVENT_SHIPPING_SERVICE_TYPE,
          result: {
            label: serviceName,
            method: 'select',
            position: shipmentId,
          },
        });
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch((err) => {
        if (onError) {
          onError();
        }
        frame.openModal('response', { body: err });
      });
  };

  return (
    <div className={`${style.shipService}__service`}>
      {serviceTypes?.length > 0 &&
        serviceTypes.map((item) => (
          <CardTwo
            key={item.type}
            isSelected={serviceSelected === item?.type}
            onSelect={() => handleServiceChange(item, id)}
            className={`${style.shipService}__service__content`}
            mainContent={
              <>
                <div
                  className={classNames(`${style.shipService}__service__title`, {
                    'is-selected': serviceSelected === item?.type,
                  })}
                >
                  {item?.display_name}

                  {SERVICE_CONFIG[item.type]?.most_popular && (
                    <div className={`${style.shipService}__service__title__tag`}>
                      {SERVICE_CONFIG[item.type].most_popular_label}
                    </div>
                  )}
                </div>

                {SERVICE_CONFIG[item?.type] ? (
                  <div className={`${style.shipService}__service__config`}>
                    <ul>
                      {SERVICE_CONFIG[item.type].support?.map((support) => (
                        <li key={support}>
                          <ReactSVG name="check" className="check" />
                          <span>{support}</span>
                        </li>
                      ))}
                      {SERVICE_CONFIG[item.type].nonsupport?.map((nonsupport) => (
                        <li key={nonsupport} className={`${style.shipService}__service__config__nonsupport`}>
                          <ReactSVG name="close" />
                          <span>{nonsupport}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>{item?.display_content}</div>
                )}
              </>
            }
            titleContent={
              <AddOnServicePrice
                className={classNames(`${style.shipService}__service__price`, {
                  'is-selected': serviceSelected === item?.type,
                })}
                shipment={shipment}
                item={item}
              />
            }
          />
        ))}
    </div>
  );
};
ShipmentService.propTypes = {
  shipment: PropTypes.object,
  onChange: PropTypes.func,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};
ShipmentService.contextTypes = {
  frame: PropTypes.object,
};

export default ShipmentService;
