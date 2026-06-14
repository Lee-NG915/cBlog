import React from 'react';
import PropTypes from 'prop-types';
import FacebookLogin from 'react-facebook-login';
import config from 'config';
import ApiClient from 'helpers/ApiClient';
import { login, updateUserTermsVersion } from 'redux/modules/auth';
import ReactSVG from 'components/ReactSVG';
import { useDispatch } from 'react-redux';
import { EVENT_SIGN_IN, EVENT_SIGN_UP } from 'utils/track/constants';
import { setFbUserInSession } from 'utils/facebook';
import { useLastTermsVersion, useAlertTermsModal } from './hooks/terms';

import style from './style.scss';

const Facebook = ({ onSuccess, onCartLoaded, textButton, isLogin = false }, { frame }) => {
  const client = new ApiClient();
  const dispatch = useDispatch();
  const lastTermsVersion = useLastTermsVersion();
  const checkTerms = useAlertTermsModal();

  const onLogIn = (result) => {
    if (onCartLoaded) {
      dispatch(login(result, null, true))
        .catch(() => {})
        .then(() => onCartLoaded());
    } else if (onSuccess) {
      dispatch(login(result))
        .then(() => onSuccess())
        .catch((err) => console.error(JSON.stringify({ message: 'Facebook operation error', error: err }, null, 2)));
    } else {
      dispatch(login(result));
    }
    dispatch({
      type: result.is_new_user ? EVENT_SIGN_UP : EVENT_SIGN_IN,
      result: {
        user: window.__user,
        method: 'Facebook',
        tokens: result?.access_token,
      },
    });
  };

  // facebook after login response
  const responseFacebook = (response) => {
    // https://github.com/keppelen/react-facebook-login/blob/cbcabc595d3c6b0339dc91bc86af4681972c7763/src/facebook.js#L139

    if (response.email) {
      // save fb login id to session storage
      // fb_login_id最好是存储到 server端，用于meta数据分析，目前先暂时这么实现
      if (typeof window !== 'undefined' && response.userID) {
        setFbUserInSession(response.email, response.userID);
      }
      const fbLoginPromise = client.post(`/users/auth/facebook/callback?fb_sign_request=${response.signedRequest}`);
      fbLoginPromise
        .then((result) => {
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
              isNeedAlert: config.enableAlert,

              onConfirm: () => {
                onLogIn(result);
              },
              onCancel: () => {
                // setProcessing(false);
              },
            });
          }
        })
        .catch((error) => {
          console.error(JSON.stringify({ message: 'Facebook component error', error }, null, 2));
          frame.openModal('response', {
            body: `Sorry, something went wrong, please try again later or Log In with Castlery account.`,
          });
        });
    } else {
      frame.openModal('response', {
        body: `Sorry, we can not access your email or no email is associated with this Facebook account. Please check your FB account or Log In with Castlery account.`,
      });
    }
  };

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <FacebookLogin
        appId={config.fbAppId}
        autoLoad={false}
        fields="name,email"
        callback={responseFacebook}
        cssClass={`${style.facebook} btn`}
        version="6.0"
        textButton={textButton}
        isMobile={false}
        icon={<ReactSVG name="facebook" />}
      />
    </div>
  );
};

Facebook.propTypes = {
  textButton: PropTypes.string,
  onSuccess: PropTypes.func,
  onCartLoaded: PropTypes.func,
  isLogin: PropTypes.bool,
};
Facebook.contextTypes = {
  frame: PropTypes.object,
};

export default Facebook;
