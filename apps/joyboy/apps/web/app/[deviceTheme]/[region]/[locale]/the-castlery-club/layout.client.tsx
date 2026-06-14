'use client';

import { useAppDispatch } from '@castlery/shared-redux-store';
import { enterApp } from '@castlery/modules-user-domain';
import { useEffect } from 'react';
import { Container, Breadcrumbs, Typography } from '@castlery/fortress';
import { NextFortressLink } from '@castlery/shared-components';

export default function TheCastleryClubLayoutClient({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(enterApp({ page: 'Account' }));
  }, [dispatch]);

  return (
    <>
      <Container>
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
          <Typography level="caption1">The Castlery Club</Typography>
        </Breadcrumbs>
        {children}
      </Container>
    </>
  );
}
