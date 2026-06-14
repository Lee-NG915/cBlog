'use client';

import { EcEnv } from '@castlery/config';
import { Container, Stack, Typography } from '@castlery/fortress';
import { GeneralBreadcrumbs } from '@castlery/shared-components';
import { useEffect, useRef, useState } from 'react';
import { logger } from '@castlery/observability/client';

const Content = () => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.gladlyHCConfig = {
      api: EcEnv.NEXT_PUBLIC_GLADLY_HC_API,
      orgId: EcEnv.NEXT_PUBLIC_GLADLY_HC_ORGID,
      brandId: EcEnv.NEXT_PUBLIC_GLADLY_HC_BRANDID,
      cdn: EcEnv.NEXT_PUBLIC_GLADLY_CDN,
      selector: '#gladly-help-center',
    };

    if (scriptRef.current) {
      return;
    }

    if (!containerRef.current) {
      console.warn('Gladly Help Center container not found');
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = false;
    script.src = 'https://cdn.gladly.com/help-center/hcl.js';

    script.onerror = () => {
      logger.error('Failed to load Gladly Help Center script', { cdn: EcEnv.NEXT_PUBLIC_GLADLY_CDN });
      return;
    };

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      window.gladlyHCLoaded = false;
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <GeneralBreadcrumbs breadcrumbs={[{ label: 'Help Center', link: '/help-center' }]} />
      <Container sx={(theme) => ({ paddingBottom: theme.spacing(15), minHeight: '80vh' })}>
        <Typography level="h1" sx={{ textAlign: 'center' }}>
          Help Center
        </Typography>
        <Stack
          id="gladly-help-center"
          ref={containerRef}
          sx={(theme) => ({
            '.gladlyHC-searchContainer': {
              paddingTop: theme.spacing(3),
              // overflowX: 'auto',
              paddingBottom: {
                xs: theme.spacing(3),
                md: theme.spacing(4),
              },
              paddingLeft: {
                xs: theme.spacing(11),
                md: theme.spacing(12),
              },
              mb: {
                xs: theme.spacing(5.5),
                md: theme.spacing(6),
              },
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: theme.spacing(4),
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${theme.palette.brand.maroonVelvet[300].replace(
                  '#',
                  ''
                )}'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10.333 3.303c-3.915 0-7.077 3.136-7.077 6.992 0 3.857 3.162 6.992 7.077 6.992 3.912 0 7.076-3.135 7.076-6.992 0-3.856-3.163-6.992-7.076-6.992zm-8.077 6.992c0-4.42 3.62-7.992 8.077-7.992 4.454 0 8.076 3.573 8.076 7.992a7.913 7.913 0 0 1-2.072 5.344l5.407 5.347-.703.71-5.421-5.36a8.096 8.096 0 0 1-5.287 1.951c-4.456 0-8.077-3.572-8.077-7.992z'/%3E%3C/svg%3E")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                zIndex: 1,
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                right: theme.spacing(4),
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${theme.palette.brand.maroonVelvet[300].replace(
                  '#',
                  ''
                )}'%3E%3Cpath d='M11.232 12.002l-7.084 7.132a.509.509 0 0 0 .356.866.502.502 0 0 0 .356-.148l7.138-7.186 7.137 7.186a.5.5 0 0 0 .822-.165.51.51 0 0 0-.11-.553l-7.084-7.132 7.09-7.136A.509.509 0 0 0 19.495 4a.502.502 0 0 0-.356.148l-7.142 7.19-7.143-7.19a.502.502 0 0 0-.85.362.51.51 0 0 0 .138.356l7.09 7.136z'/%3E%3C/svg%3E")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                zIndex: 1,
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
                cursor: 'pointer',
              },
              '&:focus-within::after': {
                opacity: 1,
              },
              input: {
                width: 'calc(100% - 40px)',
                height: {
                  xs: theme.spacing(5.5),
                  md: theme.spacing(6),
                },
                fontSize: {
                  xs: '16px',
                  md: '18px',
                },
                fontWeight: 400,
                lineHeight: 1,
                color: theme.palette.brand.maroonVelvet[500],
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                '&::placeholder': {
                  color: theme.palette.brand.maroonVelvet[200],
                  fontSize: {
                    xs: '16px',
                    md: '18px',
                  },
                  fontWeight: 400,
                  lineHeight: 1,
                },
                border: 'none',
                background: 'transparent',
                '&:focus': {
                  border: 'none',
                  outline: 'none',
                },
              },
              borderBottom: `1px solid ${theme.palette.brand.mono[300]}`,
              '.gladlyHC-searchMenuContainer': {
                top: 'calc(100% + 10px)',
                left: 0,
                '.gladlyHC-searchMenu': {
                  backgroundColor: theme.palette.brand.warmLinen[200],
                  '.gladlyHC-searchResult': {
                    padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
                    textDecoration: 'none',
                    fontSize: {
                      xs: '14px',
                      md: '16px',
                    },
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: theme.palette.brand.maroonVelvet[500],
                    fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                    mark: {
                      fontSize: '18px',
                    },
                    '&:hover': {
                      color: theme.palette.brand.burntOrange[600],
                      mark: {
                        color: `${theme.palette.brand.burntOrange[600]} !important`,
                      },
                    },
                  },
                },
              },
            },
            '.gladlyHC-faqContainer': {
              h3: {
                mt: 0,
                mb: {
                  xs: theme.spacing(2),
                  md: theme.spacing(4),
                },
                fontSize: theme.typography.subh2.fontSize,
                fontWeight: theme.typography.subh2.fontWeight,
                lineHeight: theme.typography.subh2.lineHeight,
                color: theme.palette.brand.terracotta[500],
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              },
              '.gladlyHC-faqHeading': {
                mt: 0,
                fontSize: {
                  xs: '18px',
                  md: '22px',
                },
                fontWeight: 400,
                lineHeight: 1.2,
                color: theme.palette.brand.maroonVelvet[500],
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                mb: '24px',
              },
            },
            '.gladlyHC-faqSection': {
              flexBasis: {
                xs: '100% !important',
                md: '33% !important',
              },
              maxWidth: {
                xs: '100% !important',
                md: '33% !important',
              },
            },
            '.gladlyHC-faqSection-header': {
              fontSize: '14px',
              textTransform: 'uppercase',
              fontFamily: `var(--font-sanoma-sans,"SanomatSans"),var(--fortress-fontFamily-fallback) !important`,
              letterSpacing: '0.1em',
            },
            '.gladlyHC-faqSection-list': {
              li: {
                padding: {
                  xs: `${theme.spacing(2)} 0`,
                  md: `${theme.spacing(3.5)} 0`,
                },
                a: {
                  fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                  color: theme.palette.brand.maroonVelvet[500],
                  textDecoration: 'none',
                  fontSize: {
                    xs: '14px',
                    md: '18px',
                  },
                  fontWeight: 400,
                  lineHeight: 1.2,
                  '&:hover': {
                    textDecoration: 'none',
                    color: theme.palette.brand.burntOrange[600],
                  },
                },
              },
              '.gladlyHC-faqSection-listItem-more': {
                a: {
                  fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                  color: theme.palette.brand.burntOrange[500],
                  fontSize: {
                    xs: '14px',
                    md: '16px',
                  },
                  textDecoration: 'underline',
                  textDecorationColor: theme.palette.brand.burntOrange[500],
                  textDecorationThickness: '1px',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: theme.palette.brand.burntOrange[600],
                    textDecorationColor: theme.palette.brand.burntOrange[600],
                  },
                  fontWeight: theme.typography.body1.fontWeight,
                  lineHeight: 1.2,
                },
              },
            },
            '.gladlyHC-answersIndex-link': {
              a: {
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                color: theme.palette.brand.burntOrange[500],
                fontSize: {
                  xs: '14px',
                  md: '16px',
                },
                textDecoration: 'underline',
                textDecorationColor: theme.palette.brand.burntOrange[500],
                textDecorationThickness: '1px',
                '&:hover': {
                  textDecoration: 'underline',
                  color: theme.palette.brand.burntOrange[600],
                  textDecorationColor: theme.palette.brand.burntOrange[600],
                },
                fontWeight: theme.typography.body1.fontWeight,
                lineHeight: 1.2,
              },
            },
            '.gladlyHC-answerDetail': {
              '.gladlyHC-answerDetail-backLink': {
                position: 'relative',
                paddingLeft: theme.spacing(6),
                color: theme.palette.brand.burntOrange[500],
                fontSize: {
                  xs: '16px',
                  md: '20px',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M15.0667 19L8 12L15.0667 5L16 5.92453L9.86667 12L16 18.0755L15.0667 19Z' fill='%23${theme.palette.brand.burntOrange[500].replace(
                    '#',
                    ''
                  )}'/%3E%3C/svg%3E")`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  zIndex: 1,
                  pointerEvents: 'none',
                },
              },
              '.gladlyHC-answerDetail-name': {
                margin: {
                  xs: `${theme.spacing(4)} 0`,
                  md: `${theme.spacing(6)} 0`,
                },
                fontSize: {
                  xs: '18px',
                  md: '22px',
                },
                fontWeight: 400,
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              },
              '.gladlyHC-answerDetail-content': {
                div: {
                  fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                  fontSize: {
                    xs: '14px',
                    md: '16px',
                  },
                  fontWeight: 400,
                  color: theme.palette.brand.maroonVelvet[500],
                },
              },
            },
            '.gladlyHC-answersIndex-container': {
              '.gladlyHC-answerDetail-backLink': {
                position: 'relative',
                paddingLeft: theme.spacing(6),
                color: theme.palette.brand.burntOrange[500],
                fontSize: {
                  xs: '16px',
                  md: '20px',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M15.0667 19L8 12L15.0667 5L16 5.92453L9.86667 12L16 18.0755L15.0667 19Z' fill='%23${theme.palette.brand.burntOrange[500].replace(
                    '#',
                    ''
                  )}'/%3E%3C/svg%3E")`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  zIndex: 1,
                  pointerEvents: 'none',
                },
              },
              '.gladlyHC-answersIndex-section': {
                '.gladlyHC-answersIndex-list': {
                  listStyle: 'none',
                  paddingLeft: 0,
                  marginLeft: 0,
                  '.gladlyHC-answersIndex-item': {
                    marginBottom: {
                      xs: theme.spacing(3),
                      md: theme.spacing(4),
                    },
                    a: {
                      fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                      color: theme.palette.brand.maroonVelvet[500],
                      textDecoration: 'none',
                      fontSize: {
                        xs: '14px',
                        md: '18px',
                      },
                      fontWeight: 400,
                      lineHeight: 1.2,
                      '&:hover': {
                        textDecoration: 'none',
                        color: theme.palette.brand.burntOrange[600],
                      },
                    },
                  },
                },
              },
            },
          })}
        />
      </Container>
    </>
  );
};

export { Content };
