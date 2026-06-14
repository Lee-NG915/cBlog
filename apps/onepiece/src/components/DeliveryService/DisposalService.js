import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Bem from 'utils/bem';
import { toPrice } from 'utils/number';
import { GhostArrowBtn } from 'components/Button';
import Quantity from 'components/Quantity';

import style from './style.scss';
import renderDisposalServiceSupplementDesc from './config';

const DisposalService = ({ serviceProduct = {}, onConfirmServices, selectedService = [] }) => {
  const selectedServiceItemsRef = useRef(selectedService);
  const block = useMemo(() => new Bem(style.deliveryServiceModal), []);

  const [selectedServiceItems, setSelectedServiceItems] = useState(selectedService);

  selectedServiceItemsRef.current = selectedServiceItems;

  const calcServiceItem = useCallback(
    (product, size, type) => {
      let newSelectedServiceItems;
      const { current: currentSelectedServiceItems } = selectedServiceItemsRef;
      const indexOfItem = currentSelectedServiceItems.findIndex((s) => s.name === product.name);
      if (indexOfItem > -1) {
        newSelectedServiceItems = currentSelectedServiceItems.map((s, index) => {
          if (index === indexOfItem) {
            if (type === 'add') {
              return { ...s, quantity: (s.quantity || 0) + 1 };
            }
            return { ...s, quantity: (s.quantity || 0) - 1 };
          }
          return s;
        });
      } else {
        newSelectedServiceItems = [
          ...currentSelectedServiceItems,
          { ...product, quantity: 1, type: serviceProduct.type, size },
        ];
      }
      newSelectedServiceItems = newSelectedServiceItems.filter((s) => s.quantity > 0);
      setSelectedServiceItems(newSelectedServiceItems);
    },
    [serviceProduct.type]
  );

  const confirmServices = useCallback(() => {
    onConfirmServices(selectedServiceItemsRef.current);
  }, [onConfirmServices]);

  return (
    <div className={block.mod(serviceProduct.type)}>
      <div className={block.elm('title')}>Add {serviceProduct.name}</div>
      <div className={block.elm('description')}>
        Based on your delivery order, you can add{' '}
        {serviceProduct.data.map(({ capability, name }) => `${capability} ${name}`).join(' and ')}.
      </div>

      <div className={block.elm('grids')}>
        {serviceProduct.data.map((item) => {
          const capability =
            item.capability -
            selectedServiceItems.filter((s) => s.size === item.type).reduce((acc, cur) => acc + cur.quantity, 0);

          return (
            <div key={item.type} className={block.elm('grid')}>
              <div className={block.elm('grid').elm('header')}>
                <div>
                  <div className={block.elm('grid').elm('title')}>
                    <span>{item.name}</span>
                    <span>&nbsp;&times;&nbsp;{item.capability}</span>
                  </div>

                  <div className={block.elm('grid').elm('price')}>
                    <span>+ {toPrice(item.data[0].price)}</span>
                    <span>&nbsp;&nbsp;Per item</span>
                  </div>
                </div>

                {/* <div className={block.elm('grid').elm('selectHint')}>Select your furniture for disposal*:</div> */}
              </div>

              <div className={block.elm('grid').elm('products')}>
                {item.data.map((product) => {
                  const currentItem = selectedServiceItems.find((i) => i.name === product.name);
                  return (
                    <div className={block.elm('grid').elm('product')}>
                      <div>{product.name}</div>
                      <Quantity
                        onMinus={() => calcServiceItem(product, item.type, 'sub')}
                        onPlus={() => calcServiceItem(product, item.type, 'add')}
                        minusDisabled={!currentItem || currentItem.quantity <= 0}
                        plusDisabled={capability <= 0}
                        quantity={currentItem?.quantity || 0}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={block.elm('terms')}>
        <div>
          *Note: Disposal service applies only to like-for-like items in the same product category (e.g. Disposal of
          your old sofa during the delivery of your new sofa). Please ensure that each item to be disposed:
        </div>

        {renderDisposalServiceSupplementDesc('dismantled', __COUNTRY__)}

        <div>
          Castlery reserves the right to reject any unfit disposal item upon checking during collection and shall refund
          full sum of disposal fee within 14 business days.
        </div>

        {renderDisposalServiceSupplementDesc('contact', __COUNTRY__)}
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

DisposalService.propTypes = {
  serviceProduct: PropTypes.object,
  onConfirmServices: PropTypes.func,
  selectedService: PropTypes.array,
};

export default DisposalService;
