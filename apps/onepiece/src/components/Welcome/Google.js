import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, updateUserTermsVersion } from 'redux/modules/auth';
import { FrameContext } from 'containers/Frame/FrameContext';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import { EVENT_SIGN_IN, EVENT_SIGN_UP } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { enableAlert } from 'config';
import style from './style.scss';
import { useLastTermsVersion, useAlertTermsModal } from './hooks/terms';

function Google({ onCartLoaded, onSuccess, text, isLogin = false }) {
  const { desktop } = useBreakpoints();
  const frame = useContext(FrameContext);
  const dispatch = useDispatch();
  const client = new ApiClient();
  const [loaded, setLoaded] = useState(__CLIENT__ && !!window.google);
  const width = desktop ? '246px' : '330px';
  const checkTerms = useAlertTermsModal();
  const lastTermsVersion = useLastTermsVersion();

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
        method: 'GOOGLE',
        tokens: result?.access_token,
      },
    });
  };

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        const result = await client.post('/social_logins/google', {
          data: {
            id_token: response.credential,
          },
        });

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
              // setProcessing(false);
            },
          });
        }
      } catch (err) {
        frame.openModal('response', {
          body: `Sorry, something went wrong, please try again later or Log In with Castlery account.`,
        });
      }
    },
    [checkTerms, dispatch, frame, isLogin, lastTermsVersion]
  );

  useEffect(() => {
    if (loaded) {
      window.google.accounts.id.initialize({
        client_id: __GOOGLE_CLIENT_ID__,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(document.getElementById('googleSignInBtn'), {
        size: 'large',
        logo_alignment: 'center',
        width,
        text,
      });
      window.google.accounts.id.prompt(); // display the One Tap dialog
    }
  }, [handleCredentialResponse, loaded, text, width]);

  useEffect(() => {
    // FIXME can use Script Component
    if (!window.google) {
      const googleScript = document.createElement('script');
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.addEventListener('load', () => setLoaded(true));
      document.body.appendChild(googleScript);
    }
  }, []);

  return (
    <div className={style.GoogleSignInBtn}>
      <div id="googleSignInBtn" />
    </div>
  );
}

Google.propTypes = {
  onCartLoaded: PropTypes.func,
  onSuccess: PropTypes.func,
  text: PropTypes.string,
  isLogin: PropTypes.bool,
};
export default Google;
