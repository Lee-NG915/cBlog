import { Backdrop, CircularProgress, Stack } from '@castlery/fortress';

export interface PaymentMaskerProps {
  loading: boolean;
  children?: React.ReactNode;
}
export const PaymentMasker = ({ children, loading }: PaymentMaskerProps) => {
  return (
    <Backdrop open={loading}>
      <Stack spacing={4} sx={{ alignItems: 'center' }}>
        <CircularProgress size="sm" color="neutral" variant="plain" thickness={3} />
        {children ? children : null}
      </Stack>
    </Backdrop>
  );
};

export default PaymentMasker;
