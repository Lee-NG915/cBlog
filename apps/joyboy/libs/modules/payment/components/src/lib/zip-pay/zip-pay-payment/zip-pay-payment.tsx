'use client';
import { Typography, Stack, Sheet } from '@castlery/fortress';
import { paymentFeatureService } from '@castlery/modules-payment-services';
import { SupportedPaymentMethods } from '@castlery/modules-payment-domain';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { PaymentIcon } from '../../payment-Icon/payment-icon';
import { toPrice } from '@castlery/utils';

interface ZipPayPaymentProps {
  selectedPaymentKey: string;
  Selector: (value: string, label: string) => React.ReactNode;
  total: string;
}
export function ZipPayPayment({ selectedPaymentKey, Selector, total }: ZipPayPaymentProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.zipPayPayment',
  });

  const payment = paymentFeatureService
    .getSupportedPaymentMethods()
    .find((payment) => payment.key === SupportedPaymentMethods.ZIP_PAY);
  if (!payment) return null;

  const isSelected = selectedPaymentKey === payment.key;
  const totalNumber = Number(total) || 0;
  const amount = toPrice(Number((totalNumber / 12 / 4.33).toFixed(2)));

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
          {totalNumber < 1000 ? (
            <Typography level="caption2">{t('ruleLessThanThreshold')}</Typography>
          ) : (
            <Typography level="caption2">{t('ruleMoreThanThreshold', { amount })}</Typography>
          )}
          <Typography level="caption2">{t('description')}</Typography>
        </Stack>
      )}
    </Sheet>
  );
}
