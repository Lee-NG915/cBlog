'use client';
import { Typography, Stack, Sheet } from '@castlery/fortress';
import { paymentFeatureService } from '@castlery/modules-payment-services';
import { SupportedPaymentMethods } from '@castlery/modules-payment-domain';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { PaymentIcon } from '../../payment-Icon/payment-icon';

interface GrabPayPaymentProps {
  selectedPaymentKey: string;
  Selector: (value: string, label: string) => React.ReactNode;
}
export function GrabPayPayment({ selectedPaymentKey, Selector }: GrabPayPaymentProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.grabPayPayment',
  });

  const payment = paymentFeatureService
    .getSupportedPaymentMethods()
    .find((payment) => payment.key === SupportedPaymentMethods.GRAB_PAY);
  if (!payment) return null;

  const isSelected = selectedPaymentKey === payment.key;

  return (
    <Sheet
      sx={{
        gap: 2,
        border: (theme) => `1px solid ${theme.palette.brand.mono[300]}`,
        ...(isSelected && {
          background: (theme) => theme.palette.brand.warmLinen[500],
        }),
      }}
    >
      <Stack
        key={payment.key}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
        }}
      >
        {Selector(payment.key, payment.label)}
        <PaymentIcon icons={payment.icons} />
      </Stack>
      {isSelected && (
        <Stack sx={{ p: 3, pt: 0 }}>
          <Typography level="caption2">{t('description')}</Typography>
        </Stack>
      )}
    </Sheet>
  );
}
