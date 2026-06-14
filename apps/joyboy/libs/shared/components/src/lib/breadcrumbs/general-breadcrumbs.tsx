'use client';

import { Container, Typography, useBreakpoints } from '@castlery/fortress';
import CustomLink from '../custom-link/custom-link';
import { ChevronUp } from '@castlery/fortress/Icons';
interface GeneralBreadcrumbsProps {
  breadcrumbs?: {
    label: string;
    link: string;
  }[];
  noLeftPadding?: boolean;
}

const LinkText = ({ label }: { label: string }) => {
  return (
    <>
      <ChevronUp
        sx={(theme) => ({
          color: theme.palette.brand.mono[700],
          width: theme.spacing(6),
          height: theme.spacing(6),
          ml: theme.spacing(2),
          mr: theme.spacing(2),
          transform: 'rotate(90deg)',
        })}
      />
      <Typography
        sx={(theme) => ({
          color: theme.palette.brand.mono[700],
          fontSize: theme.typography.caption1.fontSize,
          textDecoration: 'none',
        })}
        level="caption1"
      >
        {label}
      </Typography>
    </>
  );
};

const GeneralBreadcrumbs = ({ breadcrumbs, noLeftPadding }: GeneralBreadcrumbsProps) => {
  const { desktop } = useBreakpoints();
  return (
    <Container
      sx={(theme) => ({
        width: '100%',
        paddingTop: {
          xs: theme.spacing(1),
          md: `${theme.spacing(4)} !important`,
        },
        paddingBottom: {
          xs: theme.spacing(1),
          md: `${theme.spacing(4)} !important`,
        },
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        '& a': {
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        ...(noLeftPadding && desktop && { paddingLeft: '0 !important' }),

        // ...(desktop && { padding: '0 !important' }),
      })}
    >
      <CustomLink linkKey="home">
        <Typography
          sx={(theme) => ({
            color: theme.palette.brand.mono[700],
            fontSize: theme.typography.caption1.fontSize,
            textDecoration: 'none',
          })}
          level="caption1"
        >
          Home
        </Typography>
      </CustomLink>
      {breadcrumbs &&
        breadcrumbs.map((breadcrumb, index) => {
          if (index === breadcrumbs.length - 1) {
            return <LinkText key={index} label={breadcrumb.label} />;
          }
          return (
            <CustomLink key={index} linkKey={breadcrumb.link}>
              <LinkText label={breadcrumb.label} />
            </CustomLink>
          );
        })}
    </Container>
  );
};

export { GeneralBreadcrumbs };
