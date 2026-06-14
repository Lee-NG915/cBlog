'use client';

import { basePageConfig, enableO2O } from '@castlery/config';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Input,
  passwordChecker,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { login, resetPassword, useValidateResetPasswordTokenQuery } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { encryptPassword } from '@castlery/utils';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { signIn } from '@castlery/modules-user-services';

interface ResetPasswordFormData {
  password: string;
  passwordConfirm: string;
}

interface WebResetPasswordProps {
  fromEmail?: string;
  redirectPageName?: string;
  secret?: string;
}

export const WebResetPassword = (props: WebResetPasswordProps) => {
  const { fromEmail, redirectPageName, secret } = props;
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [tokenError, setTokenError] = useState(false);
  const [err, setErr] = useState('');
  const { desktop, tablet, mobile } = useBreakpoints();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<ResetPasswordFormData>({
    mode: 'onBlur',
  });
  const isFromPosEmail = useMemo(() => enableO2O && fromEmail === 'true', [fromEmail]);

  const handleToNextPage = useCallback(() => {
    const redirectPage = basePageConfig[redirectPageName as keyof typeof basePageConfig];
    // let redirectURL = `/${params?.region}/forgot-password`;
    // if (status === 'success') {
    //   redirectURL = `/${params?.region}${basePageConfig.login}`;
    // }
    let redirectURL = `/${params?.region}${basePageConfig.home}`;
    if (redirectPage) {
      redirectURL = `/${params?.region}${redirectPage}`;
    }
    return router.push(redirectURL);
  }, [redirectPageName, router, params]);

  const trackResetPassword = useCallback(
    (status: string) => {
      if (isFromPosEmail) {
        //   dispatch({
        //     type: EVENT_RESET_PASSWORD,
        //     result: {
        //       status,
        //     },
        //   });
      }
    },
    [isFromPosEmail]
  );

  const {
    data: validateResetPasswordTokenData,
    isLoading: isValidateResetPasswordTokenLoading,
    error: validateTokenError,
    isError: isValidateTokenError,
  } = useValidateResetPasswordTokenQuery(
    { secret: secret || '' },
    {
      skip: false,
    }
  );

  const onLogin = useCallback(
    async (data: any) => {
      await dispatch(
        signIn({
          userToken: data,
          signType: 'Signin',
        })
      ).unwrap();
    },
    [dispatch, signIn]
  );

  const onSubmit = useCallback(
    async (data: { password: string }) => {
      try {
        const res = await dispatch(
          resetPassword.initiate({
            password: encryptPassword(data.password),
            reset_password_token: secret!,
            version: 1,
          })
        ).unwrap();
        if (res) {
          try {
            const loginResult = await dispatch(
              login.initiate({ username: res?.email, password: encryptPassword(data.password), version: 1 })
            ).unwrap();
            if (loginResult) {
              onLogin(loginResult);
              trackResetPassword('success');
              handleToNextPage();
            }
          } catch (loginError: any) {
            trackResetPassword('fail');
            handleToNextPage();
          }
        }
      } catch (error: any) {
        const errMsg = error?.data?.errors?.[0]?.detail || 'Something went wrong, please try again later.';
        setErr(errMsg);
        trackResetPassword('fail');
        return;
      }
    },
    [secret, dispatch, onLogin, trackResetPassword, handleToNextPage]
  );

  useEffect(() => {
    if (isValidateTokenError) {
      setTokenError(true);
    } else if (validateResetPasswordTokenData) {
      setTokenError(false);
    }
  }, [isValidateTokenError, validateResetPasswordTokenData]);

  return (
    <Container
      disableGutters
      sx={{
        margin: '0 auto',
        pt: desktop ? 21 : tablet ? 6 : 5,
        pb: desktop ? 19 : tablet ? 12 : 5,
        ...(desktop && {
          width: '480px',
        }),
      }}
    >
      <Stack
        justifyContent="center"
        alignItems="stretch"
        sx={{
          px: mobile ? 6 : tablet ? 10 : 0,
        }}
      >
        {tokenError ? (
          <>
            <Typography
              level="h2"
              sx={{
                textAlign: 'center',
              }}
            >
              Password Link Expired
            </Typography>
            <Typography
              level="body1"
              sx={{
                textAlign: 'center',
                mt: 4,
              }}
            >
              The password link has expired. Please try again.
            </Typography>
            <Button
              variant="primary"
              sx={{
                mt: 6,
              }}
              onClick={handleToNextPage}
            >
              okay
            </Button>
          </>
        ) : (
          <>
            <Typography
              level="h2"
              sx={{
                textAlign: 'center',
                mb: mobile ? 6 : 8,
              }}
            >
              {isFromPosEmail ? 'Set' : 'Reset'} Your Password
            </Typography>
            {err && (
              <Typography level="body1" sx={{ color: 'danger.500' }}>
                {err}
              </Typography>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                <FormControl>
                  <Typography level="body2" sx={{ mb: 1 }}>
                    New Password*
                  </Typography>
                  <Input
                    aria-label="Password"
                    aria-invalid={!!errors['password']}
                    placeholder="Enter New Password"
                    type="password"
                    autoCorrect="off"
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'This field cannot be empty',
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
                <FormControl
                  sx={{
                    mt: mobile ? 4 : 2,
                  }}
                >
                  <Typography level="body2" sx={{ mb: 1 }}>
                    Confirm Password*
                  </Typography>
                  <Input
                    aria-label="PasswordConfirm"
                    aria-invalid={!!errors['passwordConfirm']}
                    placeholder="Enter New Password"
                    type="password"
                    autoCorrect="off"
                    autoComplete="new-password"
                    {...register('passwordConfirm', {
                      required: 'This field cannot be empty',
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
                  data-selenium="reset_password"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  type="submit"
                  sx={{
                    mt: mobile ? 6 : 7,
                  }}
                >
                  Save & sign in
                </Button>
              </Stack>
            </form>
          </>
        )}
      </Stack>
    </Container>
  );
};
