import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';

import { addGift } from 'redux/modules/cart';
import Variant from 'components/VariantList/Variant';
import { Button } from 'components/Button';
import { EVENT_GWP_ADD_TO_CART_CLICK } from 'utils/track/constants';
import style from './style.scss';

const Gift = ({ gift, cart, addGift, listName, listPosition }, context) => {
  const dispatch = useDispatch();
  const chooseGift = useCallback(() => {
    dispatch({
      type: EVENT_GWP_ADD_TO_CART_CLICK,
      result: {
        giftId: gift.id,
      },
    });
    addGift({ gift_id: gift.id })
      .then(() => {
        context.frame.removeModal();
      })
      .catch((error) => context.frame.openModal('response', { body: error }));
  }, [addGift, gift.id, context, dispatch]);

  const chosenGift = cart.data?.line_items.find((lineItem) => lineItem.is_gift);
  const isEligible = cart.giftPromotions && cart.giftPromotions.find((promotion) => promotion.is_eligible);
  const isChosen = chosenGift && chosenGift.variant.id === gift.variant.id;
  const isOutOfStock = gift?.state === 'OUT_OF_STOCK';
  const isUnavailable = gift?.state === 'UNAVAILABLE';
  const isInStock = gift?.state === 'IN_STOCK';
  const isDisabled = isChosen || isOutOfStock || isUnavailable || !isInStock;

  const btnLabel = useMemo(() => {
    if (isOutOfStock) {
      return 'Out of stock';
    }
    if (isChosen) {
      return 'Selected';
    }
    if (isUnavailable) {
      return 'Unavailable';
    }
    return 'Add To Cart';
  }, [isChosen, isOutOfStock, isUnavailable]);

  const addToCartBtn = (
    <Button
      type="button"
      data-selenium="free-gift-modal-button"
      text={btnLabel}
      disabled={cart.loading || cart.creating || cart.processing || isDisabled}
      onClick={chooseGift}
      className={`${style.gift}__add`}
      size="small"
    />
  );
  return (
    <div className={style.gift}>
      <Variant
        listName={listName}
        listPosition={listPosition}
        variant={gift.variant}
        className={`${style.gift}__item`}
        showSku
      />
      {isEligible && addToCartBtn}
    </div>
  );
};

Gift.propTypes = {
  gift: PropTypes.object,
  cart: PropTypes.object,
  addGift: PropTypes.func,
  listName: PropTypes.string,
  listPosition: PropTypes.number,
};

Gift.contextTypes = {
  frame: PropTypes.object,
};

export default connect(
  (state) => ({
    cart: state.cart,
  }),
  {
    addGift,
  }
)(Gift);
