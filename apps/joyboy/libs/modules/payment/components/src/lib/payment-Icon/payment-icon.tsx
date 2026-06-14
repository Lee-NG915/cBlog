import { memo } from 'react';
import { Stack, Box } from '@castlery/fortress';

// Local PaymentIcon component - Memoized to prevent unnecessary re-renders
export const PaymentIcon = memo(function PaymentIcon({
  icons,
}: {
  icons: { key: string; url: string; width: number; height: number; alt?: string }[];
}) {
  if (!icons?.length) return null;

  return (
    <Stack direction="row" alignItems="center" gap={2} sx={{ height: 36 }}>
      {icons.map((icon) => (
        <Box
          key={icon.key}
          component="img"
          src={icon.url}
          alt={icon.alt || icon.key}
          sx={{
            height: icon.height,
            width: icon.width,
            objectFit: 'contain',
          }}
        />
      ))}
    </Stack>
  );
});
