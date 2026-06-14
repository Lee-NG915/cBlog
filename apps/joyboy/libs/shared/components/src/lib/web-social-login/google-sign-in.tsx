'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, useBreakpoints } from '@castlery/fortress';
import { EcEnv, enableAlert } from '@castlery/config';
import { googleLogin, useUpdateUserTermsVersionMutation } from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useTermsVersion } from '../../hooks/use-terms-version';
import { selectTermsOfUse } from '@castlery/modules-cms-domain';
import { useUIContext } from '@castlery/shared-components';
import {
  captureStructuredError,
  addBreadcrumb,
  isUserInputError,
  BUSINESS_DOMAIN,
  BusinessSeverity,
  logger,
} from '@castlery/observability/client';

interface GoogleSignInProps {
  onSuccess?: (result: any, channel?: string) => void;
  onError?: (error: any) => void;
  text?: string;
  loginType?: 'signin' | 'signup';
}

export const GoogleSignIn = ({ onSuccess, onError, text = 'signin_with', loginType = 'signin' }: GoogleSignInProps) => {
  const [loaded, setLoaded] = useState(false);
  const [updateUserTermsVersion, { isLoading: isUpdating }] = useUpdateUserTermsVersionMutation();
  const lastTermsData = useAppSelector(selectTermsOfUse);
  const dispatch = useAppDispatch();
  const lastTermsVersion = useMemo(() => lastTermsData?.version || '0.0.0', [lastTermsData]);
  const { checkTermsVersion, isLoading: isTermsLoading } = useTermsVersion();
  const { modal } = useUIContext();
  const { desktop, tablet } = useBreakpoints();
  const onLogin = useCallback(
    (result: any) => {
      if (onSuccess) {
        onSuccess(result, 'GOOGLE');
      }
      // dispatch({
      //   type: result.is_new_user ? EVENT_SIGN_UP : EVENT_SIGN_IN,
      //   result: {
      //     user: window.__user,
      //     method: 'GOOGLE',
      //     tokens: result?.access_token,
      //   },
      // });
    },
    [onSuccess]
  );

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      try {
        // const result = await googleHandler(response.credential);
        const result = await dispatch(googleLogin.initiate({ id_token: response.credential })).unwrap();
        if (loginType === 'signin') {
          await updateUserTermsVersion({
            data: {
              terms_of_use_version: lastTermsVersion,
            },
            accessToken: result?.access_token,
          }).unwrap();
          onLogin(result);
        } else {
          await checkTermsVersion({
            accessToken: result?.access_token,
            isNeedAlert: enableAlert,
            onConfirm: () => {
              onLogin(result);
            },
          });
        }
      } catch (error: any) {
        const errorMessage = error?.data?.error || error?.data?.error_description || 'Google login failed';

        logger.error('Google login failed', { error });

        addBreadcrumb({
          message: 'Google login failed',
          level: BusinessSeverity.HIGH,
          data: { method: 'google', status: error?.status, errorMessage },
        });

        captureStructuredError(error, {
          domain: BUSINESS_DOMAIN.USER,
          extra: { step: 'google_login', apiStatus: error?.status, errorMessage },
          skipSentry: isUserInputError(error),
        });

        modal.warning({
          title: 'Oops!',
          desc: `Sorry, something went wrong, please try again later or Log In with Castlery account.`,
          showCancelBtn: false,
          confirmText: 'Got it',
        });
        if (onError) {
          onError(error);
        }
      }
    },
    [loginType, updateUserTermsVersion, lastTermsVersion, onLogin, checkTermsVersion, onError]
  );

  useEffect(() => {
    if (loaded) {
      window.google.accounts.id.initialize({
        client_id: EcEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(document.getElementById('googleSignInBtn'), {
        size: 'large',
        logo_alignment: 'center',
        width: desktop ? '398px' : tablet ? '380px' : '342px',
        text,
      });
      window.google.accounts.id.prompt();
    }
  }, [handleCredentialResponse, loaded, text, desktop, tablet]);

  useEffect(() => {
    if (!window.google) {
      const googleScript = document.createElement('script');
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.addEventListener('load', () => setLoaded(true));
      document.body.appendChild(googleScript);
    } else {
      setLoaded(true);
    }
  }, []);

  return (
    <Box
      sx={{
        width: desktop ? '398px' : tablet ? '380px' : '342px',
      }}
    >
      <Box id="googleSignInBtn" />
    </Box>
  );
};
