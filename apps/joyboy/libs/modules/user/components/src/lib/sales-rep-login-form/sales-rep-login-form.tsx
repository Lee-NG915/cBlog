'use client';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Typography, Button, Stack, Box, Card, HookForm } from '@castlery/fortress';
import { useGetRetailsQuery } from '@castlery/modules-retails-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useAsyncFn } from 'react-use';
import { salesRepLogin } from '@castlery/modules-user-services';
import { ErrorTips } from '@castlery/fortress/Icons';
import { EcEnv } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { logger } from '@castlery/observability/client';

export function SalesRepLoginForm({
  defaultValues = {
    email: '',
  },
  showBackBtn = true,
  onSuccess = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sales rep login success');
    }
  },
  onError = (error) => {
    logger.error('Sales rep login error', { error });
  },
}: {
  defaultValues?: {
    retailId?: number;
    email?: string;
  };
  showBackBtn?: boolean;
  onSuccess?: ({ retailId, email, callbackUrl }: { retailId: number; email: string; callbackUrl?: string }) => void;
  onError?: (error: any) => void;
}) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const callbackUrl = React.useRef(searchParams?.get('callbackUrl'));
  const router = useRouter();
  const [errMsg, setErrMsg] = React.useState('');

  const handleClickBack = () => {
    router.replace('/');
  };

  const beforeLogin = () => {
    makePersistenceHandles().xPosCartToken.removeItem();
  };

  const [{ loading, error }, login] = useAsyncFn(async (params) => {
    beforeLogin();
    await dispatch(salesRepLogin(params)).unwrap();
    await onSuccess({
      retailId: params.retailId,
      email: params.username,
      callbackUrl: callbackUrl.current || undefined,
    });
  }, []);

  React.useEffect(() => {
    if (error) {
      if (error?.status === 403) {
        setErrMsg('You are not allowed to perform that action.');
      } else {
        setErrMsg('Your combination of email and password is incorrect.');
      }
      console.log('🚀 ~ React.useEffect ~ error:', error);
      onError(error);
    }
  }, [error, onError]);

  const {
    currentData: retails,
    // TODO 处理loading
    // isLoading
  } = useGetRetailsQuery();

  const getRetailFormatList = () => {
    return retails?.map((retail) => ({
      label: retail.name,
      value: retail.id,
    }));
  };

  return (
    <Box
      sx={{
        padding: 1,
        maxWidth: '100%',
        margin: 2,
      }}
    >
      <Card
        sx={{
          padding: 0,
        }}
      >
        <Stack
          // gap={4}
          width={{ xs: '280px', sm: '492px', md: '492px' }}
          sx={(theme) => ({
            mt: 2,
            bgcolor: theme.palette.background.surface,
            py: '16px',
            px: '8px',
            // m: '8px',
          })}
        >
          <Typography
            textAlign={'center'}
            level="h1"
            sx={{
              fontSize: '28px',
              marginBottom: 4,
            }}
          >
            Log in
          </Typography>
          <Typography
            sx={{
              marginBottom: 1,
              color: '#767676',
            }}
          >
            Branch:
          </Typography>
          <HookForm
            form={[
              {
                key: 'retailId',
                type: 'select',
                subType: 'single',
                placeholder: 'Select Retail Store',
                options: getRetailFormatList() || [],
                joyProps: {
                  variant: 'borderplain',
                  color: '#000',
                },
              },
              {
                key: 'username',
                type: 'input',
                subType: 'email',
                placeholder: 'Email',
                // label: 'Mobile(SG)',
                joyProps: {
                  variant: 'borderplain',
                  color: '#000',
                },
              },
              {
                key: 'password',
                type: 'input',
                subType: 'password',
                placeholder: 'Password',
                // label: 'Mobile(SG)',
                joyProps: {
                  variant: 'borderplain',
                  color: '#000',
                },
              },
            ]}
            formSxProps={{
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              input: {
                boxShadow: 'none',
              },
            }}
            submit={(value) => {
              login(value);
            }}
            validators={{
              retailId: {
                required: true,
              },
              username: {
                required: true,
                validator: 'email',
              },
              password: {
                required: true,
                // validator: 'password',
              },
            }}
            defaultFetcher={{
              retailId: EcEnv.NEXT_PUBLIC_COUNTRY === 'US' ? 2 : defaultValues?.retailId,
              username: defaultValues?.email || '',
            }}
          >
            {/* TODO 样式处理 */}
            {error && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <ErrorTips
                  sx={{
                    marginTop: '28px',
                    width: '20px',
                    height: '20px',
                    marginRight: '4px',
                  }}
                />
                <Typography
                  level="caption1"
                  color="danger"
                  sx={{
                    marginTop: '26px',
                  }}
                >
                  {errMsg}
                </Typography>
              </Box>
            )}
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 4,
              }}
            >
              {showBackBtn && (
                <Button fullWidth variant="tertiary" onClick={handleClickBack}>
                  Back
                </Button>
              )}

              <Button type="submit" fullWidth loading={loading} disabled={loading}>
                Submit
              </Button>
            </Stack>
          </HookForm>
        </Stack>
      </Card>
    </Box>
  );
}
