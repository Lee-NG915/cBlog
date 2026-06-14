import React, { useState } from 'react';
import { Container, Typography, Box, Stack, useBreakpoints, WebLOGO, Link } from '../index';
import { useTheme, Theme } from '@mui/joy';
import { MenuMore } from '../Icons';
import { EcEnv } from '@castlery/config';

export interface ErrorBoundaryProps {
  /**
   * error type
   * description: If it is a page type, the DY is not displayed
   * @default 'page'
   */
  type?: 'page' | 'component';
  /**
   * customContent
   * custom your error content
   */
  customContent?: React.ReactNode;
  /**
   * DY Data Campaign Name
   * @default dyDataCampaign ='LP 404'
   */
  dyDataCampaign?: string;
  /**
   * Retry event
   * Using the default content allows you to configure the refresh method
   * @default refresh the Page
   */
  retryEvent?: () => void;

  noHeader?: boolean;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  type = 'page',
  customContent,
  dyDataCampaign,
  retryEvent,
  noHeader = true,
}) => {
  if (customContent && retryEvent) {
    console.warn('ErrorBoundary: customContent and retryEvent cannot be used together');
  }
  const DYWidget = dyDataCampaign || 'LP 404';
  const theme = useTheme();
  const isPage = type === 'page';
  const isMobile = theme.breakpoints.down('md');
  function refreshPage() {
    window.location.reload();
  }
  const { desktop } = useBreakpoints();
  const ErrorPageDesktopHeader = () => {
    return (
      <Box
        sx={{
          width: '100%',
          background: 'var(--fortress-palette-brand-warmLinen-500)',
          padding: '14px 24px',
        }}
      >
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <WebLOGO />
            <Stack direction="row" alignItems="center">
              <Link
                href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`}
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <Stack
                  sx={{
                    width: '115px',
                    height: '62px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    level="body1"
                    sx={{ textAlign: 'center', color: 'var(--fortress-palette-brand-maroonVelvet-500)' }}
                  >
                    Homepage
                  </Typography>
                </Stack>
              </Link>
              <Link href="our-story" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                <Stack
                  sx={{
                    width: '115px',
                    height: '62px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    level="body1"
                    sx={{ textAlign: 'center', color: 'var(--fortress-palette-brand-maroonVelvet-500)' }}
                  >
                    About Us
                  </Typography>
                </Stack>
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    );
  };
  const ErrorPageMobileHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
      <>
        <Stack
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <Stack
            sx={{
              width: '100%',
              height: '51px',
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
              position: 'relative',
              justifyContent: 'center',
              padding: '0 24px',
            }}
          >
            <MenuMore onClick={() => setMenuOpen(!menuOpen)} />
            <Stack
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <WebLOGO usedInMobile={true} />
            </Stack>
          </Stack>
        </Stack>
        <Stack
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            display: menuOpen ? 'block' : 'none',
          }}
          onClick={() => setMenuOpen(false)}
        >
          <Stack
            sx={{
              position: 'absolute',
              left: 0,
              top: '51px',
              right: 0,
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
            }}
          >
            <Link
              href="our-story"
              sx={{
                textDecoration: 'none',
                height: '44px',
                borderBottom: '1px solid var(--fortress-palette-brand-mono-300)',
                padding: '0 24px',
              }}
            >
              <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-maroonVelvet-500)' }}>
                {' '}
                Our Story
              </Typography>
            </Link>
            <Link
              href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`}
              sx={{ textDecoration: 'none', height: '44px', padding: '0 24px' }}
            >
              <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-maroonVelvet-500)' }}>
                {' '}
                Main Website
              </Typography>
            </Link>
          </Stack>
        </Stack>
      </>
    );
  };
  return (
    <Box
      sx={{
        Width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: isPage ? 'calc(100vh - 48px + 6px)' : 'auto',
      }}
    >
      {desktop && !noHeader && <ErrorPageDesktopHeader />}
      {!desktop && !noHeader && <ErrorPageMobileHeader />}
      <Box
        sx={{
          Width: '100%',
          minHeight: isPage ? 'none' : '434px',
          flex: 1,
          background: '#f7f7f7',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 24px',
          }}
        >
          <Typography
            level="h1"
            sx={{ marginBottom: isMobile ? '8px' : '16px' }}
            alignContent="center"
            textAlign="center"
          >
            An unexpected error has occurred.
          </Typography>
          <Typography level="body1" alignContent="center" textAlign="center">
            Please
            <span
              onClick={retryEvent || refreshPage}
              style={{
                color: '#d25c1b',
                textDecoration: 'underline',
                margin: '0 5px',
                cursor: 'pointer',
              }}
            >
              refresh
            </span>
            the page and try again.
          </Typography>
        </Box>
      </Box>
      {(!isPage || dyDataCampaign) && (
        <Container fixed sx={{ marginBottom: '20px' }}>
          <div data-campaign={DYWidget} />
        </Container>
      )}
    </Box>
  );
};

export default ErrorBoundary;
