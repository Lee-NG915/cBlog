import React, { useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { LogIn, SignUp, ResetPass } from 'components/Welcome';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { getUrl } from 'pages';
import { useSelector, useDispatch } from 'react-redux';
import { EVENT_PAGE_VIEW } from 'utils/track/constants';
import { gtmPageNames } from 'utils/track/config';
import { getLastPageView } from 'utils/track/common';
import { FrameContext } from './FrameContext';

import style from './style.scss';

const MainContent = ({ location, jump, handleSuccess, fromPDPBanner }) => {
  let content = null;
  if (location === 'logIn') {
    content = (
      <div className={`${style.login}__inner`}>
        <LogIn
          className={`${style.login}__form`}
          onSignUp={() => jump('signUp')}
          onResetPass={() => jump('resetPass')}
          onSuccess={handleSuccess}
        />
      </div>
    );
  } else if (location === 'signUp') {
    content = (
      <div className={`${style.login}__inner`}>
        <SignUp
          className={`${style.login}__signup`}
          onLogIn={() => jump('logIn')}
          onSuccess={handleSuccess}
          fromPDPBanner={fromPDPBanner}
        />
      </div>
    );
  } else if (location === 'resetPass') {
    content = (
      <div className={`${style.login}__inner`}>
        <ResetPass className={`${style.login}__resetPass`} onLogIn={() => jump('logIn')} />
      </div>
    );
  }
  return content;
};
MainContent.propTypes = {
  location: PropTypes.string,
  jump: PropTypes.func,
  handleSuccess: PropTypes.func,
  fromPDPBanner: PropTypes.bool,
};

const LoginModal = ({ onSuccess, onClose, fromCart, fromPDPBanner = false }) => {
  const historyViews = useSelector((state) => state.tracking.historyViews);
  const frame = useContext(FrameContext);
  const lastPageView = getLastPageView(historyViews);
  const [location, setLocation] = useState(fromPDPBanner ? 'signUp' : 'logIn'); // can be 'logIn', 'signUp', 'resetPass'
  const dispatch = useDispatch();

  const trackPageView = useCallback(
    (result) => {
      dispatch({
        type: EVENT_PAGE_VIEW,
        result,
      });
    },
    [dispatch]
  );

  const trackPageViewByLocation = useCallback(
    (loc) => {
      let pathname;
      switch (loc) {
        case 'logIn':
          pathname = getUrl('login');
          break;
        case 'signUp':
          pathname = getUrl('signup');
          break;
        case 'resetPass':
          pathname = getUrl('reset-password');
          break;
        default:
          pathname = '';
      }
      trackPageView({
        pathname,
        pageName: gtmPageNames.accountPage,
      });
    },
    [trackPageView]
  );

  useEffect(() => {
    trackPageViewByLocation(location);

    return () => {
      if (lastPageView) {
        trackPageView({
          ...lastPageView,
        });
      }
    };
  }, []);

  const handleSuccess = () => {
    frame.removeModal();
    if (__YOTPO_ENABLED__ && [getUrl('referral'), getUrl('rewards')].includes(window.location?.pathname?.slice(3))) {
      if (fromCart) {
        const { origin, pathname } = window.location;
        const newUrl = `${origin + pathname}?open=cart`;
        window.location.href = newUrl;
      } else {
        window.location?.reload();
      }
    }
    if (onSuccess) {
      onSuccess();
    }
  };

  const jump = (loc) => {
    setLocation(loc);
    trackPageViewByLocation(loc);
  };

  const closeHandler = (e) => {
    if (e.target.classList.contains(style.login)) {
      frame.removeModal();
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div role="menuitem" className={style.login} onClick={closeHandler}>
      <div className={`${style.login}__container`}>
        <div>
          <MainContent location={location} jump={jump} handleSuccess={handleSuccess} fromPDPBanner={fromPDPBanner} />
          <button
            type="button"
            className={classNames('btn', `${style.login}__close`)}
            onClick={() => {
              frame.removeModal();
              if (onClose) {
                onClose();
              }
            }}
          >
            <ReactSVG name="close" />
          </button>
        </div>
      </div>
    </div>
  );
};

LoginModal.propTypes = {
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  fromCart: PropTypes.bool,
  fromPDPBanner: PropTypes.bool,
};
LoginModal.animation = 'plain';

export default LoginModal;
