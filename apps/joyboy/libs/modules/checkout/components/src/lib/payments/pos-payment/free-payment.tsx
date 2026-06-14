import { Card, Box, Typography } from '@castlery/fortress';

export interface FreePaymentProps {
  hasError: boolean;
}

export function FreePayment({ hasError }: FreePaymentProps) {
  return (
    <Card sx={{ position: 'relative' }}>
      {hasError && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.5)',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        />
      )}
      <Typography
        sx={{
          fontWeight: 600,
          color: (theme) => (hasError ? theme.palette.text.secondary : theme.palette.text.primary),
        }}
      >
        This order is free, you can go ahead and complete the order.
      </Typography>
    </Card>
  );
}

export default FreePayment;
