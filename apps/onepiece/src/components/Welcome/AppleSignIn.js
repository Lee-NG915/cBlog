/* eslint-disable camelcase */
import React, { useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login, updateUserTermsVersion } from 'redux/modules/auth';
import { FrameContext } from 'containers/Frame/FrameContext';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import { EVENT_SIGN_IN, EVENT_SIGN_UP } from 'utils/track/constants';
import ReactSVG from 'components/ReactSVG';
import { enableAlert } from 'config';
import style from './style.scss';
import { useLastTermsVersion, useAlertTermsModal } from './hooks/terms';

function AppleSignIn({ onCartLoaded, onSuccess, text, isLogin }) {
  const frame = useContext(FrameContext);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(__CLIENT__ && !!window.AppleID);
  const client = new ApiClient();
  const lastTermsVersion = useLastTermsVersion();
  const checkTerms = useAlertTermsModal();

  useEffect(() => {
    if (!window.AppleID) {
      const appleScript = document.createElement('script');
      // FIXME can use Script Component
      appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      appleScript.addEventListener('load', () => setLoaded(true));
      document.body.appendChild(appleScript);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      window.AppleID.auth.init({
        clientId: __APPLE_CLIENT_ID__,
        scope: 'name email',
        redirectURI: __BASE_URL__,
        state: 'Initial user authentication request',
        usePopup: true,
      });
    }
  }, [loaded]);

  const onLogIn = async (result) => {
    if (onCartLoaded) {
      await login(result, null, true)(dispatch);
      onCartLoaded();
    } else if (onSuccess) {
      await login(result)(dispatch);
      onSuccess();
    } else {
      await login(result)(dispatch);
    }
    dispatch({
      type: result.is_new_user ? EVENT_SIGN_UP : EVENT_SIGN_IN,
      result: {
        user: window.__user,
        method: 'Apple',
        tokens: result?.access_token,
      },
    });
    setBtnDisabled(false);
  };
  const signInWithApple = async () => {
    try {
      setBtnDisabled(true);
      const data = await window.AppleID.auth.signIn();
      const params = {
        data: {
          auth_code: data.authorization.code,
          id_token: data.authorization.id_token,
          redirect_uri: __BASE_URL__,
          firstname: data.user?.name?.firstName,
          lastname: data.user?.name?.lastName,
        },
      };

      const result = await client.post('/social_logins/apple', params);
      if (!isLogin) {
        dispatch(
          updateUserTermsVersion({
            data: {
              terms_of_use_version: lastTermsVersion,
            },
            accessToken: result.access_token,
          })
        );
        onLogIn(result);
      } else {
        checkTerms({
          accessToken: result.access_token,
          isNeedAlert: enableAlert,
          onConfirm: () => {
            onLogIn(result);
          },
          onCancel: () => {
            setBtnDisabled(false);
          },
        });
      }
    } catch (e) {
      let body = 'Sorry, something went wrong, please try again later or Log In with Castlery account.';
      if (e.error === 'popup_closed_by_user') {
        body = 'You have cancelled the login process.';
      }
      frame.openModal('response', {
        body,
      });
      setBtnDisabled(false);
    }
  };

  return loaded ? (
    <button disabled={btnDisabled} type="button" className={style.appleSignInBtn} onClick={signInWithApple}>
      <ReactSVG name="apple-logo" />
      {text}
    </button>
  ) : null;
}

AppleSignIn.propTypes = {
  onCartLoaded: PropTypes.func,
  onSuccess: PropTypes.func,
  text: PropTypes.string,
  isLogin: PropTypes.bool,
};

export default AppleSignIn;
