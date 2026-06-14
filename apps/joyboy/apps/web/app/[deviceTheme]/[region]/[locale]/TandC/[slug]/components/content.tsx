'use client';

import { Container, useBreakpoints } from '@castlery/fortress';
import { GeneralBreadcrumbs } from '@castlery/shared-components';

const formatPathname = (pathname: string) => {
  const lastSegment = pathname.split('/').filter(Boolean).pop();
  if (!lastSegment) return '';
  return lastSegment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Content = ({ content, path }: { content: string; path: string }) => {
  const { desktop } = useBreakpoints();
  const termsEle = (
    <Container
      fixed
      sx={(theme) => ({
        overflowX: desktop ? 'hidden' : 'scroll',
        fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
        paddingTop: {
          xs: theme.spacing(4),
          md: theme.spacing(8),
        },
        paddingBottom: {
          xs: theme.spacing(6),
          md: theme.spacing(10),
        },
        paddingLeft: {
          xs: theme.spacing(8),
          sm: theme.spacing(15),
        },
        paddingRight: {
          xs: theme.spacing(8),
          sm: theme.spacing(15),
        },
        '& h1': {
          fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
          textAlign: 'center',
          marginBottom: {
            xs: theme.spacing(4),
            md: theme.spacing(6),
          },
          fontSize: {
            xs: '34px',
            md: '24px',
          },
          lineHeight: 1.2,
          fontWeight: 400,
        },
        '& h2': {
          fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
          fontSize: '18px',
          marginBottom: theme.spacing(3),
          marginTop: {
            xs: theme.spacing(5),
            md: theme.spacing(8),
          },
          fontWeight: 400,
        },
        '& h4': {
          fontSize: {
            xs: '14px',
            md: '16px',
          },
          fontWeight: 700,
          fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
          marginBottom: theme.spacing(3),
          marginTop: theme.spacing(4),
        },
        '& ol': {
          marginBottom: '1rem',
          paddingLeft: '1.125rem',
          '& li': {
            fontSize: {
              xs: '12px',
              md: '14px',
            },
            lineHeight: 1.2,
            fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            marginBottom: theme.spacing(1),
          },
          '& li::marker': {
            fontSize: {
              xs: '10px',
              md: '12px',
            },
          },
        },
        '& ul': {
          listStyleType: 'disc',
          marginBottom: '1rem',
          paddingLeft: '1.125rem',
          '& li': {
            fontSize: {
              xs: '12px',
              md: '14px',
            },
            lineHeight: 1.2,
            fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            marginBottom: theme.spacing(1),
          },
          '& li::marker': {
            fontSize: {
              xs: '10px',
              md: '12px',
            },
          },
        },
        '& p': {
          marginTop: theme.spacing(4),
          marginBottom: theme.spacing(4),
          fontSize: {
            xs: '12px',
            md: '14px',
          },
        },
        '& a': {
          color: theme.palette.brand.burntOrange[500],
          textDecoration: 'underline',
          '&:hover': {
            color: theme.palette.brand.burntOrange[500],
          },
        },
        '& td ul': {
          paddingInlineStart: '1.5em',
        },
        '& table': {
          borderCollapse: 'collapse',
          marginTop: {
            xs: theme.spacing(3),
            md: theme.spacing(4),
          },
          marginBottom: {
            xs: theme.spacing(3),
            md: theme.spacing(4),
          },
          border: `1px solid ${theme.palette.brand.mono[300]}`,
          '& thead': {
            backgroundColor: theme.palette.brand.warmLinen[500],
          },
          '& tr th': {
            fontWeight: 400,
            fontSize: {
              xs: '16px',
              md: '18px',
            },
            lineHeight: 1.2,
            fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            textAlign: 'left',
            padding: {
              xs: `${theme.spacing(3)} ${theme.spacing(4)}`,
              md: `${theme.spacing(4)} ${theme.spacing(6)}`,
            },
            borderRight: `1px solid ${theme.palette.brand.mono[300]}`,
            '&:last-child': {
              borderRight: 'none',
            },
          },
          '& tr td': {
            fontSize: {
              xs: '16px',
              md: '18px',
            },
            lineHeight: 1.2,
            fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            textAlign: 'left',
            padding: {
              xs: `${theme.spacing(3)} ${theme.spacing(4)}`,
              md: `${theme.spacing(4)} ${theme.spacing(6)}`,
            },
            borderTop: `1px solid ${theme.palette.brand.mono[300]}`,
            borderRight: `1px solid ${theme.palette.brand.mono[300]}`,
            '&:last-child': {
              borderRight: 'none',
              borderBottom: 'none',
            },
          },
        },
      })}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );

  return (
    <>
      <GeneralBreadcrumbs
        breadcrumbs={[
          {
            label: formatPathname(path),
            link: path,
          },
        ]}
      />
      {termsEle}
    </>
  );
};

export { Content };
