'use client';

import { basePageConfig, EcEnv } from '@castlery/config';
import { Container, Stack, useBreakpoints } from '@castlery/fortress';
import { MainContent } from '@castlery/shared-components';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  const queryParams = useSearchParams();
  const { desktop, tablet, mobile } = useBreakpoints();
  const region = params.region as string;

  const onSuccess = useCallback(() => {
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
  }, [queryParams, router, region]);

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
        displayLogin={false}
        onSuccess={onSuccess}
        onSignIn={() => {
          router.push(`/${region}/login`);
        }}
      />
    </Container>
  );
}
