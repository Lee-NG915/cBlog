'use client';

import { Button, Input, Link, NiceModal, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowLeft, ArrowRight, Close, RightArrow } from '@castlery/fortress/Icons';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { EVENT_FORM_SUBMIT, EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
import { sendEstatePromoCode } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useState } from 'react';
import { FortressImage } from '@castlery/shared-components';

export type ButtonProps = {
  _uid?: string;
  variant?: 'solid' | 'plain' | 'outlined' | 'secondary' | 'primary';
  text?: string;
  link: {
    url?: string;
    target?: string;
  };
  start_decorator?: string;
  end_decorator?: string;
  klaviyo_form_id?: string;
  tracking_label?: string;
  need_send_coupon?: boolean;
  estate_name?: string;
};

export type ButtonWrapperProps = {
  blok: ButtonProps;
  fullWidth?: boolean;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  textColor?: string;
};

type ContextProps = {
  frame: any;
};

declare global {
  interface Window {
    _klOnsite?: any[];
  }
}

function ButtonWrapper(
  { blok, fullWidth = false, type = '', size = 'md', color = '', textColor = '' }: ButtonWrapperProps,
  { frame }: ContextProps
) {
  const {
    _uid,
    link,
    variant,
    size: buttonSize,
    text,
    start_decorator,
    end_decorator,
    klaviyo_form_id,
    tracking_label,
    need_send_coupon,
    estate_name,
  } = blok || {};

  const { url, target } = link || {};
  const isExternalLink = url?.startsWith('https://') || url?.startsWith('http://');
  const startDecorator = start_decorator === 'ArrowLeft' ? <ArrowLeft /> : null;
  const endDecorator = end_decorator === 'ArrowRight' ? <ArrowRight /> : null;
  const [estateModalOpen, setEstateModalOpen] = useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [finishModalInfo, setFinishModalInfo] = useState({
    status: 'success',
    title: 'Thank You!',
    desc: 'Check your inbox for the promo code!',
    showCancelBtn: false,
    confirmText: 'CLOSE',
  });
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();
  const { desktop } = useBreakpoints();
  const buttonTrackingTags = useTrackingTags({
    moduleName: 'general-button',
    elementName: text || '',
    ...(tracking_label ? { content: { trackingLabel: tracking_label } } : {}),
  });

  const handleGetPromoCode = async (email: string) => {
    if (!email) {
      return;
    }
    setButtonLoading(true);
    const res = await dispatch(sendEstatePromoCode.initiate({ email, estate: estate_name || '' }));
    setButtonLoading(false);
    if (res?.error) {
      setFinishModalInfo({
        status: 'error',
        title: 'Error',
        desc: res?.error?.data?.errors?.[0]?.detail || 'Something went wrong, please try again later.',
        showCancelBtn: false,
        confirmText: 'CLOSE',
      });
      setFinishModalOpen(true);
    } else if (res?.data?.code !== 0) {
      setFinishModalInfo({
        status: 'error',
        title: 'Error',
        desc: res?.data?.msg || 'Something went wrong, please try again later.',
        showCancelBtn: false,
        confirmText: 'CLOSE',
      });
      setFinishModalOpen(true);
    } else {
      setEstateModalOpen(false);
      setEmail('');
      setFinishModalInfo({
        status: 'success',
        title: 'Thank You!',
        desc: 'Check your inbox for the promo code!',
        showCancelBtn: false,
        confirmText: 'CLOSE',
      });
      dispatch(
        EVENT_FORM_SUBMIT({
          action: 'New Homeowners',
          label: estate_name || '',
          method: email,
        })
      );
      setFinishModalOpen(true);
    }
  };

  const handleClick = () => {
    dispatch(
      EVENT_STORYBLOK({
        action: 'button_click',
        label: tracking_label || text,
        method: document?.title || '',
        position: url || '',
      })
    );
    if (need_send_coupon && estate_name) {
      setEstateModalOpen(true);
    } else if (url) {
      const index = url.indexOf('#');
      if (index !== -1) {
        if (!isExternalLink || url.includes(window.location.origin)) {
          const anchor = url.substring(index);
          if (anchor) {
            setTimeout(() => {
              const targetElement = document.querySelector(anchor);
              if (targetElement) {
                targetElement.scrollIntoView();
              }
            }, 0);
          }
        }
      }
    } else if (klaviyo_form_id) {
      window._klOnsite = window._klOnsite || [];
      window._klOnsite.push(['openForm', klaviyo_form_id]);
    }
  };

  const buttonElement = (
    <Button
      {...buttonTrackingTags}
      startDecorator={startDecorator}
      variant={variant}
      endDecorator={endDecorator}
      fullWidth={fullWidth}
      size={buttonSize || size}
      sx={[
        {
          borderRadius: '8px !important',
        },
        type !== 'full-width' && {
          width: 'fit-content',
        },
        type === 'full-width' && {
          textAlign: 'left',
          borderRightWidth: 0,
          borderLeftWidth: 0,
          borderBottomWidth: 0,
          justifyContent: 'space-between',
        },
        color &&
          variant !== 'secondary' && {
            backgroundColor: color,
          },
        variant === 'secondary' && {
          backgroundColor: 'transparent !important',
          border: `1px solid ${color} !important`,
          '&:hover': {
            backgroundColor: '#3C101E !important',
            border: 'none !important',
            // border: `1px solid ${color} !important`,
          },
        },
        textColor && {
          color: textColor,
        },
        variant === 'primary' && {
          border: 'none !important',
          '&:hover': {
            // backgroundColor: 'rgba(195,106,62,.5) !important',
            color: '#fff !important',
            border: 'none !important',
          },
        },

        {
          '&:hover': {
            boxShadow: 'none !important',
          },
        },
      ]}
    >
      {text}
    </Button>
  );

  return (
    <>
      <Stack {...storyblokEditable(blok)} key={_uid} onClick={handleClick} sx={{ a: { textDecoration: 'none' } }}>
        {url ? (
          isExternalLink ? (
            <a href={url} target={target}>
              {buttonElement}
            </a>
          ) : (
            <Link href={url} target={target} sx={{ '&:hover': { textDecoration: 'none' } }}>
              {buttonElement}
            </Link>
          )
        ) : (
          [buttonElement]
        )}
      </Stack>
      <NiceModal
        open={estateModalOpen}
        onClose={() => setEstateModalOpen(false)}
        showCancelBtn={false}
        showConfirmBtn={false}
        showCloseBtn={false}
        dialogSx={{
          width: desktop ? '880px' : '342px',
          height: desktop ? '400px !important' : '569px !important',
          padding: 0,
          gap: '0 !important',
          border: '0 !important',
        }}
      >
        <Stack
          alignItems="flex-start"
          flexDirection={desktop ? 'row' : 'column'}
          sx={{ width: '100%', position: 'relative' }}
        >
          <FortressImage
            src={
              estate_name === 'HDBs'
                ? 'https://res.cloudinary.com/castlery/image/upload/v1727071852/NHO/HDB.jpg'
                : estate_name === 'Condos'
                ? 'https://res.cloudinary.com/castlery/image/upload/v1727071852/NHO/Condo.jpg'
                : 'https://res.cloudinary.com/castlery/image/upload/v1727071852/NHO/Landed.jpg'
            }
            alt="estate image"
            objectFit="cover"
            ratio={desktop ? 1 : 342 / 255}
            imageWidth={desktop ? 400 : 342}
            imageHeight={desktop ? 400 : 255}
          />
          {!desktop && (
            <Stack
              sx={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '18px',
                height: '18px',
                backgroundColor: '#f6f3e7',
                borderRadius: '50%',
              }}
              onClick={() => setEstateModalOpen(false)}
              alignItems="center"
              justifyContent="center"
            >
              <Close
                sx={{
                  width: '14px',
                  height: '14px',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              />
            </Stack>
          )}
          <Stack
            alignItems="center"
            sx={{
              width: desktop ? '480px' : '100%',
              padding: desktop ? '32px 24px' : '24px 16px',
              position: 'relative',
            }}
          >
            {desktop && (
              <Close
                sx={{
                  position: 'absolute',
                  top: '32px',
                  right: '24px',
                  cursor: 'pointer',
                }}
                onClick={() => setEstateModalOpen(false)}
              />
            )}
            <Typography level="h3" sx={(theme) => ({ mb: theme.spacing(2) })}>
              New Homeowners Special
            </Typography>
            <Typography level="body2" sx={(theme) => ({ mb: desktop ? theme.spacing(6) : theme.spacing(4) })}>
              {estate_name}
            </Typography>
            <Typography
              level="body2"
              sx={(theme) => ({ mb: desktop ? theme.spacing(5) : theme.spacing(1), width: '100%' })}
            >
              Email Address*
            </Typography>
            <Stack
              sx={(theme) => ({
                width: '100%',
                div: {
                  width: '100%',
                },
              })}
              alignItems="flex-start"
            >
              <Input
                id="promo-code-request-email"
                type="email"
                placeholder="Enter your email"
                sx={{
                  width: '100%',
                  mb: '24px',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGetPromoCode(e.target.value);
                  }
                }}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <Button
                variant="solid"
                onClick={() => handleGetPromoCode(email)}
                loading={buttonLoading}
                sx={(theme) => ({
                  width: '100%',
                })}
              >
                GET PROMO CODE
              </Button>
            </Stack>
            <Typography level="caption2" textAlign="center" sx={(theme) => ({ mt: theme.spacing(7) })}>
              By signing up, you consent to receiving marketing content from Castlery. You can unsubscribe anytime.
            </Typography>
          </Stack>
        </Stack>
      </NiceModal>
      <NiceModal
        title={finishModalInfo.title}
        desc={finishModalInfo.desc}
        success={finishModalInfo.status === 'success'}
        danger={finishModalInfo.status === 'error'}
        confirmText={finishModalInfo.confirmText}
        open={finishModalOpen}
        onClose={() => {
          if (finishModalInfo.status === 'success') {
            setFinishModalOpen(false);
            setEstateModalOpen(false);
          } else {
            setFinishModalOpen(false);
          }
        }}
        showCancelBtn={false}
        onConfirm={() => {
          if (finishModalInfo.status === 'success') {
            setFinishModalOpen(false);
            setEstateModalOpen(false);
          } else {
            setFinishModalOpen(false);
          }
        }}
      />
    </>
  );
}

export { ButtonWrapper };
