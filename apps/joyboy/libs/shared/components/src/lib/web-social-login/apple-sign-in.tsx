// joyboy/libs/modules/user/components/src/lib/social-login/AppleLogin.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { EcEnv, enableAlert } from '@castlery/config';
import { appleHandler } from '@castlery/utils';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectTermsOfUse } from '@castlery/modules-cms-domain';
import { appleLogin, useUpdateUserTermsVersionMutation } from '@castlery/modules-user-domain';
import { useTermsVersion } from '../../hooks/use-terms-version';
import { useUIContext } from '@castlery/shared-components';
import {
  captureStructuredError,
  addBreadcrumb,
  isUserInputError,
  BUSINESS_DOMAIN,
  BusinessSeverity,
  logger,
} from '@castlery/observability/client';
import { Apple } from '@castlery/fortress/Icons';

interface AppleSignInProps {
  onSuccess?: (result: any, channel?: string) => void;
  onError?: (error: any) => void;
  text?: string;
  loginType?: 'signin' | 'signup';
}

export const AppleSignIn = ({
  onSuccess,
  onError,
  text = 'Sign in with Apple',
  loginType = 'signin',
}: AppleSignInProps) => {
  const [loaded, setLoaded] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [updateUserTermsVersion, { isLoading: isUpdating }] = useUpdateUserTermsVersionMutation();
  const lastTermsData = useAppSelector(selectTermsOfUse);
  const dispatch = useAppDispatch();
  const { desktop, tablet } = useBreakpoints();
  const lastTermsVersion = useMemo(() => lastTermsData?.version || '0.0.0', [lastTermsData]);
  const { checkTermsVersion, isLoading: isTermsLoading } = useTermsVersion();
  const { modal } = useUIContext();

  const onLogin = useCallback(
    (result: any) => {
      if (onSuccess) {
        onSuccess(result, 'Apple');
      }
      // dispatch({
      //   type: result.is_new_user ? EVENT_SIGN_UP : EVENT_SIGN_IN,
      //   result: {
      //     user: window.__user,
      //     method: 'Apple',
      //     tokens: result?.access_token,
      //   },
      // });
      setBtnDisabled(false);
    },
    [onSuccess]
  );

  useEffect(() => {
    if (!window.AppleID) {
      const appleScript = document.createElement('script');
      appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      appleScript.addEventListener('load', () => setLoaded(true));
      document.body.appendChild(appleScript);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      window.AppleID.auth.init({
        clientId: EcEnv.NEXT_PUBLIC_APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`,
        state: 'Initial user authentication request',
        usePopup: true,
      });
    }
  }, [loaded]);

  const signInWithApple = useCallback(async () => {
    try {
      setBtnDisabled(true);
      const data = await window.AppleID.auth.signIn();

      // const result = await appleHandler({
      //   auth_code: data.authorization.code,
      //   id_token: data.authorization.id_token,
      //   redirect_uri: `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`,
      //   firstname: data.user?.name?.firstName,
      //   lastname: data.user?.name?.lastName,
      // });
      const result = await dispatch(
        appleLogin.initiate({
          auth_code: data.authorization.code,
          id_token: data.authorization.id_token,
          redirect_uri: `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`,
          firstname: data.user?.name?.firstName,
          lastname: data.user?.name?.lastName,
        })
      ).unwrap();
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
          onCancel: () => {
            setBtnDisabled(false);
          },
        });
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.error_description || 'Apple login failed';

      logger.error('Apple login failed', { error });

      addBreadcrumb({
        message: 'Apple login failed',
        level: BusinessSeverity.HIGH,
        data: { method: 'apple', status: error?.status, errorMessage },
      });

      captureStructuredError(error, {
        domain: BUSINESS_DOMAIN.USER,
        extra: { step: 'apple_login', apiStatus: error?.status, errorMessage },
        skipSentry:
          isUserInputError(error) ||
          error?.error === 'popup_closed_by_user' ||
          error?.error === 'popup_blocked_by_browser' ||
          error?.data?.error === 'invalid_grant',
      });

      if (onError) {
        onError(error);
      }
      let desc = 'Sorry, something went wrong, please try again later or Log In with Castlery account.';
      if (error?.error === 'popup_closed_by_user') {
        desc = 'You have cancelled the login process.';
      }
      modal.warning({
        title: 'Oops!',
        desc,
        showCancelBtn: false,
        confirmText: 'Got it',
      });
      setBtnDisabled(false);
    }
  }, [loginType, updateUserTermsVersion, lastTermsVersion, onLogin, checkTermsVersion, onError]);

  return loaded ? (
    <Stack
      component="button"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={2}
      disabled={btnDisabled}
      onClick={signInWithApple}
      sx={(theme) => ({
        width: desktop ? '398px' : tablet ? '380px' : '342px',
        // py: mobile ? 2 : 3,
        py: 2,
        px: 6,
        color: 'var(--fortress-palette-brand-warmLinen-500)',
        cursor: 'pointer',
        border: 'none',
        borderRadius: theme.spacing(2),
        backgroundColor: 'var(--fortress-palette-common-black)',
        ...theme.typography.body2,
      })}
    >
      <Apple />
      {text}
    </Stack>
  ) : null;
};
