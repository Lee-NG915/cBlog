'use client';
import { Container, Breadcrumbs, Typography } from '@castlery/fortress';
import { YotpoScript } from '@castlery/modules-promotion-components';
import { EcEnv } from '@castlery/config';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { NextFortressLink } from '@castlery/shared-components';
import { useEffect } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { enterApp } from '@castlery/modules-user-domain';

export default function ReferralLayoutClient({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectedActiveUser);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(enterApp({ page: 'Referral' }));
  }, [dispatch]);

  return (
    <>
      {EcEnv.NEXT_PUBLIC_YOTPO_ENABLED && <YotpoScript user={user} />}

      <Container sx={{ minHeight: '80vh' }}>
        <Breadcrumbs>
          <NextFortressLink
            level="caption1"
            variant="plain"
            sx={{
              marginInline: 0,
              textDecoration: 'none',
              color: 'var(--fortress-palette-brand-mono-700)',
              '&:hover': {
                color: 'var(--fortress-palette-brand-terracotta-500)',
                textDecoration: 'underline',
              },
            }}
          >
            Home
          </NextFortressLink>
          <Typography level="caption1">Refer a friend</Typography>
        </Breadcrumbs>
        {children}
      </Container>
    </>
  );
}
