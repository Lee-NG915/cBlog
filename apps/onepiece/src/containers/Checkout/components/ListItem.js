import React from 'react';
import PropTypes from 'prop-types';
import { LineItemProductImage, LineItemOptions, LineItemName, LineItemBundleOptions } from 'components/LineItem';
import StrikeoffPrice, { calcItemStrikeThroughPrice } from 'components/StrikeoffPrice';
import { toPrice } from 'utils/number';
import { Typography } from '@castlery/fortress';
import Bem from 'utils/bem';
import config from 'config';

import style from './style.scss';

const ListItem = (props) => {
  // acounting is true if in the order summary
  const { item, className } = props;
  const block = new Bem(style.item).mix(className);
  const hideQuantity =
    item.custom_attributes && (item.custom_attributes.type === 'slot' || item.custom_attributes.type === 'carry_up');

  const strikeoffPrice = calcItemStrikeThroughPrice(item);

  const isShowStrikeoffPrice = React.useMemo(
    () =>
      strikeoffPrice !== null &&
      +item.variant?.list_price > +item.variant?.price &&
      strikeoffPrice !== +item.amount + (+item.manual_discount_total || 0),
    [strikeoffPrice, item]
  );

  return (
    <div className={block}>
      <div>
        {item.variant.images && (
          <LineItemProductImage lineItem={item} className={block.elm('img').toString()} mediaQuery="200px" />
        )}
        <div className={block.elm('body').toString()}>
          <div className="flexContainer">
            <LineItemName lineItem={item} className={block.elm('name').toString()} />

            {(item.gift_id || item.is_gift) && config.enableNewPromotion ? (
              <Typography level="body2" color="#3C101E">
                Free
              </Typography>
            ) : (
              <StrikeoffPrice
                price={toPrice(+item.amount + (+item.manual_discount_total || 0), true)}
                strikeoffPrice={toPrice(strikeoffPrice, true)}
                showStrikeoffPrice={isShowStrikeoffPrice}
                fontSize={34}
              />
            )}
          </div>

          <LineItemOptions lineItem={item} className={block.elm('options').toString()} />

          {item.warranty_items && (
            <div className="flexContainer warrantyInfo">
              <span>{`Extended warranty: ${item.warranty_items.duration_months} months`}</span>
              <span className="price">{toPrice(item.warranty_items.warranty_offer_cost)}</span>
            </div>
          )}

          {!hideQuantity && <div className="quantity">Quantity: {item.quantity}</div>}
        </div>
      </div>
      <LineItemBundleOptions lineItem={item} className={block.elm('bundle').toString()} mediaQuery="120px" />
    </div>
  );
};

ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default ListItem;
