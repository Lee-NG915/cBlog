'use client';

import { basePageConfig, EMAIL_REGEX, enableO2O } from '@castlery/config';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Input,
  Stack,
  Typography,
  useBreakpoints,
  withBrandColor,
} from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import { useResetPasswordEmailMutation } from '@castlery/modules-user-domain';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { useForm } from 'react-hook-form';

export default function ForgotPasswordPage() {
  const { desktop, tablet, mobile } = useBreakpoints();
  const [resetPasswordEmail, { isLoading }] = useResetPasswordEmailMutation();
  const params = useParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setError,
  } = useForm<{ email: string }>({
    mode: 'onBlur',
  });
  const [sentEmail, setSentEmail] = useState('');
  const queryParams = useSearchParams();

  const fromEmail = useMemo(() => queryParams.get('from_email'), [queryParams]);
  const email = useMemo(() => queryParams.get('email'), [queryParams]);

  const onSubmit = useCallback(
    async (data: { email: string }) => {
      try {
        const isFromPosEmail = enableO2O && fromEmail === 'true' && email === data?.email;
        await resetPasswordEmail({ email: data.email, from_email: isFromPosEmail }).unwrap();
        setSentEmail(data.email);
      } catch (error: any) {
        let errMsg = '';
        if (error?.status === 429) {
          errMsg = 'Too many requests have been made. Please try again later.';
        } else {
          errMsg = error?.data?.errors?.[0]?.detail || 'Something went wrong, please try again later.';
        }
        setError('email', {
          type: 'api',
          message: errMsg,
        });
      }
    },
    [fromEmail, email, resetPasswordEmail, setError]
  );

  return (
    <Container
      disableGutters
      sx={{
        margin: '0 auto',
        pt: desktop ? 21 : tablet ? 6 : 5,
        pb: desktop ? 19 : tablet ? 12 : 5,
        ...(desktop && {
          width: '592px',
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
        <Typography
          level="h2"
          sx={{
            textAlign: 'center',
          }}
        >
          {sentEmail ? 'We’ve emailed you a reset link' : 'Reset Password'}
        </Typography>
        <Typography
          level="body1"
          sx={{
            textAlign: 'center',
            mt: mobile ? 6 : 4,
          }}
        >
          {sentEmail ? (
            <>
              A link to reset your password has been sent to <strong>{sentEmail}</strong>
            </>
          ) : (
            'Enter the email address associated with your account, and we will email you a link to reset your password.'
          )}
        </Typography>
        {!sentEmail && (
          <Stack
            mt={mobile ? 6 : 8}
            sx={{
              ...(desktop && {
                width: '408px',
                ml: 'auto',
                mr: 'auto',
              }),
            }}
          >
            <Typography level="body2">Email*</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl>
                <Input
                  id="forgot-password-email"
                  aria-label="Email"
                  aria-invalid={!!errors['email']}
                  autoCorrect="off"
                  autoComplete="email"
                  placeholder={'Enter Email Address'}
                  type="email"
                  {...register('email', {
                    required: 'This field cannot be empty',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Please provide a valid email address',
                    },
                  })}
                  error={!!errors.email}
                  sx={{
                    input: {
                      '&:-internal-autofill-selected': {
                        boxShadow: '0 0 0 30px var(--fortress-palette-brand-warmLinen-200) inset',
                      },
                    },
                  }}
                  //   sx={{ px: 4, py: 4 }}
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
                <Button
                  data-selenium="sign_up"
                  variant="primary"
                  size="sm"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  type="submit"
                  sx={{
                    mt: mobile ? 6 : 7,
                  }}
                >
                  Reset Password
                </Button>
              </FormControl>
            </form>
          </Stack>
        )}
        <Button
          sx={{
            mt: sentEmail ? 6 : 4,
            ...(desktop && {
              width: '408px',
              ml: 'auto',
              mr: 'auto',
            }),
            ...(!sentEmail && {
              ...withBrandColor('burntOrange', { variant: 'plain' }),
            }),
          }}
          variant={sentEmail ? 'primary' : 'plain'}
          onClick={() => {
            router.push(`/${params?.region}${basePageConfig.login}`);
          }}
        >
          Back to Login
        </Button>
      </Stack>
    </Container>
  );
}
