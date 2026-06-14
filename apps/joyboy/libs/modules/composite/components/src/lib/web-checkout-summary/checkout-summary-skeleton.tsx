'use client';
import { Stack, Skeleton, Divider } from '@castlery/fortress';

const SKELETON_COUNT = 5;

export function CheckoutSummarySkeleton() {
  return (
    <Stack>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Stack key={index}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 5, px: 6 }}>
            <Skeleton variant="text" level="body2" sx={{ width: '100%' }} />
          </Stack>
          {index !== SKELETON_COUNT - 1 && <Divider />}
        </Stack>
      ))}
    </Stack>
  );
}
