import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import { getUrl } from 'pages';
import { loadGifts } from 'redux/modules/cart';
import Gift from './Gift';

import style from './style.scss';

const GiftModal = ({ cart, loadGiftPromotions }, context) => {
  useEffect(() => {
    if (cart.data.number) {
      loadGiftPromotions({ orderNumber: cart.data.number });
    }
  }, []);

  const giftPromotions = cart.giftPromotions || [];
  const validPromotion = giftPromotions.find((promotion) => promotion.is_eligible);
  const isEligible = !!validPromotion;
  const gifts = isEligible ? validPromotion?.gifts : giftPromotions[0]?.gifts;
  const loading = cart.loadingGifts || cart.loading || cart.processing;
  const LIMIT = +giftPromotions[0]?.min_spend;

  return (
    <div
      role="menuitem"
      className={style.modal}
      onClick={(e) => {
        if (e.target.classList.contains(style.modal)) {
          context.frame.removeModal();
        }
      }}
    >
      <div className={`${style.modal}__container`}>
        <h3 className={`${style.modal}__title`}>{isEligible ? 'Choose Your Free Gift' : 'You’re almost there!'}</h3>
        <p className={`${style.modal}__desc`}>
          {isEligible ? (
            <span>
              Note: Gifts are subject to stock availability.{' '}
              <Link href={`${__BASE_URL__}${getUrl('promo-terms')}`}>T&Cs apply.</Link>
            </span>
          ) : (
            `Spend $${LIMIT - cart.data.item_total} more to receive one of the below items for FREE!`
          )}
        </p>

        <div className={`${style.modal}__gifts-container`}>
          {loading && <Spinner />}

          {gifts && (
            <div className={`${style.modal}__gifts ${loading ? 'is-loading' : ''}`}>
              {gifts.map((gift, index) => (
                <Gift key={gift.id} gift={gift} listName="Gift Popup - Gift List" listPosition={index + 1} />
              ))}
            </div>
          )}
        </div>

        <button type="button" className={`${style.modal}__close btn`} onClick={() => context.frame.removeModal()}>
          <ReactSVG name="close" />
        </button>
      </div>
    </div>
  );
};

GiftModal.propTypes = {
  cart: PropTypes.object,
  loadGiftPromotions: PropTypes.func,
};

GiftModal.contextTypes = {
  frame: PropTypes.object,
};

export default connect(
  (state) => ({
    cart: state.cart,
  }),
  (dispatch) => ({
    loadGiftPromotions: (payload) => dispatch(loadGifts(payload)),
  })
)(GiftModal);
