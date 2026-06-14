import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import ReactSVG from 'components/ReactSVG';
import ApiClient from 'helpers/ApiClient';
import { isIOS, isAndroid } from 'react-device-detect';
import { EVENT_START_AR } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { FrameContext } from './FrameContext';
import MobileModal from './MobileModal';
import style from './style.scss';

const ARModal = ({ url, uid, api, variantInfo, handleBack }) => {
  const frame = useContext(FrameContext);
  const [modelUrl, setModelUrl] = useState('');
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const variantInfoFormat = useMemo(() => {
    const { checkoutTitle, checkoutSubtitle, price } = variantInfo || {};
    if (isIOS) {
      return encodeURIComponent(`checkoutTitle=${checkoutTitle}&checkoutSubtitle=${checkoutSubtitle}&price=${price}`);
    }
    if (isAndroid) {
      return `title=${checkoutSubtitle}&link=${url}`;
    }
  }, [variantInfo, url]);

  const detectiOSARQuickLook = () => {
    const anchor = document.createElement('a');
    return anchor.relList.supports('ar');
  };

  const handleStartAR = useCallback(() => {
    frame.removeModal();
    dispatch({
      type: EVENT_START_AR,
      result: {
        modelId: uid,
      },
    });

    if (isIOS && !detectiOSARQuickLook()) {
      frame.openModal('arErrorModal', {
        handleClose: handleBack,
      });
    } else if (!modelUrl) {
      try {
        // Displays the AR popup if available. The callback has one parameter: an error or null if the operation succeeded.
        api?.startAR((err) => {
          if (!err) {
            console.log('Starting AR');
          } else {
            console.log(err, 'Starting AR Error');
            frame.openModal('arErrorModal');
          }
        });
      } catch (err) {
        console.log(err, 'AR Error');
        frame.openModal('arErrorModal', {
          handleClose: handleBack,
        });
      }
    }
  }, [api, modelUrl, frame, handleBack, dispatch, uid]);

  const handleClose = useCallback(() => {
    frame.removeModal();
    if (!desktop) {
      window.location.hash = '';
    }
  }, [frame, desktop]);

  useEffect(() => {
    const client = new ApiClient();
    let platform = '';

    if (isAndroid) {
      platform = 'android';
    } else if (isIOS) {
      platform = 'ios';
    }

    if (platform) {
      client
        .get(
          `${__ONE_PIECE_WEB_SERVER_NAME__}${
            __ONE_PIECE_WEB_SERVER_NAME__ === 'http://localhost' ? `:${__PORT__}` : ''
          }${__BASE_ROUTE__}/api/ar-model`,
          {
            params: {
              uid,
              platform,
            },
          }
        )
        .then((data) => {
          if (data?.url) {
            setModelUrl(data.url);
          }
        });
    }
  }, []);

  return (
    <div className={`${style.arModal}`}>
      <div className={`${style.arModal}__container`}>
        <h2>View in room with AR</h2>
        {desktop && (
          <div className={`${style.arModal}__container__qrCode`}>
            <QRCodeSVG value={`${url}#ar-via-qr-code`} />
          </div>
        )}
        <p>
          See this product in your room using Augmented Reality (AR) technology.
          <br />
        </p>
        <p>
          {desktop
            ? 'Scan the QR code with your smart device and allow camera access to start.'
            : 'Allow camera access to start.'}
        </p>
        {!desktop && <p>*Color shown is for AR Display only</p>}
        <img
          src="https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1657853428/static/web-ar/AR-prompt.jpg"
          alt="AR prompt"
        />

        {!desktop && (
          <div role="button" className={`${style.arModal}__start`} onClick={handleStartAR}>
            {isIOS && (
              <a rel="ar" href={`${modelUrl}#allowsContentScaling=0`}>
                <img alt="ar quick look" />
                <span style={{ color: '#fff' }}>Start</span>
              </a>
            )}

            {isAndroid && (
              <a
                rel="ar"
                href={`intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&resizable=false&${variantInfoFormat}&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${url}%23web-ar-not-supported;end;`}
              >
                <img alt="ar quick look" />
                <span style={{ color: '#fff' }}>Start</span>
              </a>
            )}
          </div>
        )}
      </div>

      {desktop && (
        <button type="button" className={`btn ${style.arModal}__close`} onClick={handleClose}>
          <ReactSVG name="close" />
        </button>
      )}
    </div>
  );
};
ARModal.propTypes = {
  url: PropTypes.string,
  uid: PropTypes.string,
  api: PropTypes.object,
  variantInfo: PropTypes.object,
  handleBack: PropTypes.func,
};

export const ARDesktopModal = ({ params }) => <ARModal {...params} />;
ARDesktopModal.animation = 'side';
ARDesktopModal.animationOptions = {
  position: 'right',
  maxWidth: 500,
};
ARDesktopModal.propTypes = {
  params: PropTypes.object,
};

export const ARMobileModal = ({ params, subOption }) => (
  <MobileModal content={<ARModal {...params} />} {...subOption} />
);
ARMobileModal.animation = 'bottomUpFade';
ARMobileModal.propTypes = {
  params: PropTypes.object,
  subOption: PropTypes.object,
};
