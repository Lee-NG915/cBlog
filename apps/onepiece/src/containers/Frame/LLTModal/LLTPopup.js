import React, { useContext, useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { CloseBtn } from 'components/Button';
import { FrameContext } from 'containers/Frame/FrameContext';
import { EVENT_LONG_LEAD_TIME } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import SvgIcon from 'components/SvgIcon';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import LLTEmailForm from './LLTEmailForm';
import MobileModal from '../MobileModal';
import TextModal from '../TextModal';
import style from './style.scss';

const LongLeadTimePopup = ({ deliveryLeadTime, variant }) => {
  const frame = useContext(FrameContext);
  const container = useRef();
  const dispatch = useDispatch();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [email, setEmail] = useState('');
  const { desktop } = useBreakpoints();

  useEffect(() => {
    const input = container.current?.querySelector('input');
    if (showEmailInput) {
      if (input) {
        input.focus();
      }
    } else if (input) {
      input.blur();
    }
  }, [showEmailInput]);

  const handleClose = useCallback(
    ({ backToCart = true } = {}) => {
      frame.removeModal();
      dispatch({
        type: EVENT_LONG_LEAD_TIME,
        result: {
          detailAction: 'popup_close',
          label: `${variant?.sku} | ${variant?.name}`,
        },
      });

      if (backToCart) {
        frame.openModal('cart');
      }
    },
    [frame, dispatch, variant]
  );

  const showNotify = useCallback(() => {
    setShowEmailInput(!showEmailInput);
  }, [showEmailInput, setShowEmailInput]);

  return (
    <div
      className={style.longLeadTimePopup}
      role="menuitem"
      onClick={(e) => {
        if (e.target.classList.contains(style.longLeadTimePopup)) {
          handleClose();
        }
      }}
    >
      <div className={`${style.longLeadTimePopup}__container`}>
        <div className={`${style.longLeadTimePopup}__box`}>
          <h2 className={`${style.longLeadTimePopup}__title`}>This Might Take a While</h2>

          <div className={`${style.longLeadTimePopup}__intro`}>
            The estimated delivery time for this product is&nbsp;
            <span>{deliveryLeadTime}</span>. Would you like to proceed with your purchase?
          </div>

          <span className={`${style.longLeadTimePopup}__action`} onClick={handleClose} role="button">
            <span>Continue Adding To Cart</span>
            <SvgIcon name="line-right-arrow" />
          </span>

          {desktop && (
            <CloseBtn className={`${style.longLeadTimePopup}__close`} onClick={handleClose} data-selenium="llt_close" />
          )}
        </div>

        <button
          className={classNames(`${style.longLeadTimePopup}__button`, {
            'is-down': showEmailInput,
          })}
          type="button"
          data-selenium="llt_updated"
          onClick={showNotify}
        >
          <span>Keep Me Updated</span>
          <div className={`${style.longLeadTimePopup}__button-arrow-wrapper`}>
            <ReactSVG
              className={classNames(
                `${style.longLeadTimePopup}__button-arrow`,
                showEmailInput
                  ? `${style.longLeadTimePopup}__button-arrow-down`
                  : `${style.longLeadTimePopup}__button-arrow-up`
              )}
              name="custom-arrow"
            />
          </div>
        </button>
      </div>

      {showEmailInput && (
        <div
          className={classNames(`${style.longLeadTimePopup}__emailWrapper`, {
            'is-center': isFinished,
          })}
          ref={container}
        >
          {isFinished ? (
            <>
              <p>
                Thanks for your interest! A notification will be sent to <span>{email}</span> when the time is right.
                Sit tight!
              </p>
              <a
                className={`${style.longLeadTimePopup}__back`}
                role="button"
                onClick={() => handleClose({ backToCart: false })}
              >
                Back to Product Page
              </a>
            </>
          ) : (
            <>
              <p>
                Leave your email below and we’ll let you know when the product is available with a shorter waiting time.
              </p>

              <LLTEmailForm
                className={`${style.longLeadTimePopup}__form`}
                handleSubmit={(data) => {
                  setIsFinished(true);
                  setEmail(data);
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

LongLeadTimePopup.propTypes = {
  deliveryLeadTime: PropTypes.string,
  variant: PropTypes.object,
};

LongLeadTimePopup.defaultProps = {
  deliveryLeadTime: '',
  variant: {},
};

export const LLTPopupDesktopModal = ({ params, subOption }) => (
  <TextModal content={<LongLeadTimePopup {...params} />} {...subOption} />
);
LLTPopupDesktopModal.animation = 'plain';
LLTPopupDesktopModal.propTypes = {
  params: PropTypes.object,
  subOption: PropTypes.object,
};

export const LLTPopupMobileModal = ({ params, subOption }) => (
  <MobileModal content={<LongLeadTimePopup {...params} />} {...subOption} />
);
LLTPopupMobileModal.animation = 'bottomUpFade';
LLTPopupMobileModal.propTypes = {
  params: PropTypes.object,
  subOption: PropTypes.object,
};
