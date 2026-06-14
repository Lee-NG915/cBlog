import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'components/Button';
import ReactSVG from 'components/ReactSVG';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';
import { LLT_STATUS } from './constants';
import LLTEmailForm from './LLTEmailForm';
import MobileModal from '../MobileModal';

const ShowStep = ({ frame, status, process, deleteItem }) => {
  const [step, setStep] = useState(LLT_STATUS.SHOW_NOTIFY);

  useEffect(() => {
    setStep(status);
  }, [status]);

  const handleSubmit = useCallback(
    (nextStep) => {
      if (process) {
        process();
      }
      setStep(nextStep);
    },
    [process, setStep]
  );

  let element = null;
  if (step === LLT_STATUS.SHOW_NOTIFY) {
    element = (
      <div className={`${style.lltNotifyPage}__container`}>
        <h3>Be Kept In The Loop</h3>
        <p className={`${style.lltNotifyPage}__prompt`}>
          If you prefer not to wait (and we totally get it!), leave your email below and we'll update you when the
          product is available with a shorter waiting time.
        </p>

        <LLTEmailForm handleSubmit={() => handleSubmit(LLT_STATUS.NOTIFY_SUBSCRIBED)} />
      </div>
    );
  } else if (step === LLT_STATUS.REMOVE_QUERY) {
    element = (
      <div className={`${style.lltNotifyPage}__container`}>
        <h3>Remove From Cart</h3>

        <p className={`${style.lltNotifyPage}__prompt`}>
          Would you like to remove this from your cart? You may also wish to be notified when the product has a shorter
          waiting time.
        </p>

        <Button
          text="Keep Me Updated"
          backgroundcolor="dark-accent"
          onClick={() => {
            setStep(LLT_STATUS.REMOVE_SUBSCRIBING);
          }}
          border={false}
          style={{ fontSize: '14px', width: '100%' }}
        />

        <a
          role="button"
          onClick={() => {
            frame.removeModal();
            if (process) {
              process();
            }
          }}
          className={`${style.lltNotifyPage}__link`}
        >
          Don’t Notify Me; Please Remove
        </a>
      </div>
    );
  } else if (step === LLT_STATUS.REMOVE_SUBSCRIBING) {
    element = (
      <div className={`${style.lltNotifyPage}__container`}>
        <h3>Remove From Cart</h3>

        <p className={`${style.lltNotifyPage}__prompt`}>
          If you prefer not to wait (and we totally get it!), leave your email below and we’ll update you when the
          product is available with a shorter waiting time.
        </p>

        <LLTEmailForm handleSubmit={() => handleSubmit(LLT_STATUS.REMOVE_SUBSCRIBED)} deleteItem={deleteItem} />

        <a
          role="button"
          onClick={() => {
            frame.removeModal();
            if (process) {
              process();
            }
          }}
          className={`${style.lltNotifyPage}__link`}
        >
          Don't Notify Me; Please Remove
        </a>
      </div>
    );
  } else if (step === LLT_STATUS.NOTIFY_SUBSCRIBED) {
    element = (
      <div className={`${style.lltNotifyPage}__container`}>
        <h3>We’ll Keep You Updated</h3>

        <p className={`${style.lltNotifyPage}__prompt-center`}>
          Thanks for your interest! In the meantime, sit tight and we'll drop you a message when the time is right.
        </p>

        <a
          role="button"
          onClick={() => {
            frame.removeModal();
          }}
          className={`${style.lltNotifyPage}__link`}
        >
          Back to Product Page
        </a>
      </div>
    );
  } else if (step === LLT_STATUS.REMOVE_SUBSCRIBED) {
    element = (
      <div className={`${style.lltNotifyPage}__container`}>
        <h3>We’ll Keep You In The Loop</h3>

        <p className={`${style.lltNotifyPage}__prompt-center`}>
          Thanks for your interest! In the meantime, sit tight and we'll drop you a message when the time is right.
        </p>

        <a
          role="button"
          onClick={() => {
            frame.removeModal();
          }}
          className={`${style.lltNotifyPage}__link`}
        >
          Back to Shopping Cart
        </a>
      </div>
    );
  }
  return element;
};

ShowStep.propTypes = {
  frame: PropTypes.object,
  status: PropTypes.number,
  process: PropTypes.func,
  deleteItem: PropTypes.object,
};
ShowStep.defaultProps = {
  status: LLT_STATUS.SHOW_NOTIFY,
};

const LLTNotifyPage = ({ frame, status, process, deleteItem }) => {
  const handleClosePopup = useCallback(() => {
    frame.removeModal();
  }, [frame]);
  const { desktop } = useBreakpoints();

  return (
    <div className={`${style.lltNotifyPage}`}>
      <ShowStep frame={frame} status={status} process={process} deleteItem={deleteItem} />

      {desktop && (
        <button type="button" className={`btn ${style.lltNotifyPage}__close`} onClick={handleClosePopup}>
          <ReactSVG name="close" className={`${style.lltNotifyPage}__dismiss`} />
        </button>
      )}
    </div>
  );
};

LLTNotifyPage.propTypes = {
  frame: PropTypes.object,
  status: PropTypes.number,
  process: PropTypes.func,
  deleteItem: PropTypes.object,
};

LLTNotifyPage.defaultProps = {
  status: LLT_STATUS.SHOW_NOTIFY,
};

export const LLTNotifyDesktopModal = ({ params }) => <LLTNotifyPage {...params} />;
LLTNotifyDesktopModal.animation = 'side';
LLTNotifyDesktopModal.propTypes = {
  params: PropTypes.object,
};

export const LLTNotifyMobileModal = ({ params, subOption }) => (
  <MobileModal content={<LLTNotifyPage {...params} />} {...subOption} />
);
LLTNotifyMobileModal.animation = 'bottomUpFade';
LLTNotifyMobileModal.propTypes = {
  params: PropTypes.object,
  subOption: PropTypes.object,
};
