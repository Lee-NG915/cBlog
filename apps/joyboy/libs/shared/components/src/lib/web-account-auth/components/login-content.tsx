'use client';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Input,
  Link,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Error } from '@castlery/fortress/Icons';
import { EcEnv, EMAIL_REGEX, enableAlert, enablePrivacyPolicy, enableSpecificPrivacyPolicy } from '@castlery/config';
import { NextFortressLink } from '@castlery/shared-components';
import { FacebookSignIn } from '../../web-social-login/facebook-sign-in';
import { AppleSignIn } from '../../web-social-login/apple-sign-in';
import { GoogleSignIn } from '../../web-social-login/google-sign-in';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { encryptPassword } from '@castlery/utils';
import { useTermsVersion } from '../../../hooks/use-terms-version';
import { ResetPasswordModal } from './reset-password-modal';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { login } from '@castlery/modules-user-domain';
import {
  captureStructuredError,
  addBreadcrumb,
  isUserInputError,
  BUSINESS_DOMAIN,
  BusinessSeverity,
  logger,
} from '@castlery/observability/client';
import { signIn } from '@castlery/modules-user-services';
import { mergeCartCommand } from '@castlery/modules-cart-services';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginContentProps {
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  onSuccess?: () => void | Promise<void>;
}

export const LoginContent = ({ onForgotPassword, onSignUp, onSuccess }: LoginContentProps) => {
  const { desktop, mobile } = useBreakpoints();
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);
  // Terms version hook
  const { checkTermsVersion, isLoading: isTermsLoading } = useTermsVersion();
  const [error, setError] = useState<string>('');
  const [isPostLoginRunning, setIsPostLoginRunning] = useState(false);
  const dispatch = useAppDispatch();
  // const router = useRouter();
  const onLogin = useCallback(
    async (data: any, channel?: string) => {
      setIsPostLoginRunning(true);
      try {
        await dispatch(
          signIn({
            userToken: data,
            signType: 'Signin',
            channel,
          })
        ).unwrap();
        try {
          await dispatch(mergeCartCommand()).unwrap();
        } catch (error) {
          logger.error('Failed to merge cart after login', { error });
        }
        if (onSuccess) {
          await onSuccess();
        }
      } finally {
        setIsPostLoginRunning(false);
      }
    },
    [dispatch, onSuccess]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    // setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // const result = await loginHandler(data.email as string, data.password as string);
      const result = await dispatch(
        login.initiate({
          username: data.email as string,
          password: encryptPassword(data.password as string),
          version: 1,
        })
      ).unwrap();
      makePersistenceHandles().hasSubscribed.setItem(JSON.stringify(true));
      await checkTermsVersion({
        accessToken: result?.access_token,
        isNeedAlert: enableAlert,
        onConfirm: () => {
          if (onLogin) {
            onLogin(result, 'castlery sign in');
          }
        },
        onCancel: () => {
          setError('Please accept the Terms of Use to continue');
        },
      });
    } catch (error: any) {
      const errorMessage =
        error?.data?.errors?.[0]?.detail || error?.data?.error || error?.data?.error_description || 'Login failed';

      if (error?.status === 429) {
        setError('Too many requests have been made. Please try again later.');
      } else {
        setError('Your email and password do not match.');
      }

      addBreadcrumb({
        message: 'Login failed',
        level: BusinessSeverity.HIGH,
        data: { username: data.email, status: error?.status, errorMessage },
      });

      captureStructuredError(error, {
        domain: BUSINESS_DOMAIN.USER,
        extra: { step: 'login', username: data.email, apiStatus: error?.status, errorMessage },
        skipSentry: isUserInputError(error),
      });
    }
  };

  const handleForgotPassword = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onForgotPassword) {
        onForgotPassword();
      } else {
        setOpenForgotPasswordModal(true);
      }
    },
    [onForgotPassword]
  );

  const handleSignUp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSignUp) {
        onSignUp();
      }
    },
    [onSignUp]
  );

  const handleSocialLoginSuccess = useCallback(
    async (result: any, channel?: string) => {
      await onLogin(result, channel);
    },
    [onLogin]
  );

  const handleSocialLoginError = useCallback((error: any) => {
    logger.error('Social login error', { error });
  }, []);

  return (
    <>
      <Stack
        justifyContent="center"
        alignItems="stretch"
        gap={desktop ? 6 : 4}
        direction={desktop ? 'row' : 'column-reverse'}
        mt={desktop ? 8 : 6}
        mb={desktop ? 8 : 7}
      >
        <Stack
          gap={3}
          sx={{
            ...(!desktop && { width: '100%' }),
            ...(desktop && {
              flex: 1,
            }),
          }}
          alignItems="flex-start"
        >
          <Typography
            level="subh2"
            sx={{
              textTransform: 'uppercase',
            }}
          >
            Quick Log in
          </Typography>

          <Stack
            gap={2}
            alignItems={desktop ? 'flex-start' : 'center'}
            sx={{
              width: '100%',
            }}
          >
            <FacebookSignIn
              textButton="Log in with Facebook"
              onSuccess={handleSocialLoginSuccess}
              onError={handleSocialLoginError}
              loginType="signin"
            />

            <AppleSignIn
              text="Log in with Apple"
              onSuccess={handleSocialLoginSuccess}
              onError={handleSocialLoginError}
              loginType="signin"
            />

            <GoogleSignIn
              text="signin_with"
              onSuccess={handleSocialLoginSuccess}
              onError={handleSocialLoginError}
              loginType="signin"
            />
          </Stack>
        </Stack>

        {desktop && <Divider sx={{ mx: 6 }} orientation="vertical" />}

        <Stack
          gap={3}
          sx={{
            ...(!desktop && { width: '100%' }),
            ...(desktop && {
              flex: 1,
            }),
            form: {
              width: '100%',
            },
          }}
          alignItems="flex-start"
        >
          <Typography
            level="subh2"
            sx={{
              textTransform: 'uppercase',
              mb: mobile ? 4 : 6,
              width: '100%',
            }}
          >
            log in with Email
          </Typography>
          {error && (
            <Box sx={{ color: 'danger.500', mt: 1 }}>
              <Typography level="caption2">{error}</Typography>
            </Box>
          )}
          <form onSubmit={handleSubmit(onSubmit)} method="POST">
            <Stack spacing={3}>
              <FormControl>
                <Typography level="body2" sx={{ mb: 1 }}>
                  Email
                </Typography>
                <Input
                  aria-label="Email"
                  aria-invalid={!!errors['email']}
                  type="email"
                  id="login-email"
                  placeholder="Enter Email Address"
                  autoCorrect="off"
                  autoComplete="email"
                  {...register('email', {
                    required: 'This field is mandatory',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Please enter a valid email address',
                    },
                    maxLength: {
                      value: 256,
                      message: 'Email must be at most 256 characters',
                    },
                  })}
                  error={!!errors.email}
                  sx={{
                    px: 3,
                    py: 2,
                    input: {
                      '&:-internal-autofill-selected': {
                        boxShadow: '0 0 0 30px var(--fortress-palette-brand-warmLinen-200) inset',
                      },
                    },
                  }}
                />
                {errors.email && (
                  <Box sx={{ '& div': { position: 'relative', bottom: 0 } }} mt={1}>
                    <FormHelperText sx={{ color: 'danger.500', mt: 1, position: 'relative' }}>
                      <Error />
                      <Typography level="caption2" sx={{ ml: 1 }}>
                        {errors.email.message}
                      </Typography>
                    </FormHelperText>
                  </Box>
                )}
              </FormControl>

              <FormControl>
                <Typography level="body2" sx={{ mb: 1 }}>
                  Password
                </Typography>
                <Input
                  aria-label="Password"
                  aria-invalid={!!errors['password']}
                  id="login-password"
                  placeholder="Enter Password"
                  type="password"
                  autoCorrect="off"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'This field is mandatory',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                    maxLength: {
                      value: 256,
                      message: 'Password must be at most 256 characters',
                    },
                  })}
                  error={!!errors.password}
                  sx={{
                    px: 3,
                    py: 2,
                    input: {
                      '&:-internal-autofill-selected': {
                        boxShadow: '0 0 0 30px var(--fortress-palette-brand-warmLinen-200) inset',
                      },
                    },
                  }}
                />
                {errors.password && (
                  <Box sx={{ '& div': { position: 'relative', bottom: 0 } }} mt={1}>
                    <FormHelperText sx={{ color: 'danger.500', mt: 1, position: 'relative' }}>
                      <Error />
                      <Typography level="caption2" sx={{ ml: 1 }}>
                        {errors.password.message}
                      </Typography>
                    </FormHelperText>
                  </Box>
                )}
              </FormControl>

              <Box sx={{ textAlign: 'right' }}>
                <Link variant="primary" component="button" level="body1" onClick={handleForgotPassword} type="button">
                  Forgot password
                </Link>
              </Box>

              <Button
                data-selenium="log_in"
                variant="primary"
                loading={isSubmitting || isTermsLoading || isPostLoginRunning}
                disabled={isSubmitting || isTermsLoading || isPostLoginRunning}
                type="submit"
                sx={{
                  alignSelf: 'stretch',
                }}
              >
                LOG IN
              </Button>

              <Stack direction="row" gap={2} alignItems="center">
                <Typography level="body2">New to Castlery?&nbsp;</Typography>
                <Link component="button" variant="primary" level="body2" onClick={handleSignUp}>
                  Sign up
                </Link>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Stack>

      {enablePrivacyPolicy && !enableSpecificPrivacyPolicy && (
        <Typography level="caption1">
          By logging in, you have read, understood, and agree to Castlery's&nbsp;
          <NextFortressLink
            variant="primary"
            href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/terms-of-use`}
            // isExternalFlag={true}
            target="_blank"
            rel="noopener"
          >
            Terms of Use
          </NextFortressLink>
          &nbsp;and&nbsp;
          <NextFortressLink
            variant="primary"
            href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/privacy-policy`}
            // isExternalFlag={true}
            target="_blank"
            rel="noopener"
          >
            Privacy Policy
          </NextFortressLink>
          . You will be opted to our newsletters, and can unsubscribe anytime.
        </Typography>
      )}
      <ResetPasswordModal open={openForgotPasswordModal} onClose={() => setOpenForgotPasswordModal(false)} />
    </>
  );
};
