import React, { useEffect } from 'react';
import { Button } from '@castlery/fortress';
import { ArrowRight, ArrowLeft } from '@castlery/fortress/Icons';
import { storyblokEditable } from '@storyblok/react';
import { Link } from 'react-router';
import { EVENT_CLICK_BUTTON } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

export type ButtonProps = {
  _uid?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
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
  { blok, fullWidth = false, type = '', size = 'md' }: ButtonWrapperProps,
  { frame }: ContextProps
) {
  const {
    _uid,
    link,
    variant,
    text,
    start_decorator,
    end_decorator,
    klaviyo_form_id,
    tracking_label,
    need_send_coupon,
    estate_name,
  } = blok || {};
  const { url, target } = link || {};
  const isChope = url?.startsWith('https://book.chope.co');
  const isExternalLink = url?.startsWith('https://') || url?.startsWith('http://');
  const startDecorator = start_decorator === 'ArrowLeft' ? <ArrowLeft /> : null;
  const endDecorator = end_decorator === 'ArrowRight' ? <ArrowRight /> : null;
  const dispatch = useDispatch();

  const openChope = () => {
    frame.openModal('container', {
      hideCloseBtn: true,
      type: 'chope',
      component: <iframe title="chope" width="100%" height="100%" frameBorder="0" src={url} />,
    });
  };

  const trackClick = () => {
    dispatch({
      type: EVENT_CLICK_BUTTON,
      result: {
        buttonText: tracking_label || text,
        buttonLink: url || 'NA',
      },
    });
  };

  const handleCookieYesConsentUpdate = (eventData) => {
    const data = eventData.detail;
    if (data.accepted.includes('analytics')) {
      console.log('User consented to analytics');
      if (klaviyo_form_id) {
        window._klOnsite = window._klOnsite || [];
        window._klOnsite.push(['openForm', klaviyo_form_id]);
      }
    } else {
      console.log('User did not consent to analytics');
      // Optional: Handle cases where analytics is not accepted
    }
  };

  useEffect(() => {
    // Cleanup to remove the listener when the component unmounts
    return () => {
      document.removeEventListener('cookieyes_consent_update', handleCookieYesConsentUpdate);
    };
  }, []);

  const handleClick = () => {
    if (need_send_coupon && estate_name) {
      frame.openModal('homeowners', {
        estate: estate_name,
      });
    } else if (url) {
      if (isChope) {
        openChope();
      } else {
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
      }
    } else if (klaviyo_form_id) {
      window._klOnsite = window._klOnsite || [];
      try {
        if (window?.getCkyConsent) {
          const consent = getCkyConsent();
          if (consent.categories.analytics) {
            window._klOnsite.push(['openForm', klaviyo_form_id]);
          } else {
            const oCookieYesModal = document.querySelector('.cky-modal');
            if (oCookieYesModal) {
              console.log('🚀 ~ handleClick ~ oCookieYesModal:', oCookieYesModal);
              oCookieYesModal.classList.add('cky-modal-open');
              document.addEventListener('cookieyes_consent_update', handleCookieYesConsentUpdate);
            }
          }
        } else {
          window._klOnsite.push(['openForm', klaviyo_form_id]);
        }
      } catch (e) {
        console.log('🚀 ~ handle use cookie yes and klaviyo button ~ e:', e);
      }
    }
    trackClick();
  };

  const buttonElement = (
    <Button
      startDecorator={startDecorator}
      variant={variant}
      endDecorator={endDecorator}
      fullWidth={fullWidth}
      size={size}
      sx={() => {
        if (type === 'full-width') {
          return {
            textAlign: 'left',
            borderRightWidth: 0,
            borderLeftWidth: 0,
            borderBottomWidth: 0,
            justifyContent: 'space-between',
          };
        }
        return null;
      }}
    >
      {text}
    </Button>
  );

  return (
    <div {...storyblokEditable(blok)} key={_uid} onClick={handleClick}>
      {url && !isChope ? (
        isExternalLink ? (
          <a href={url} target={target}>
            {buttonElement}
          </a>
        ) : (
          <Link to={url} target={target}>
            {buttonElement}
          </Link>
        )
      ) : (
        [buttonElement]
      )}
    </div>
  );
}

ButtonWrapper.contextTypes = {
  frame: PropTypes.object,
};

export { ButtonWrapper };
