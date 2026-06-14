'use client';
import { Typography, Stack, Sheet } from '@castlery/fortress';
import { paymentFeatureService } from '@castlery/modules-payment-services';
import { SupportedPaymentMethods } from '@castlery/modules-payment-domain';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { PaymentIcon } from '../../payment-Icon/payment-icon';

interface AfterPayPaymentElementProps {
  selectedPaymentKey: string;
  Selector: (value: string, label: string) => React.ReactNode;
}
export function AfterPayPaymentElement({ selectedPaymentKey, Selector }: AfterPayPaymentElementProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.afterPayPayment',
  });

  const payment = paymentFeatureService
    .getSupportedPaymentMethods()
    .find((payment) => payment.key === SupportedPaymentMethods.AFTER_PAY);
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
        <Stack sx={{ px: 3, pb: 3 }}>
          {/*  amount = price / 4  */}
          <Typography level="caption2">{t('rulesDescription', { amount: '$123.50' })}</Typography>
          <Typography level="caption2">{t('description')}</Typography>
        </Stack>
      )}
    </Sheet>
  );
}
