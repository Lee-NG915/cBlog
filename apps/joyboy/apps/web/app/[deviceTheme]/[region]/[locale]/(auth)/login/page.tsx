'use client';
import { basePageConfig, EcEnv } from '@castlery/config';
import { Container, Stack, useBreakpoints } from '@castlery/fortress';
import { changeWebOrderStatusCommand } from '@castlery/modules-order-services';
import { logger } from '@castlery/observability/client';
import { MainContent } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback } from 'react';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const queryParams = useSearchParams();
  const { desktop, tablet, mobile } = useBreakpoints();
  const region = params.region as string;

  const onSuccess = useCallback(async () => {
    try {
      await dispatch(changeWebOrderStatusCommand()).unwrap();
    } catch (error) {
      logger.warn('Post-login order reconciliation failed before redirect', { error });
    }

    if (
      EcEnv.NEXT_PUBLIC_YOTPO_ENABLED &&
      (queryParams.get('from') === 'rewards' || queryParams.get('from') === 'the-castlery-club')
    ) {
      router.push(`/${region}${basePageConfig['rewards']}`);
    } else if (queryParams.get('redirectUrl')) {
      const url = queryParams.get('redirectUrl') as string;
      const decodedUrl = decodeURIComponent(url);
      try {
        new URL(decodedUrl);
        window.location.href = decodedUrl;
      } catch {
        router.push(`/${region}${decodedUrl}`);
      }
    } else {
      router.push(`/${region}`);
    }
  }, [dispatch, queryParams, router, region]);

  return (
    <Container
      disableGutters
      sx={{
        pt: desktop ? 21 : tablet ? 6 : 5,
        pb: desktop ? 19 : tablet ? 12 : 5,
        px: mobile ? 6 : tablet ? 10 : 0,
        ...(desktop && {
          width: '960px',
        }),
      }}
    >
      <MainContent
        displayLogin={true}
        onSignUp={() => {
          router.push(`/${region}/signup`);
        }}
        onSuccess={onSuccess}
        onForgotPassword={() => {
          router.push(`/${region}/forgot-password`);
        }}
      />
    </Container>
  );
}
