import { Box } from '@castlery/fortress';
import { ShoppingBag } from '@castlery/fortress/Icons';
import { accessInPos } from '@castlery/config';

export function ProgressBar({ label, icon, width }: { label?: string; icon?: string; width: number }) {
  const safeWidth = Number.isFinite(width) ? Math.min(Math.max(width, 0), 100) : 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
        mt: accessInPos ? 0 : 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          background: (theme) => theme.palette.brand.terracotta[100],
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: `${safeWidth}%`,
            height: '100%',
            borderRadius: 4,
            background: (theme) => theme.palette.brand.terracotta[500],
            transition: 'width 0.5s cubic-bezier(0.35, 0.95, 0.67, 0.99)',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        ></Box>
      </Box>
      <Box>
        <ShoppingBag sx={{ height: 20, width: 20 }} />
      </Box>
    </Box>
  );
}
