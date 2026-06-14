'use client';
import { EcEnv, enableAlert } from '@castlery/config';
import { selectTermsOfUse } from '@castlery/modules-cms-domain';
import { facebookLogin, useUpdateUserTermsVersionMutation } from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { facebookHandler } from '@castlery/utils';
import { useCallback, useMemo } from 'react';
import FacebookLogin from 'react-facebook-login';
import { useTermsVersion } from '../../hooks/use-terms-version';
import { setFbUserInSession } from '@castlery/modules-tracking-domain';
import {
  captureStructuredError,
  addBreadcrumb,
  isUserInputError,
  BUSINESS_DOMAIN,
  BusinessSeverity,
  logger,
} from '@castlery/observability/client';
import { useUIContext } from '@castlery/shared-components';
import { Box, useBreakpoints } from '@castlery/fortress';
import { Facebook } from '@castlery/fortress/Icons';

interface FacebookSignInProps {
  onSuccess?: (result: any, channel?: string) => void;
  onError?: (error: any) => void;
  textButton?: string;
  loginType?: 'signin' | 'signup';
}

export const FacebookSignIn = ({
  onSuccess,
  onError,
  textButton = 'Log in with Facebook',
  loginType,
}: FacebookSignInProps) => {
  const [updateUserTermsVersion, { isLoading: isUpdating }] = useUpdateUserTermsVersionMutation();
  const lastTermsData = useAppSelector(selectTermsOfUse);
  const dispatch = useAppDispatch();
  const { desktop, tablet } = useBreakpoints();
  const { modal } = useUIContext();
  const lastTermsVersion = useMemo(() => lastTermsData?.version || '0.0.0', [lastTermsData]);
  const { checkTermsVersion, isLoading: isTermsLoading } = useTermsVersion();

  const onLogin = useCallback(
    (result: any) => {
      if (onSuccess) {
        onSuccess(result, 'Facebook');
      }
      // dispatch({
      //   type: result.is_new_user ? EVENT_SIGN_UP : EVENT_SIGN_IN,
      //   result: {
      //     user: window.__user,
      //     method: 'Facebook',
      //     tokens: result?.access_token,
      //   },
      // });
    },
    [onSuccess]
  );

  const responseFacebook = useCallback(
    async (response: any) => {
      if (response.email && response.signedRequest) {
        if (typeof window !== 'undefined' && response.userID) {
          dispatch(setFbUserInSession({ email: response.email, fbLoginID: response.userID }));
        }

        try {
          // const result = await facebookHandler(response.signedRequest);
          const result = await dispatch(facebookLogin.initiate({ signedRequest: response.signedRequest })).unwrap();
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
          const errorMessage = error?.data?.error || error?.data?.error_description || 'Facebook login failed';

          logger.error('Facebook login failed', { error });

          addBreadcrumb({
            message: 'Facebook login failed',
            level: BusinessSeverity.HIGH,
            data: { method: 'facebook', status: error?.status, errorMessage },
          });

          captureStructuredError(error, {
            domain: BUSINESS_DOMAIN.USER,
            extra: { step: 'facebook_login', apiStatus: error?.status, errorMessage },
            skipSentry: isUserInputError(error),
          });

          modal.warning({
            title: 'Oops!',
            desc: 'Sorry, something went wrong, please try again later or Log In with Castlery account.',
            showCancelBtn: false,
            confirmText: 'Got it',
          });
          if (onError) {
            onError(error);
          }
        }
      } else {
        const error = new Error('No email or signed request from Facebook');

        addBreadcrumb({
          message: 'Facebook login failed',
          level: BusinessSeverity.HIGH,
          data: { method: 'facebook', errorMessage: error.message },
        });

        captureStructuredError(error, {
          domain: BUSINESS_DOMAIN.USER,
          extra: { step: 'facebook_login' },
          skipSentry: true,
        });

        modal.warning({
          title: 'Oops!',
          desc: 'Sorry, we can not access your email or no email is associated with this Facebook account. Please check your FB account or Log In with Castlery account.',
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

  return (
    <Box
      sx={(theme) => ({
        '& .facebook-btn': {
          width: desktop ? '398px' : tablet ? '380px' : '342px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing(2),
          // py: mobile ? 2 : 3,
          py: 2,
          px: 6,
          borderRadius: theme.spacing(2),
          backgroundColor: '#1877F2',
          color: 'var(--fortress-palette-brand-warmLinen-500)',
          border: 'none',
          ...theme.typography.body2,
        },
      })}
    >
      <FacebookLogin
        appId={EcEnv.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || ''}
        autoLoad={false}
        cssClass={`facebook-btn`}
        fields="name,email"
        callback={responseFacebook}
        textButton={textButton}
        version="6.0"
        isMobile={false}
        icon={<Facebook />}
      />
    </Box>
  );
};
