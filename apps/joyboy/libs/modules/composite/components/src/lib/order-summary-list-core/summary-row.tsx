'use client';

import { Stack, Skeleton, Box } from '@castlery/fortress';
import { accessInPos } from '@castlery/config';
import { usePathname } from 'next/navigation';

export function SummaryRow({
  children,
  loading,
  forcePadding = false,
}: {
  children: React.ReactNode;
  loading?: boolean;
  forcePadding?: boolean;
}) {
  const pathname = usePathname();
  const noUsePadding = accessInPos && !pathname.includes('/sale-history') && !forcePadding;

  const rowSx = forcePadding
    ? {
        position: 'relative',
        px: 4,
        py: 5,
        width: '100%',
      }
    : noUsePadding
    ? { width: '100%', position: 'relative' }
    : {
        position: 'relative',
        mobile: { p: 4 },
        desktop: { py: 5, px: 6 },
        tablet: { py: 5, px: 6 },
      };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={rowSx}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Skeleton variant="text" animation="wave" level="h3" sx={{ width: '100%', opacity: 0.9 }} />
        </Box>
      )}
    </Stack>
  );
}

export default SummaryRow;
