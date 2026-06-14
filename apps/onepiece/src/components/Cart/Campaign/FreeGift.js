import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect, useDispatch } from 'react-redux';
import Spinner from 'components/Spinner';
import { getUrl } from 'pages';
import { loadGiftsV2 } from 'redux/modules/cart';
import CustomScrollbar from 'components/CustomScrollbar';
import { Close, ChevronUp } from 'fortress/Icons';
import { Box, Typography } from '@castlery/fortress';
import { EVENT_GWP_BANNER_CLICK } from 'utils/track/constants';
import Gift from './Gift';
import { useFreeGiftCampaign } from '../hooks/useFreeGiftCampaign';

const FreeGift = ({ cart, loadGiftPromotions, isFullCart, removeFreeGift, giftPoolId }) => {
  const dispatch = useDispatch();
  const isChangeGift = !!giftPoolId;
  const [isOpen, setIsOpen] = useState(isChangeGift || false);

  const {
    validCampaignGiftPromotion,
    allFreeGiftCampaignPromotion = [],
    allFreeGiftValidPromotion,
  } = useFreeGiftCampaign();

  useEffect(() => {
    if (cart.data.number) {
      loadGiftPromotions({ orderNumber: cart.data.number, params: { coupon_code: cart?.data?.coupon?.code } });
    }
  }, []);

  const curGiftPromotion = isChangeGift
    ? allFreeGiftValidPromotion.find((promotion) => promotion?.gifts?.find((gift) => gift.gift_pool_id === giftPoolId))
    : validCampaignGiftPromotion || allFreeGiftCampaignPromotion?.[0];

  const couponCode = isChangeGift && curGiftPromotion?.control_type === 2 ? cart?.data?.coupon?.code : undefined;
  const gifts = curGiftPromotion?.gifts;
  const loading = cart.loadingGifts || cart.loading || cart.processing;

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isChangeGift) {
      removeFreeGift();
    } else {
      setIsOpen(!isOpen);
      if (!isOpen) {
        dispatch({
          type: EVENT_GWP_BANNER_CLICK,
        });
      }
    }
  };

  const sectionId = `free-gift-section-${giftPoolId || 'default'}`;
  const toggleId = `free-gift-toggle-${giftPoolId || 'default'}`;

  return (
    <Box
      component="section"
      aria-labelledby={toggleId}
      id={sectionId}
      sx={{
        ...(isChangeGift && {
          marginTop: isFullCart ? 0 : '16px',
        }),
        '--fortress-fontFamily-body': 'Aime',
      }}
    >
      <Box
        sx={{
          padding: !isFullCart ? '8px 16px 16px 16px' : '16px',
          gap: '16px',
          borderRadius: '4px',
          background: ' #F6F3E7',
        }}
      >
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              padding: '4px',
              height: '25px',
              background: '#844025',
              color: ' #F6F3E7',
              marginRight: '8px',
              fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
              fontWeight: 400,
              lineHeight: 1.4,
              letterSpacing: 0,
              fontSize: '0.75rem',
            }}
          >
            FREE
          </Box>
          <Box
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-controls={`${sectionId}-content`}
            id={toggleId}
            onClick={handleToggle}
            aria-label={isChangeGift ? 'Remove gift selection' : `${isOpen ? 'Collapse' : 'Expand'} gift selection`}
            sx={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'space-between',
              cursor: 'pointer',
              '& div': {
                '& svg': {
                  width: '24px',
                  height: '24px',
                },
                '&:hover': {
                  cursor: 'pointer',
                },
              },
            }}
          >
            <span>Choose your gift</span>
            <Box
              sx={{
                '& svg': {
                  color: '#212121',
                },
              }}
            >
              {isChangeGift ? (
                <Close sx={{ width: '24px', height: '24px' }} aria-hidden="true" />
              ) : (
                <ChevronUp
                  style={{
                    transform: `rotate(${isOpen ? 0 : 180}deg)`,
                    transition: 'transform 0.5s ease',
                  }}
                  aria-hidden="true"
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box
          id={`${sectionId}-content`}
          aria-hidden={!isOpen}
          sx={{
            maxHeight: isOpen ? '1000px' : '0px',
            overflow: 'hidden',
            transition: 'all 0.5s ease-in-out',
            '--fortress-fontFamily-body': 'Aime',
          }}
        >
          <Box
            sx={{
              margin: 0,
              marginTop: '16px',
              '& a': {
                color: '#D25C1B',
                textDecoration: 'underline',
              },
            }}
          >
            <Typography level="caption1">
              Note: Gifts are subject to stock availability.{' '}
              <Link
                level="caption1"
                href={`${__BASE_URL__}${getUrl('promo-terms')}`}
                sx={{
                  color: '#D25C1B',
                }}
              >
                T&Cs apply.
              </Link>
            </Typography>
          </Box>
          <CustomScrollbar
            content={
              <>
                {loading && <Spinner />}
                {gifts && (
                  <Box
                    role="list"
                    aria-label="Gift list"
                    sx={{
                      display: 'flex',
                      gap: '16px',
                    }}
                    className={loading ? 'is-loading' : ''}
                  >
                    {gifts.map((gift, index) => (
                      <Box key={gift?.variant?.id} component="li" role="listitem" sx={{ listStyle: 'none' }}>
                        <Gift
                          gift={gift}
                          isEligible={curGiftPromotion?.is_eligible}
                          listName="Gift Popup - Gift List"
                          listPosition={index + 1}
                          isMiniCart={!isFullCart}
                          couponCode={couponCode}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

FreeGift.propTypes = {
  cart: PropTypes.object,
  loadGiftPromotions: PropTypes.func,
  isFullCart: PropTypes.bool,
  removeFreeGift: PropTypes.func,
  giftPoolId: PropTypes.string,
};

FreeGift.contextTypes = {
  frame: PropTypes.object,
};

export default connect(
  (state) => ({
    cart: state.cart,
  }),
  (dispatch) => ({
    loadGiftPromotions: (payload) => dispatch(loadGiftsV2(payload)),
  })
)(FreeGift);
