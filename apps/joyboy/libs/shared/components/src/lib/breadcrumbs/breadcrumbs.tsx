'use client';
import { Stack, Typography, useBreakpoints, typographyClasses } from '@castlery/fortress';
import { selectProduct } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { CustomLink } from '../custom-link/custom-link';
import { useParams } from 'next/navigation';

export const Breadcrumbs = ({
  ancestorCrumbs,
}: {
  ancestorCrumbs: {
    pageKey?: string;
    url?: string;
    title: string;
  }[];
}) => {
  const product = useAppSelector(selectProduct);
  const { desktop } = useBreakpoints();
  const { region } = useParams();

  return (
    <Stack
      direction={'row'}
      gap={1}
      sx={{
        px: 3,
        py: 1.5,
        [`& .${typographyClasses.root}`]: {
          color: (theme) => theme.palette.brand.charcoal[400],
          fontSize: 14,
        },

        a: {
          textDecoration: 'none',
          color: (theme) => theme.palette.text.secondary,
          fontSize: 14,
          '&:hover': {
            color: (theme) => theme.palette.brand.terracotta[500],
          },
        },
      }}
    >
      {desktop && (
        <Stack direction={'row'} gap={1}>
          <CustomLink href={`/${region}/`}>Home</CustomLink>
          <Typography>&gt;</Typography>
        </Stack>
      )}
      {ancestorCrumbs?.map((a, index) => {
        const { pageKey, url } = a;
        const linkProps = pageKey ? { linkKey: pageKey } : { href: url, isExternalFlag: true };
        return (
          <Stack direction={'row'} gap={1} key={index}>
            <CustomLink {...linkProps}>{a.title}</CustomLink>
            {!desktop && index === ancestorCrumbs.length - 1 ? null : <Typography>&gt;</Typography>}
          </Stack>
        );
      })}
      {desktop && <Typography>{product?.name}</Typography>}
    </Stack>
  );
};

export default Breadcrumbs;
