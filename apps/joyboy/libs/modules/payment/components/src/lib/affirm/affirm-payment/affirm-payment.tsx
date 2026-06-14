'use client';
import { Typography, Stack, Sheet } from '@castlery/fortress';
import { paymentFeatureService } from '@castlery/modules-payment-services';
import { SupportedPaymentMethods } from '@castlery/modules-payment-domain';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { PaymentIcon } from '../../payment-Icon/payment-icon';

interface AffirmPaymentProps {
  selectedPaymentKey: string;
  Selector: (value: string, label: string) => React.ReactNode;
}
export function AffirmPayment({ selectedPaymentKey, Selector }: AffirmPaymentProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.affirmPayment',
  });

  const payment = paymentFeatureService
    .getSupportedPaymentMethods()
    .find((payment) => payment.key === SupportedPaymentMethods.AFFIRM);
  if (!payment) return null;

  const isSelected = selectedPaymentKey === payment.key;
  const rules = t('rules', { returnObjects: true });

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
        <Stack sx={{ px: 3, pb: 3, gap: 3 }}>
          {rules.map((rule: { title: string; description: string }, index: number) => (
            <Stack key={index} spacing={1}>
              <Typography level="caption2" sx={{ fontWeight: 'xl' }}>
                {rule.title}
              </Typography>
              <Typography level="caption2">{rule.description}</Typography>
            </Stack>
          ))}
          <Typography></Typography>
        </Stack>
      )}
    </Sheet>
  );
}
