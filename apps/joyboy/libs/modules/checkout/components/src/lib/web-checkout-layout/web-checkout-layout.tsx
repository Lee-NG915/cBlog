'use client';
import type { ReactNode } from 'react';
import { Box, Container } from '@castlery/fortress';
import { WebCheckoutHeader } from '../web-checkout-header/web-checkout-header';
import { WebCheckoutFooter } from '../web-checkout-footer/web-checkout-footer';

interface WebCheckoutLayoutProps {
  children: ReactNode;
  useSingleChildLayout?: boolean;
}

const layoutSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  minHeight: '100dvh',
} as const;

const contentBaseSx = {
  flex: 1,
  width: '100%',
  display: { xs: 'flex', md: 'grid' },
  flexDirection: { xs: 'column', md: undefined },
  justifyContent: { xs: 'flex-start', md: undefined },
  columnGap: { md: 4, lg: 10 },
  // && doubles class specificity to ensure py/px override Container defaults
  '&&': {
    py: { xs: 6, md: 8, lg: 10 },
    px: { md: 4, lg: 10 },
  },
};

const contentSx = {
  single: { ...contentBaseSx, gridTemplateColumns: { md: '1fr' } },
  multi: { ...contentBaseSx, gridTemplateColumns: { md: '1fr 1px 39vw', lg: '1fr 1px 33.68vw' } },
};

export const WebCheckoutLayout = ({ children, useSingleChildLayout = false }: WebCheckoutLayoutProps) => {
  return (
    <Box sx={layoutSx}>
      <WebCheckoutHeader />
      <Container component="main" disableGutters sx={useSingleChildLayout ? contentSx.single : contentSx.multi}>
        {children}
      </Container>
      <WebCheckoutFooter />
    </Box>
  );
};

export default WebCheckoutLayout;
