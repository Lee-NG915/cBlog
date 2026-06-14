import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getUrl } from 'pages';
import { EVENT_CHECKOUT } from 'utils/track/constants';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowBtn } from 'components/Button';
import { randomId } from 'utils/number';
import PromptModalV2 from 'containers/Frame/PromptModalV2';
import { Box, Button, Link, NiceModal, Stack, useBreakpoints, Typography } from '@castlery/fortress';
import { BlueTips } from 'fortress/Icons';
import lang from 'utils/lang';
import { useFreeGiftCampaign } from './hooks/useFreeGiftCampaign';
import style from './style.scss';

const isClient = typeof window !== 'undefined';

const safeLocalStorage = {
  getItem: (key) => {
    if (!isClient) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem error:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    if (!isClient) return;
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage.setItem error:', error);
    }
  },
};

const CheckoutBtnV2 = ({ fromModal }, { frame, router }) => {
  const { desktop } = useBreakpoints();
  const cart = useSelector((state) => state.cart);

  const getFreeGiftRemindFlag = () => safeLocalStorage.getItem('freeGiftRemindFlag') === 'true';
  const setFreeGiftRemindFlag = (value) => safeLocalStorage.setItem('freeGiftRemindFlag', value.toString());

  const order = cart.data;
  const [modalHasOpen, setModalHasOpen] = useState(false);
  const [customizedNames, setCustomizedNames] = useState([]);
  const [freeGiftWarnModalOpen, setFreeGiftWarnModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { mobile } = useBreakpoints();

  const { validCampaignGiftPromotion, orderCampaignGift } = useFreeGiftCampaign();
  // useEffect(() => {
  //   setFreeGiftRemindFlag(false);
  // }, []);

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
    trackEvent();
    router.push(getUrl('checkout-account'));
  };

  const handlePreCheckCustomized = () => {
    const { line_items: lineItems } = order;
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      if (validCampaignGiftPromotion && !orderCampaignGift && !getFreeGiftRemindFlag()) {
        setFreeGiftWarnModalOpen(true);
        return;
      }

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
            backgroundColor: '#FBF9F4',
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
              level="body1"
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
                  '&:active,&:hover': {
                    span: {
                      color: '#F6F3E7',
                    },
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
                  backgroundColor: 'transparent',
                  '--variant-outlinedBorder': '#3C101E',
                  '--variant-outlinedColor': '#3C101E',
                  '--variant-outlinedHoverBg': '#63404B',
                  '--variant-outlinedHoverColor': '#F6F3E7',
                  '--variant-outlinedHoverBorder': '#3C101E',
                  '--variant-outlinedActiveBg': '#3C101E',
                  '--variant-outlinedActiveBorder': '#3C101E',
                  '--variant-outlinedActiveColor': '#F6F3E7',
                  textDecoration: 'none',
                  borderColor: '#3C101E',
                  transition: '0.2s ease-out',
                  gap: '8px',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: 'SanomatSans',
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
        dialogSx={{
          backgroundColor: '#FBF9F4',
          padding: 0,

          '.MuiModalDialog-root': {
            padding: 0,
          },
        }}
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
                '&:active,&:hover': {
                  color: '#F6F3E7',
                  span: {
                    color: '#F6F3E7',
                  },
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

  const FreeGiftRemindModal = (
    <>
      <PromptModalV2
        open={freeGiftWarnModalOpen}
        title="Don't miss your free gift!"
        description="Are you sure you want to checkout without claiming your free gift?"
        cancelText="Cancel"
        confirmText={!desktop ? 'Continue' : 'Continue'}
        // okBtnWidth={!desktop ? 'none' : '328px'}
        onCancel={() => setFreeGiftWarnModalOpen(false)}
        onConfirm={() => {
          setFreeGiftWarnModalOpen(false);
          setFreeGiftRemindFlag(true);
          handlePreCheckCustomized();
        }}
      />
    </>
  );

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
        {FreeGiftRemindModal}
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

CheckoutBtnV2.propTypes = {
  fromModal: PropTypes.bool,
};

CheckoutBtnV2.contextTypes = {
  router: PropTypes.object,
  frame: PropTypes.object,
};

export default CheckoutBtnV2;
