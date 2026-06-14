'use client';
import { Stack, Skeleton, Divider, useBreakpoints } from '@castlery/fortress';

const SKELETON_COUNT = 2;

export function CheckoutSummaryLineItemSkeleton() {
  const { desktop, mobile } = useBreakpoints();
  const imageWidth = desktop ? 171 : mobile ? 165 : 142;
  const imageHeight = desktop ? 95 : mobile ? 100 : 95;

  return (
    <Stack sx={{ py: 6 }} spacing={4}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Stack key={index} spacing={4}>
          <Stack direction="row" spacing={4}>
            <Skeleton variant="inline" sx={{ width: imageWidth, height: imageHeight, flexShrink: 0 }} />
            <Stack direction="column" spacing={3} sx={{ flex: 1 }}>
              <Skeleton variant="text" level="body2" sx={{ width: '80%' }} />
              <Skeleton variant="text" level="caption1" sx={{ width: '60%' }} />
              <Skeleton variant="text" level="caption2" sx={{ width: '40%' }} />
            </Stack>
          </Stack>
          <Divider />
        </Stack>
      ))}
    </Stack>
  );
}
