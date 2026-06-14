'use client';

import { Container, Stack } from '@castlery/fortress';
import { WebFooter } from './components/web-footer';
import { WebHeader } from './components/web-header';

export function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      sx={{
        height: '100vh',
      }}
    >
      <WebHeader />
      <Container
        fixed
        sx={{
          flex: 1,
        }}
      >
        {children}
      </Container>
      <WebFooter />
    </Stack>
  );
}
