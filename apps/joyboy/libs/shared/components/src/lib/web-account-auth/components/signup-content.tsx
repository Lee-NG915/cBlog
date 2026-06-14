'use client';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  Link,
  passwordChecker,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import { FacebookSignIn } from '../../web-social-login/facebook-sign-in';
import { AppleSignIn } from '../../web-social-login/apple-sign-in';
import { GoogleSignIn } from '../../web-social-login/google-sign-in';
import {
  countrySubscribeInitialStatus,
  EMAIL_REGEX,
  enableAlert,
  enablePrivacyPolicy,
  enableSpecificPrivacyPolicy,
  enableTermsOfUse,
} from '@castlery/config';
import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectTermsOfUse } from '@castlery/modules-cms-domain';
import { useCreateUserFromWebChannelMutation, useUpdateUserTermsVersionMutation } from '@castlery/modules-user-domain';
import { useUIContext } from '@castlery/shared-components';
import { SignUpWrapper } from '../../web-social-login/components/sign-up-wrapper';
import { useForm } from 'react-hook-form';
import { EcEnv } from '@castlery/config';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { encryptPassword } from '@castlery/utils';
import { signIn } from '@castlery/modules-user-services';
import { mergeCartCommand } from '@castlery/modules-cart-services';
import {
  captureStructuredError,
  addBreadcrumb,
  isUserInputError,
  BUSINESS_DOMAIN,
  BusinessSeverity,
  logger,
} from '@castlery/observability/client';

const DEFAULT_FIRST_NAME = 'Castlery';
const DEFAULT_LAST_NAME = 'Customer';
interface SignupFormData {
  email: string;
  password: string;
  passwordConfirm: string;
}

interface SignupContentProps {
  onSignIn?: () => void;
  onSuccess?: () => void | Promise<void>;
}

export const SignupContent = (props: SignupContentProps) => {
  const { onSignIn, onSuccess } = props;
  const { desktop, mobile } = useBreakpoints();
  const [isAgreeTerms, setIsAgreeTerms] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(countrySubscribeInitialStatus);
  const [error, setError] = useState<string>('');
  const [isPostSignupRunning, setIsPostSignupRunning] = useState(false);
  const dispatch = useAppDispatch();
  const lastTermsData = useAppSelector(selectTermsOfUse);
  const lastTermsVersion = useMemo(() => lastTermsData?.version || '0.0.0', [lastTermsData]);
  const { modal } = useUIContext();
  const { t } = useTranslation(LocalesNamespace.SHARED);
  const [createUserFromWebChannel] = useCreateUserFromWebChannelMutation();
  const [updateUserTermsVersion] = useUpdateUserTermsVersionMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<SignupFormData>({
    mode: 'onBlur',
  });

  const agreeTerms = useMemo(() => {
    if (!enableAlert) {
      return true;
    }
    if (isAgreeTerms) {
      return true;
    }
    return false;
  }, [isAgreeTerms]);

  const onSignUp = useCallback(
    async (data: any, channel?: string) => {
      setIsPostSignupRunning(true);
      try {
        await dispatch(
          signIn({
            userToken: data,
            signType: 'Signup',
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
        //  if (data.user) {
        //    dispatch({
        //      type: EVENT_SIGN_UP,
        //      result: {
        //        action: 'User Registration',
        //        user: result.user,
        //        method: fromPDPBanner ? 'castlery PDP Banner sign up' : 'castlery sign up',
        //        tokens: result?.access_token,
        //      },
        //    });
        //  }
      } finally {
        setIsPostSignupRunning(false);
      }
    },
    [dispatch, onSuccess]
  );

  const handleAgreeTerms = useCallback(() => {
    if (!agreeTerms) {
      modal.warning({
        title: 'Terms of Use',
        desc: 'Please check the box below to agree to our Terms of Use.',
        showCancelBtn: false,
        confirmText: 'I Understand',
      });
      return false;
    }
    return true;
  }, [agreeTerms, modal]);

  const handleSocialSignUpSuccess = useCallback(
    (result: any, channel?: string) => {
      onSignUp(result, channel);
    },
    [onSignUp]
  );

  const handleSocialSignUpError = useCallback((error: any) => {
    // 面包屑和 Sentry 上报已在 google-sign-in / apple-sign-in 组件内完成
    logger.error('Social sign up error', { error });
  }, []);

  const handleSignIn = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSignIn) {
        onSignIn();
      }
    },
    [onSignIn]
  );

  const onSubmit = useCallback(
    async (data: SignupFormData) => {
      if (!handleAgreeTerms()) {
        return;
      }
      try {
        const params = {
          email: data.email,
          password: encryptPassword(data.password),
          subscribe: isSubscribe,
          version: 1,
          firstname: DEFAULT_FIRST_NAME,
          lastname: DEFAULT_LAST_NAME,
        };
        const result = await createUserFromWebChannel(params).unwrap();
        await updateUserTermsVersion({
          data: {
            terms_of_use_version: lastTermsVersion,
          },
          accessToken: result?.access_token?.access_token,
        }).unwrap();
        onSignUp(result?.access_token, 'castlery sign up');
      } catch (error: any) {
        setError(error?.data?.errors?.[0] ? error?.data?.errors?.[0]?.detail : error);

        const errorMessage = error?.data?.errors?.[0]?.detail || error?.data?.error || 'Registration failed';

        addBreadcrumb({
          message: 'Registration failed',
          level: BusinessSeverity.HIGH,
          data: { email: data.email, status: error?.status, errorMessage },
        });

        captureStructuredError(error, {
          domain: BUSINESS_DOMAIN.USER,
          extra: { step: 'signup', email: data.email, apiStatus: error?.status, errorMessage },
          skipSentry: isUserInputError(error),
        });
      }
    },
    [
      createUserFromWebChannel,
      handleAgreeTerms,
      isSubscribe,
      lastTermsVersion,
      onSignUp,
      updateUserTermsVersion,
      setError,
    ]
  );
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
            Quick Sign up
          </Typography>

          <Stack
            gap={2}
            alignItems={desktop ? 'flex-start' : 'center'}
            sx={{
              width: '100%',
            }}
          >
            <SignUpWrapper onClick={handleAgreeTerms} agreeTerms={agreeTerms}>
              <FacebookSignIn
                textButton="Sign up with Facebook"
                onSuccess={handleSocialSignUpSuccess}
                onError={handleSocialSignUpError}
                loginType="signup"
              />
            </SignUpWrapper>
            <SignUpWrapper onClick={handleAgreeTerms} agreeTerms={agreeTerms}>
              <AppleSignIn
                text="Sign up with Apple"
                onSuccess={handleSocialSignUpSuccess}
                onError={handleSocialSignUpError}
                loginType="signup"
              />
            </SignUpWrapper>
            <SignUpWrapper onClick={handleAgreeTerms} agreeTerms={agreeTerms}>
              <GoogleSignIn
                text="signup_with"
                onSuccess={handleSocialSignUpSuccess}
                onError={handleSocialSignUpError}
                loginType="signup"
              />
            </SignUpWrapper>
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
            sign up with Email
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
                  id="signup-email"
                  aria-label="Email"
                  aria-invalid={!!errors['email']}
                  type="email"
                  placeholder="Enter Email Address"
                  autoCorrect="off"
                  autoComplete="email"
                  {...register('email', {
                    required: 'This field is mandatory',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Please enter a valid email address',
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
                  id="signup-password"
                  aria-label="Password"
                  aria-invalid={!!errors['password']}
                  placeholder="Enter Password"
                  type="password"
                  autoCorrect="off"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'This field is mandatory',
                    validate: passwordChecker,
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
              <FormControl>
                <Typography level="body2" sx={{ mb: 1 }}>
                  Confirm Password
                </Typography>
                <Input
                  id="signup-password-confirm"
                  aria-label="PasswordConfirm"
                  aria-invalid={!!errors['passwordConfirm']}
                  placeholder="Enter Password"
                  type="password"
                  autoCorrect="off"
                  autoComplete="new-password"
                  {...register('passwordConfirm', {
                    required: 'This field is mandatory',
                    validate: (value) => value === watch('password') || 'Passwords do not match',
                  })}
                  error={!!errors.passwordConfirm}
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
                {errors.passwordConfirm && (
                  <Box sx={{ '& div': { position: 'relative', bottom: 0 } }} mt={1}>
                    <FormHelperText sx={{ color: 'danger.500', mt: 1, position: 'relative' }}>
                      <Error />
                      <Typography level="caption2" sx={{ ml: 1 }}>
                        {errors.passwordConfirm.message}
                      </Typography>
                    </FormHelperText>
                  </Box>
                )}
              </FormControl>
              <Button
                data-selenium="sign_up"
                variant="primary"
                loading={isSubmitting || isPostSignupRunning}
                disabled={isSubmitting || isPostSignupRunning}
                type="submit"
                sx={{
                  alignSelf: 'stretch',
                }}
              >
                sign up
              </Button>

              <Stack direction="row" gap={2} alignItems="center">
                <Typography level="body2">Already have an account?&nbsp;</Typography>
                <Link component="button" variant="primary" level="body2" onClick={handleSignIn}>
                  Log in
                </Link>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Stack>

      {/* Terms of Use Section */}
      {enableTermsOfUse && (
        <Stack justifyContent={'center'} flexWrap={'wrap'} ml={desktop ? 32 : undefined}>
          <Grid container wrap="nowrap" gap={3}>
            <Grid sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={isAgreeTerms}
                onChange={(e) => {
                  setIsAgreeTerms(e.target.checked);
                }}
              />
            </Grid>
            <Grid
              xs
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography level="body2">
                By checking this box, I have read, understood, and agree to Castlery's&nbsp;
                <Link
                  variant="primary"
                  href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/terms-of-use`}
                  target="_blank"
                  level="body2"
                  rel="noopener"
                >
                  Terms of Use.
                </Link>
              </Typography>
            </Grid>
          </Grid>

          <Grid
            sx={{
              mt: desktop ? 4 : 3,
              width: {
                xs: '100%',
                md: '85%',
              },
            }}
            container
            wrap="nowrap"
          >
            <Grid>
              <Checkbox
                checked={isSubscribe}
                label={
                  <Typography level="body2">
                    Yes, I would like to receive marketing emails and special offers from Castlery.
                  </Typography>
                }
                onChange={(e) => {
                  setIsSubscribe(e.target.checked);
                }}
                sx={{
                  alignItems: 'center',
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      )}

      {/* Privacy Policy Section */}
      {enablePrivacyPolicy && (
        <Stack justifyContent={'center'} flexWrap={'wrap'} ml={desktop ? 32 : undefined}>
          <Grid container wrap="nowrap" gap={3}>
            {enableSpecificPrivacyPolicy && (
              <Grid sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={isAgreeTerms}
                  onChange={(e) => {
                    setIsAgreeTerms(e.target.checked);
                  }}
                />
              </Grid>
            )}
            {enableSpecificPrivacyPolicy ? (
              <Grid xs>
                <Typography level="body2">
                  By signing up, I have read, understood and agree to Castlery's&nbsp;
                  <Link
                    variant="primary"
                    href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/terms-of-use`}
                    target="_blank"
                    rel="noopener"
                    level="body2"
                  >
                    Terms of Use
                  </Link>
                  &nbsp;and&nbsp;
                  <Link
                    variant="primary"
                    href={`
                    /${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/privacy-policy`}
                    target="_blank"
                    rel="noopener"
                    level="body2"
                  >
                    Privacy Policy.
                  </Link>
                </Typography>
              </Grid>
            ) : (
              <Grid xs>
                <Typography level="body2">
                  By signing up, you have read, understood, and agree to Castlery's&nbsp;
                  <Link
                    variant="primary"
                    href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/terms-of-use`}
                    target="_blank"
                    rel="noopener"
                    level="body2"
                  >
                    Terms of Use
                  </Link>
                  &nbsp;and&nbsp;
                  <Link
                    variant="primary"
                    href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/privacy-policy`}
                    target="_blank"
                    rel="noopener"
                    level="body2"
                  >
                    Privacy Policy
                  </Link>
                  . You will be opted in to our newsletters, and can unsubscribe anytime.
                </Typography>
              </Grid>
            )}
          </Grid>

          <Grid
            sx={{
              mt: desktop ? 4 : 3,
              width: {
                xs: '100%',
                md: '85%',
              },
            }}
            container
            wrap="nowrap"
          >
            <Grid>
              <Checkbox
                checked={isSubscribe}
                label={<Typography level="body2">{t('pages.signup.subscribe')}</Typography>}
                onChange={(e) => {
                  setIsSubscribe(e.target.checked);
                }}
                sx={{
                  alignItems: 'center',
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      )}
    </>
  );
};
