import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Bem from 'utils/bem';
import { toPrice } from 'utils/number';
import Quantity from 'components/Quantity';
import { GhostArrowBtn } from 'components/Button';
import { Typography } from '@castlery/fortress';
import style from './style.scss';

const CarryUpService = ({ serviceProduct = {}, onConfirmServices, selectedService = [] }) => {
  const block = useMemo(() => new Bem(style.deliveryServiceModal), []);

  const [stories, setStories] = useState(
    selectedService[0] && selectedService[0].custom_attributes
      ? selectedService[0].custom_attributes.number_of_stories
      : 1
  );
  const [items, setItems] = useState(
    selectedService[0] && selectedService[0].custom_attributes
      ? selectedService[0].custom_attributes.number_of_items
      : 1
  );

  const confirmServices = () => {
    onConfirmServices({
      sku: serviceProduct.sku,
      quantity: 1,
      price: serviceProduct.price,
      custom_attributes: {
        number_of_stories: stories,
        number_of_items: items,
      },
      type: serviceProduct.type,
    });
  };

  return (
    <div className={block.mod(serviceProduct.type)}>
      <div className={block.elm('title')}>Add {serviceProduct.name}</div>
      <div className={block.elm('description')}>
        Carry upstairs service is mandatory for delivery to any location above ground floor without direct lift access.
      </div>

      <div className={block.elm('grids')}>
        <div className={block.elm('grid').mod(serviceProduct.type)}>
          <div className={block.elm('grid').elm('header')}>
            <div>
              <div className={block.elm('grid').elm('title')}>
                <span>{serviceProduct.name}</span>
              </div>

              <div className={block.elm('grid').elm('price')}>
                <span>+ {toPrice(serviceProduct.price)}</span>
                <span>&nbsp;&nbsp;Per item per storey</span>
              </div>
            </div>

            {/* <div className={block.elm('grid').elm('selectHint')}>Select the number of storeys and items*</div> */}
          </div>

          <div className={block.elm('grid').elm('products')}>
            <div className={block.elm('grid').elm('product')}>
              <Typography level="body1">No. of storeys without lift access</Typography>
              <Quantity
                onMinus={() => setStories(stories - 1)}
                onPlus={() => setStories(stories + 1)}
                minusDisabled={stories <= 1}
                plusDisabled={stories >= serviceProduct.capability}
                quantity={stories}
              />
            </div>

            <div className={block.elm('grid').elm('product')}>
              <Typography level="body1">No. of items</Typography>
              <Quantity
                onMinus={() => setItems(items - 1)}
                onPlus={() => setItems(items + 1)}
                minusDisabled={items <= 1}
                plusDisabled={false}
                quantity={items}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={block.elm('terms')}>
        <div>
          Note: This service is limited to a maximum of {serviceProduct.capability} storeys / flights of stairs and the
          weight per item must not exceed 80kg each.
        </div>

        <div>
          Carry upstairs service includes carrying furniture up any flight of stairs within apartments or landed
          property.
        </div>

        <div>
          Carry upstairs service is required only for furniture items and does not need to be added on for accessory
          items.
        </div>
      </div>

      <div className={block.elm('confirm')}>
        <GhostArrowBtn
          className={block.elm('confirm').elm('button')}
          text="Confirm"
          hasArrow={false}
          onClick={confirmServices}
        />
      </div>
    </div>
  );
};

CarryUpService.propTypes = {
  serviceProduct: PropTypes.object,
  onConfirmServices: PropTypes.func,
  selectedService: PropTypes.array,
};

export default CarryUpService;
