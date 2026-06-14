'use client';
import type { ReactNode } from 'react';
import { Container } from '@castlery/fortress';

interface WebCartLayoutProps {
  children: ReactNode;
}

const cartLayoutSx = {
  flex: 1,
  width: '100%',
  display: { xs: 'flex', md: 'grid' },
  flexDirection: { xs: 'column', md: undefined },
  justifyContent: { xs: 'flex-start', md: undefined },
  gridTemplateColumns: { xs: '1fr', md: '1fr 1px 39vw', lg: '1fr 1px 33.68vw' },
  columnGap: { xs: 0, md: 6, lg: 8 },
  backgroundColor: (theme: any) => theme.palette.brand.warmLinen[200],
  '&&': {
    py: { xs: 6, sm: 8 },
    px: { xs: 4, sm: 6, lg: 8 },
  },
} as const;

export const WebCartLayout = ({ children }: WebCartLayoutProps) => {
  return (
    <Container component="main" disableGutters sx={cartLayoutSx}>
      {children}
    </Container>
  );
};
