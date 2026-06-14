import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import { CardTwo } from 'components/Card';
import classNames from 'classnames';

import style from './style.scss';

const DeliveryService = (
  { className, serviceProduct = {}, handleConfirmServices, selectedService = [], itemsType },
  context
) => {
  const { frame } = context;
  const block = useMemo(() => new Bem(style.deliveryService), []);
  const hasSelectedService = useMemo(() => selectedService.length > 0, [selectedService]);
  const description = {
    carry_up:
      'Carry upstairs service is mandatory for delivery to any location above ground floor without direct lift access.',
    disposal: 'Disposal service applies only to like-for-like items in the same product category. ',
  };

  const onReset = useCallback(() => {
    handleConfirmServices(serviceProduct.type, []);
  }, [handleConfirmServices, serviceProduct.type]);

  const openDeliveryServiceModal = useCallback(() => {
    frame.openModal('deliveryServicesDetail', {
      serviceProduct,
      selectedService,
      handleConfirmServices,
    });
  }, [frame, selectedService, serviceProduct, handleConfirmServices]);

  const getSelectedServiceDesc = useCallback(() => {
    let selectedServiceObj;
    if (serviceProduct.type === 'disposal') {
      const selectedServiceTotal = selectedService.reduce(
        (acc, cur) => {
          acc.total += parseInt(cur.price * cur.quantity);
          acc.items.push(`${cur.quantity} x ${cur.name}`);
          return acc;
        },
        { total: 0, items: [] }
      );

      selectedServiceObj = {
        price: selectedServiceTotal.total ? toPrice(selectedServiceTotal.total) : '',
        description: selectedServiceTotal.items.join(', '),
      };
    } else if (serviceProduct.type === 'carry_up') {
      const {
        custom_attributes: { number_of_stories: numOfStories, number_of_items: numOfItems },
        price,
      } = selectedService[0];

      selectedServiceObj = {
        price: price ? toPrice(numOfItems * numOfStories * price) : '',
        description: `${numOfStories} ${numOfStories > 1 ? 'Storeys' : 'Storey'} |
          ${numOfItems} ${numOfItems > 1 ? 'Items' : 'Item'}`,
      };
    }
    return { ...selectedServiceObj };
  }, [selectedService, serviceProduct.type]);

  if (itemsType === 'B') {
    return (
      <div className={block.elm('variantB').mix(className)}>
        <div>
          <div className={block.elm('variantB').elm('name')}>{serviceProduct.name}</div>

          <div className={block.elm('variantB').elm('title')}>
            {hasSelectedService ? (
              <div>
                <span className={block.elm('variantB').elm('description')}>
                  <span>{getSelectedServiceDesc()?.description}</span>
                  <span
                    role="button"
                    className={block.elm('desc').elm('close')}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReset();
                    }}
                  >
                    <ReactSVG name="close" />
                  </span>
                </span>
                <span>{getSelectedServiceDesc()?.price}</span>
              </div>
            ) : (
              serviceProduct.hint
            )}
          </div>

          <div className={block.elm('variantB').elm('desc')}>{description[serviceProduct.type]}</div>
        </div>

        <a role="button" className={block.elm('variantB').elm('view')} onClick={openDeliveryServiceModal}>
          {hasSelectedService ? 'Change' : 'Select'}
        </a>
      </div>
    );
  }
  return (
    <div role="menuitem" className={block.mod(hasSelectedService ? 'selected' : '').mix(className)}>
      <CardTwo
        className={block.elm('item')}
        mainContent={
          <div>
            <div className={block.elm('name')}>{serviceProduct.name}</div>

            <div className={block.elm('desc').state('has-placeholder', !hasSelectedService)}>
              {description[serviceProduct.type]}
            </div>

            {hasSelectedService && (
              <div className={block.elm('desc').elm('select')}>
                <a role="button" onClick={openDeliveryServiceModal}>
                  {getSelectedServiceDesc()?.description}
                </a>

                <span
                  role="button"
                  className={block.elm('desc').elm('close')}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReset();
                  }}
                >
                  <ReactSVG name="close" />
                </span>
              </div>
            )}
          </div>
        }
        titleContent={
          <div
            className={classNames(block.elm('hint'), {
              'is-selected': hasSelectedService,
            })}
          >
            {hasSelectedService ? <div>{getSelectedServiceDesc()?.price}</div> : serviceProduct.hint}
          </div>
        }
        isSelected={hasSelectedService}
        onSelect={openDeliveryServiceModal}
      />
    </div>
  );
};

DeliveryService.propTypes = {
  className: PropTypes.string,
  serviceProduct: PropTypes.array,
  handleConfirmServices: PropTypes.func,
  selectedService: PropTypes.array,
  itemsType: PropTypes.string,
};

DeliveryService.contextTypes = {
  frame: PropTypes.object,
};

export default DeliveryService;
