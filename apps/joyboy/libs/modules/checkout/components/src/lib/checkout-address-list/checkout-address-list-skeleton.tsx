'use client';
import { Card, Stack, Skeleton } from '@castlery/fortress';
import { accessInPos } from '@castlery/config';

const DEFAULT_COUNT = 2;

const gridSx = {
  display: 'grid',
  gridTemplateColumns: accessInPos
    ? '1fr'
    : {
        xs: '1fr',
        sm: 'repeat(2,1fr)',
      },
  rowGap: 6,
  columnGap: 6,
} as const;

function AddressCardSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 0,
        m: 0,
        gap: 0,
        width: '100%',
        minWidth: 250,
        minHeight: 172,
      }}
    >
      <Stack
        sx={{
          p: 6,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack gap={1}>
          <Skeleton variant="text" level="body2" sx={{ width: '50%' }} />
          <Skeleton variant="text" level="body2" sx={{ width: '80%' }} />
          <Skeleton variant="text" level="body2" sx={{ width: '70%' }} />
          <Skeleton variant="text" level="body2" sx={{ width: '40%' }} />
        </Stack>
        <Skeleton variant="text" level="caption1" sx={{ width: '20%' }} />
      </Stack>
    </Card>
  );
}

export interface CheckoutAddressListSkeletonProps {
  count?: number;
}

export function CheckoutAddressListSkeleton({ count = DEFAULT_COUNT }: CheckoutAddressListSkeletonProps) {
  return (
    <Stack sx={gridSx}>
      {Array.from({ length: count }).map((_, index) => (
        <AddressCardSkeleton key={index} />
      ))}
    </Stack>
  );
}
