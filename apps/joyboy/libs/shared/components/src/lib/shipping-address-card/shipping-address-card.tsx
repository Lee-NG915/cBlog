'use client';

import { memo, useMemo } from 'react';
import { Stack, Typography, Skeleton, useBreakpoints } from '@castlery/fortress';
import { CustomerAddressEntity_V2 } from '@castlery/types';
import { AddressDisplayCardContent } from '../address-display-card-content/address-display-card-content';

const CARD_MAX_WIDTH = 472;
const SKELETON_HEIGHT = 24;

export interface ShippingAddressCardProps {
  title: string;
  address?: CustomerAddressEntity_V2 | null;
  isLoading?: boolean;
}

function ShippingAddressCardComponent({ title, address, isLoading = false }: ShippingAddressCardProps) {
  const showSkeleton = isLoading || !address;
  const { mobile, desktop } = useBreakpoints();

  const cardContainerSx = useMemo(
    () => ({
      width: mobile ? '100%' : CARD_MAX_WIDTH,
      maxWidth: mobile ? '100%' : CARD_MAX_WIDTH,
      p: mobile ? 4 : 6,
      border: (theme: { palette: { brand: { mono: string[] } } }) => `0.5px solid ${theme.palette.brand.mono[300]}`,
    }),
    [mobile]
  );

  const skeletonWidth = useMemo(() => (mobile ? 300 : 400), [mobile]);

  return (
    <Stack component="section" aria-label={title} sx={{ minHeight: 120, gap: mobile ? 4 : 2 }}>
      <Typography level={desktop ? 'subh1' : 'subh2'}>{title}</Typography>
      <Stack sx={cardContainerSx}>
        {showSkeleton ? (
          <>
            <Skeleton variant="rectangular" height={SKELETON_HEIGHT} width={skeletonWidth} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={SKELETON_HEIGHT} width={skeletonWidth} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={SKELETON_HEIGHT} width={skeletonWidth} />
          </>
        ) : (
          address && <AddressDisplayCardContent address={address} />
        )}
      </Stack>
    </Stack>
  );
}

export const ShippingAddressCard = memo(ShippingAddressCardComponent);
