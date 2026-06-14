'use client';
import { basePageConfig } from '@castlery/config';
import { Container, useBreakpoints } from '@castlery/fortress';
import { MainContent } from '@castlery/shared-components';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback } from 'react';

export default function CheckoutAccountPage() {
  const router = useRouter();
  const params = useParams();
  const { desktop, tablet, mobile } = useBreakpoints();
  const region = params.region as string;

  const onSuccess = useCallback(() => {
    const cartPageUrl = `/${region}/${basePageConfig['cart']}`;
    router.push(`${cartPageUrl}`);
  }, [router, region]);

  return (
    <Container
      disableGutters
      sx={{
        pt: desktop ? 21 : tablet ? 6 : 5,
        pb: desktop ? 19 : tablet ? 12 : 5,
        px: mobile ? 6 : tablet ? 10 : 0,
        ...(desktop && {
          width: '960px',
          margin: '0 auto',
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
