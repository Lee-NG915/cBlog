import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getUrl } from 'pages';
import { EVENT_CHECKOUT } from 'utils/track/constants';
import { useSelector, useDispatch } from 'react-redux';

import { ArrowBtn } from 'components/Button';
import { randomId } from 'utils/number';
import { Box, Button, Link, NiceModal, Stack, useBreakpoints, Typography } from '@castlery/fortress';
import { BlueTips } from 'fortress/Icons';
import lang from 'utils/lang';
import GiftModal from './GiftModal';
import style from './style.scss';

const CheckoutBtn = ({ fromModal }, { frame, router }) => {
  const cart = useSelector((state) => state.cart);
  const order = cart.data;
  const [modalHasOpen, setModalHasOpen] = useState(false);
  const [customizedNames, setCustomizedNames] = useState([]);
  const dispatch = useDispatch();
  const { mobile } = useBreakpoints();

  const trackEvent = () => {
    const eventId = randomId('initiateCheckout');
    dispatch({
      type: EVENT_CHECKOUT,
      result: {
        checkoutStep: 1,
        eventId,
      },
    });
  };

  const handleCheckout = () => {
    const giftPromos = cart.giftPromotions;
    const chosenGift = order.line_items.find((lineItem) => lineItem.is_gift);

    if (
      giftPromos &&
      giftPromos[0] &&
      giftPromos[0].is_eligible &&
      !chosenGift &&
      !window.sessionStorage.getItem('christmas_gift_confirmed')
    ) {
      frame.openModal('prompt', {
        onContinue: {
          text: 'Continue',
          action: handleCheckout,
        },
        onAbort: {
          text: 'Choose Gift',
          action: () => frame.addModal(<GiftModal />),
        },
        title: "Don't forget your Free Gift",
        body: "Click 'Choose Gift' to select your preferred Free Gift.",
      });
      window.sessionStorage.setItem('christmas_gift_confirmed', 1);
      return;
    }
    trackEvent();
    router.push(getUrl('checkout-account'));
  };

  const handlePreCheckCustomized = () => {
    const { line_items: lineItems } = order;
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      const customizedGroup = [];
      lineItems.forEach((item) => {
        const { variant } = item;
        if (variant.is_customized) {
          customizedGroup.push(variant.name);
        }
      });
      if (customizedGroup.length > 0) {
        setCustomizedNames(customizedGroup);
        setModalHasOpen(true);
      } else {
        handleCheckout();
      }
    }
  };

  const renderCustomizedCheckModal = () => {
    if (mobile) {
      return (
        <NiceModal
          onClose={() => setModalHasOpen(false)}
          open={modalHasOpen}
          border={false}
          showDefaultFooter={false}
          dialogSx={{
            maxWidth: 358,
          }}
        >
          <Stack
            sx={{
              alignItems: 'center',
            }}
          >
            <Stack
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (theme) => theme.palette.brand.charcoal[800],
                marginBottom: 1,
                flexDirection: 'row',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  maxWidth: 40,
                  maxHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 1,
                  svg: {
                    width: 30,
                    height: 30,
                    maxWidth: 30,
                    maxHeight: 30,
                  },
                }}
              >
                <BlueTips width={30} height={30} viewBox="0 0 32 32" />
              </Box>
              <Typography level="h3">Confirm Your Selection</Typography>
            </Stack>
            <Typography
              sx={{
                textAlign: 'center',
              }}
            >
              {lang.t('common.customized_tips_content')}
            </Typography>
            <Link
              sx={{
                fontSize: 14,
                color: '#D25C1B',
                marginBottom: 1,
              }}
              href={`${__BASE_URL__}${getUrl('sales-and-refunds')}`}
              level="body1"
            >
              Learn more here.
            </Link>
            <Stack
              sx={{
                marginBottom: 3,
              }}
            >
              {customizedNames.map((name, index) => (
                <Typography
                  key={index}
                  sx={{
                    fontSize: 12,
                    textAlign: 'center',
                    color: (theme) => theme.palette.brand.charcoal[500],
                  }}
                  level="body2"
                >
                  <span
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        right: 12,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: (theme) => theme.palette.brand.charcoal[500],
                      }}
                    />
                  </span>
                  {name}
                </Typography>
              ))}
            </Stack>
            <Stack
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                variant="plain"
                sx={{
                  width: 294,
                  marginBottom: 2,
                  color: '#F6F3E7',
                  '--variant-solidColor': '#F6F3E7',
                  '--variant-solidBg': '#D25C1B',
                  '--variant-solidHoverColor': '#F6F3E7',
                  '--variant-solidHoverBorder': '#BF5419',
                  '--variant-solidHoverBg': '#BF5419',
                  '--variant-solidActiveBorder': '#74330F',
                  '--variant-solidActiveColor': '#F6F3E7',
                  '--variant-solidActiveBg': '#74330F',
                  textDecoration: 'none',
                  borderColor: '#BF5419',
                  transition: '0.2s ease-out',
                  gap: '8px',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  '&:active': {
                    color: '#F6F3E7',
                  },
                  fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  '@media (min-width: 0px) and (max-width: 600px)': {
                    fontSize: '0.875rem',
                  },
                  '@media (min-width: 601px) and (max-width: 900px)': {
                    fontSize: '0.875rem',
                  },
                  '@media (min-width: 901px)': {
                    fontSize: '0.875rem',
                  },
                }}
                onClick={() => {
                  handleCheckout();
                  setModalHasOpen(false);
                }}
              >
                Accept and Checkout
              </Button>
              <Button
                onClick={() => setModalHasOpen(false)}
                variant="secondary"
                sx={{
                  width: 294,
                  color: '#3C101E',
                  backgroundColor: 'transparent',
                  '--variant-outlinedHoverBg': '#63404B',
                  '--variant-outlinedActiveBg': '#3C101E',
                  '--variant-outlinedHoverColor': '#F6F3E7',
                  '--variant-outlinedColor': '#3C101E',
                  '--variant-outlinedHoverBorder': '#3C101E',
                  '--variant-outlinedActiveBorder': '#3C101E',
                  '--variant-outlinedActiveColor': '#F6F3E7',
                  textDecoration: 'none',
                  borderColor: '#3C101E',
                  transition: '0.2s ease-out',
                  gap: '8px',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  '&:active': {
                    color: '#F6F3E7',
                  },
                  fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  '@media (min-width: 0px) and (max-width: 600px)': {
                    fontSize: '0.875rem',
                  },
                  '@media (min-width: 601px) and (max-width: 900px)': {
                    fontSize: '0.875rem',
                  },
                  '@media (min-width: 901px)': {
                    fontSize: '0.875rem',
                  },
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </NiceModal>
      );
    }
    return (
      <NiceModal
        title={
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                maxWidth: 40,
                maxHeight: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 1,
                svg: {
                  width: 30,
                  height: 30,
                  maxWidth: 30,
                  maxHeight: 30,
                },
              }}
            >
              <BlueTips width={30} height={30} viewBox="0 0 32 32" />
            </Box>
            <Typography level="h3">Confirm Your Selection</Typography>
          </Stack>
        }
        onClose={() => setModalHasOpen(false)}
        open={modalHasOpen}
        border={false}
        showDefaultFooter={false}
      >
        <Stack
          sx={{
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
            }}
            level="body1"
          >
            {lang.t('common.customized_tips_content')}
          </Typography>
          <Link
            sx={{
              color: '#D25C1B',

              textDecoration: 'underline',
              marginBottom: 2,
            }}
            level="body1"
            href={`${__BASE_URL__}${getUrl('sales-and-refunds')}`}
          >
            Learn more here.
          </Link>
          <Stack
            sx={{
              marginBottom: 3,
            }}
          >
            {customizedNames.map((name, index) => (
              <Typography
                key={index}
                sx={{
                  textAlign: 'center',
                  color: (theme) => theme.palette.brand.charcoal[500],
                }}
                level="body2"
              >
                <span
                  style={{
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      right: 12,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: (theme) => theme.palette.brand.charcoal[500],
                    }}
                  />
                </span>
                {name}
              </Typography>
            ))}
          </Stack>
          <Stack
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button
              onClick={() => setModalHasOpen(false)}
              variant="secondary"
              sx={{
                width: 248,
                marginRight: 2,
                color: '#3C101E',
                backgroundColor: 'transparent',
                '--variant-outlinedHoverBg': '#63404B',
                '--variant-outlinedActiveBg': '#3C101E',
                '--variant-outlinedHoverColor': '#F6F3E7',
                '--variant-outlinedColor': '#3C101E',
                '--variant-outlinedHoverBorder': '#3C101E',
                '--variant-outlinedActiveBorder': '#3C101E',
                '--variant-outlinedActiveColor': '#F6F3E7',
                textDecoration: 'none',
                borderColor: '#3C101E',
                transition: '0.2s ease-out',
                gap: '8px',
                borderRadius: '8px',
                padding: '12px 24px',
                '&:active': {
                  color: '#F6F3E7',
                },
                fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
                fontWeight: 400,
                lineHeight: 1.4,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                '@media (min-width: 0px) and (max-width: 600px)': {
                  fontSize: '0.875rem',
                },
                '@media (min-width: 601px) and (max-width: 900px)': {
                  fontSize: '0.875rem',
                },
                '@media (min-width: 901px)': {
                  fontSize: '0.875rem',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="plain"
              sx={{
                width: 248,
                color: '#F6F3E7',
                '--variant-solidColor': '#F6F3E7',
                '--variant-solidBg': '#D25C1B',
                '--variant-solidHoverColor': '#F6F3E7',
                '--variant-solidHoverBorder': '#BF5419',
                '--variant-solidHoverBg': '#BF5419',
                '--variant-solidActiveBorder': '#74330F',
                '--variant-solidActiveColor': '#F6F3E7',
                '--variant-solidActiveBg': '#74330F',
                textDecoration: 'none',
                borderColor: '#BF5419',
                transition: '0.2s ease-out',
                gap: '8px',
                borderRadius: '8px',
                padding: '12px 12px',
                '&:active': {
                  color: '#F6F3E7',
                },
                fontFamily: 'SanomatSans, Helvetica Neue, Arial, sans-serif',
                fontWeight: 400,
                lineHeight: 1.4,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                '@media (min-width: 0px) and (max-width: 600px)': {
                  fontSize: '0.875rem',
                },
                '@media (min-width: 601px) and (max-width: 900px)': {
                  fontSize: '0.875rem',
                },
                '@media (min-width: 901px)': {
                  fontSize: '0.875rem',
                },
              }}
              onClick={() => {
                handleCheckout();
                setModalHasOpen(false);
              }}
            >
              Accept and Checkout
            </Button>
          </Stack>
        </Stack>
      </NiceModal>
    );
  };

  const loading = cart.loading || cart.creating || cart.processing;
  const isOutdated = order && order.line_items.some((item) => item.is_price_outdated || item.is_region_outdated);
  if (order && order.line_items.length > 0) {
    return (
      <>
        <ArrowBtn
          tabIndex="0"
          data-selenium="check-out"
          onClick={handlePreCheckCustomized}
          block
          text="Checkout"
          loading={loading}
          disabled={isOutdated}
          className={style.checkoutBtn}
        />
        {renderCustomizedCheckModal()}
      </>
    );
  }
  return (
    <>
      <ArrowBtn
        href={__BASE_URL__}
        onClick={() => {
          if (fromModal) {
            frame.removeModal();
          }
        }}
        block
        loading={loading}
        text="Continue Shopping"
        className={style.checkoutBtn}
      />
      {renderCustomizedCheckModal()}
    </>
  );
};

CheckoutBtn.propTypes = {
  fromModal: PropTypes.bool,
};

CheckoutBtn.contextTypes = {
  router: PropTypes.object,
  frame: PropTypes.object,
};

export default CheckoutBtn;
