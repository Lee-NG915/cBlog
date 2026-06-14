import { Stack, Skeleton } from '@castlery/fortress';

export function PaymentWalletsSkeleton() {
  return (
    <Stack spacing={4}>
      <Skeleton variant="rectangular" height={26} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" height={26} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" height={26} />
    </Stack>
  );
}
