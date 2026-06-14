import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { addGiftV2 } from 'redux/modules/cart';
import { IconButton, Button, Box } from '@castlery/fortress';
import { useBreakpoints } from '@castlery/fortress/hooks';
import { EVENT_GWP_ADD_TO_CART_CLICK } from 'utils/track/constants';
import { AddShoppingBag, Check } from 'fortress/Icons';
import Variant from './FreeGiftVariant';

const Gift = (
  { gift, cart, user, addGiftV2, listName, listPosition, isMiniCart, isModalGift, couponCode, isEligible },
  context
) => {
  const dispatch = useDispatch();
  const breakpoints = useBreakpoints() || {};
  const { mobile: isMobile, desktop } = breakpoints;
  const giftPoolId = gift.gift_pool_id;

  const chooseGift = useCallback(() => {
    if (!user) {
      window.location.href = `${__BASE_URL__}/login?redirectUrl=${encodeURIComponent(`${__BASE_URL__}/cart`)}`;
      return;
    }

    dispatch({
      type: EVENT_GWP_ADD_TO_CART_CLICK,
      result: {
        giftId: giftPoolId,
      },
    });
    addGiftV2({
      gift_id: giftPoolId,
      variant_id: gift?.variant.id,
      quantity: gift?.quantity,
      coupon_code: couponCode,
    })
      .then(() => {
        if (isModalGift) {
          context.frame.removeModal();
        }
      })
      .catch((error) => context.frame.openModal('response', { body: error }));
  }, [addGiftV2, user, gift, context, dispatch, couponCode, giftPoolId]);

  const chosenGiftList = cart.data?.line_items.filter((lineItem) => lineItem.gift_id);

  const isChosen = chosenGiftList.find(
    (lineItem) => lineItem.gift_id === giftPoolId && lineItem.variant.id === gift.variant.id
  );
  const isOutOfStock = gift?.state === 'OUT_OF_STOCK';
  const isUnavailable = gift?.state === 'UNAVAILABLE';
  const isInStock = gift?.state === 'IN_STOCK';
  const isDisabled = isChosen || isOutOfStock || isUnavailable || !isInStock;

  const productName = gift?.variant?.product_name || 'Gift';
  const buttonId = `gift-button-${giftPoolId}-${gift?.variant?.id}`;

  const AddToCartBtn = () => {
    if (isUnavailable || isOutOfStock) {
      return (
        <Button
          variant="plain"
          disabled
          aria-label={`${productName} - ${isUnavailable ? 'Unavailable' : 'Out of stock'}`}
          sx={{
            '--fortress-fontFamily-body': 'Aime',
            borderRadius: '4px',
            gap: '0px',
            border: 'none',
            background: 'var(--colours-disabled-fill, #e9e9e9)',
            color: 'var(--colours-disabled-text, #929292)',
            textAlign: 'center',
            boxShadow: 'none',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '175%',
            ...(!isModalGift && {
              '--Button-minHeight': '29px',
              height: '29px',
            }),
            ...(isModalGift && {
              width: '100%',
            }),
          }}
        >
          {isUnavailable ? 'Unavailable' : 'Out of stock'}
        </Button>
      );
    }
    if (isChosen) {
      return (
        <IconButton
          data-selenium="free-gift-modal-button"
          id={buttonId}
          aria-label={`${productName} has been added to cart`}
          aria-pressed="true"
          disabled={cart.loading || cart.creating || cart.processing || isDisabled}
          onClick={chooseGift}
          sx={{
            '--IconButton-size': '32px',
            '--Button-minHeight': '29px',
            '--Button-minWidth': '29px',
            display: 'flex',
            width: '32px',
            height: '32px',
            padding: '6px',
            alignItems: 'center',
            fontSize: '16px',
            gap: '10px',
            borderRadius: '50%',
            border: '1px solid var(--colours-secondary-default, #c1af86)',
            backgroundColor: '#F6F3E7',
            '& svg': {
              color: '#877445',
            },
            ...(isModalGift && {
              width: '100%',
              height: '48px',
              borderRadius: '8px',
              border: '1px solid #3C101E',
              backgroundColor: 'transparent',
              color: '#3C101E',
              '& svg': {
                color: '#3C101E',
              },
            }),
          }}
        >
          <Check aria-hidden="true" />
        </IconButton>
      );
    }
    return (
      <IconButton
        variant="plain"
        data-selenium="free-gift-modal-button"
        id={buttonId}
        aria-label={`Add ${productName} to cart`}
        aria-pressed="false"
        disabled={cart.loading || cart.creating || cart.processing || isDisabled}
        onClick={chooseGift}
        sx={{
          '--IconButton-size': '32px',
          '--Button-minHeight': '29px',
          '--Button-minWidth': '29px',
          display: 'flex',
          width: '32px',
          height: '32px',
          padding: '6px',
          alignItems: 'center',
          fontSize: '16px',
          gap: '10px',
          borderRadius: '50%',
          border: '1px solid #3C101E',
          backgroundColor: '#F6F3E7',
          '& svg': {
            color: '#3C101E',
            ...(isMobile && {
              width: '20px',
              height: '20px',
            }),
          },
          ...(isModalGift && {
            width: '100%',
            height: '48px',
            borderRadius: '0',
            border: '1px solid var(--colours-secondary-default, #3C101E)',
            background: 'transparent',
            color: '#3C101E',
            '& svg': {
              color: '#3C101E',
            },
          }),
        }}
      >
        {isModalGift && !isMobile ? 'Add to Cart' : <AddShoppingBag aria-hidden="true" />}
      </IconButton>
    );
  };

  const modalStyles = isModalGift
    ? {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
      }
    : {};

  return (
    <Box
      component="section"
      aria-label={`Gift option: ${productName}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: isModalGift && !desktop ? '170px' : isMiniCart ? '142px' : '200px',
        ...modalStyles,
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Variant
          listName={listName}
          listPosition={listPosition}
          variant={gift.variant}
          showSku
          isMiniCart={isMiniCart}
          isModalGift={isModalGift}
        />
      </Box>

      {isEligible && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            ...(isModalGift ? { marginTop: 'auto', paddingTop: '8px' } : { marginTop: '8px' }),
          }}
        >
          <AddToCartBtn />
        </Box>
      )}
    </Box>
  );
};

Gift.propTypes = {
  gift: PropTypes.object,
  cart: PropTypes.object,
  user: PropTypes.object,
  addGiftV2: PropTypes.func,
  listName: PropTypes.string,
  listPosition: PropTypes.number,
  isMiniCart: PropTypes.bool,
  isModalGift: PropTypes.bool,
  couponCode: PropTypes.string,
  isEligible: PropTypes.bool,
};

Gift.contextTypes = {
  frame: PropTypes.object,
};

export default connect(
  (state) => ({
    cart: state.cart,
    user: state.auth.user,
  }),
  {
    addGiftV2,
  }
)(Gift);
