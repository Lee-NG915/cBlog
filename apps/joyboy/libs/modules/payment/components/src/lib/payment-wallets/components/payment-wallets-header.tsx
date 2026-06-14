import { Stack, Typography } from '@castlery/fortress';
import { Security } from '@castlery/fortress/Icons';

interface PaymentWalletsHeaderProps {
  title: string;
  secureLabel: string;
}

export function PaymentWalletsHeader({ title, secureLabel }: PaymentWalletsHeaderProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography level="h3">{title}</Typography>
      <Typography level="caption1" startDecorator={<Security />}>
        {secureLabel}
      </Typography>
    </Stack>
  );
}
