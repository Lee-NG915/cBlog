import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import { getUrl } from 'pages';
import PromptModalV2 from 'containers/Frame/PromptModalV2';
import { Box } from '@castlery/fortress';
import Gift from './Campaign/Gift';
import { useFreeGiftCampaign } from './hooks/useFreeGiftCampaign';
import style from './style.scss';

const GiftModalV2 = ({ cart, couponCode }, context) => {
  const { validCouponGiftPromotion } = useFreeGiftCampaign();
  const [couponFreeGiftRemindModalOpen, setCouponFreeGiftRemindModalOpen] = useState(false);

  const gifts = validCouponGiftPromotion?.gifts || [];
  const loading = cart.loadingGifts || cart.loading || cart.processing;

  useEffect(() => {
    if (gifts.length === 0 || !validCouponGiftPromotion || !validCouponGiftPromotion.is_eligible) {
      setTimeout(() => {
        context?.frame?.removeModal();
      }, 100);
    }
  }, [gifts, validCouponGiftPromotion]);
  const handleChooseGift = () => {
    setCouponFreeGiftRemindModalOpen(true);
  };
  return (
    <div role="menuitem" className={style.modalV2}>
      <div className={`${style.modalV2}__container`}>
        <h3 className={`${style.modalV2}__title`}>Choose Your Free Gift</h3>
        <p className={`${style.modalV2}__desc`}>
          <span>
            Note: Gifts are subject to stock availability.{' '}
            <Link
              href={`${__BASE_URL__}${getUrl('promo-terms')}`}
              level="body2"
              sx={{
                a: {
                  color: '#3C101E',
                },
              }}
            >
              T&Cs apply.
            </Link>
          </span>
        </p>
        <div className={`${style.modalV2}__gifts-container`}>
          {loading && <Spinner />}

          {gifts && (
            <div
              className={`${style.modalV2}__gifts ${loading ? 'is-loading' : ''}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '16px',
                alignItems: 'stretch',
              }}
            >
              {gifts.map((gift, index) => (
                <Box
                  key={gift?.variant?.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Gift
                    gift={gift}
                    listName="Gift Popup - Gift List"
                    listPosition={index + 1}
                    isModalGift
                    couponCode={couponCode}
                    isEligible={validCouponGiftPromotion?.is_eligible}
                  />
                </Box>
              ))}
            </div>
          )}
        </div>
        <button type="button" className={`${style.modalV2}__close btn`} onClick={handleChooseGift}>
          <ReactSVG name="close" />
        </button>
      </div>
      <PromptModalV2
        open={couponFreeGiftRemindModalOpen}
        title="Don't miss your free gift!"
        description="Closing this pop-up will remove the applied gift code."
        cancelText="Cancel"
        confirmText="Continue"
        onCancel={() => {
          setCouponFreeGiftRemindModalOpen(false);
        }}
        onConfirm={() => {
          setCouponFreeGiftRemindModalOpen(false);
          setTimeout(() => {
            context?.frame?.removeModal();
          }, 100);
        }}
      />
    </div>
  );
};

GiftModalV2.propTypes = {
  cart: PropTypes.object,
  couponCode: PropTypes.string,
};

GiftModalV2.contextTypes = {
  frame: PropTypes.object,
};

export default connect(
  (state) => ({
    cart: state.cart,
  }),
  null
)(GiftModalV2);
