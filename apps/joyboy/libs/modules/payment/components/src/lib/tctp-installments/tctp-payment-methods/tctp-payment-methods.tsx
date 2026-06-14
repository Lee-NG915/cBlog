'use client';
import { Box, Typography, RadioGroup, Radio, Sheet, Stack, Button, typographyClasses } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { FortressImage } from '@castlery/shared-components';
import { paymentFeatureService } from '@castlery/modules-payment-services';
import { SupportedPaymentMethods } from '@castlery/modules-payment-domain';
import { PaymentIcon } from '../../payment-Icon/payment-icon';
import { TcTpCardInput } from '../tctp-card-input/tctp-card-input';

const options = [{}];

interface TCTPPaymentMethodsProps {
  selectedPaymentKey: string;
  Selector: (value: string, label: string) => React.ReactNode;
}

export const TCTPPaymentMethods = ({ selectedPaymentKey, Selector }: TCTPPaymentMethodsProps) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.2c2pPaymentMethods',
  });

  const payment = paymentFeatureService
    .getSupportedPaymentMethods()
    .find((payment) => payment.key === SupportedPaymentMethods.INSTALMENT_2C2P);

  if (!payment) return null;

  const banks = payment.payload?.banks || [];
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
          <Stack spacing={3}>
            <Typography level="caption1">{t('installmentPlans')}</Typography>
            <RadioGroup key="2c2p-instalment-banks" orientation="horizontal" sx={{ gap: 8, height: 36, p: 0, m: 0 }}>
              {banks.map((bank: { icons: string[]; key: string }) => (
                <Stack direction="row" alignItems="center" gap={1} key={bank.key}>
                  <Radio value={bank.key} sx={{ p: 1.5 }} />
                  {bank.icons.map((icon: string, index: number) => (
                    <Stack
                      sx={{
                        width: 53,
                        ...(bank.key === 'OCBC' && {
                          width: 88,
                        }),
                        ...(bank.key === 'DBS' &&
                          index === 0 && {
                            width: 45,
                            mr: 1,
                          }),
                      }}
                    >
                      <FortressImage src={icon} alt={bank.key} objectFit="contain" />
                    </Stack>
                  ))}
                </Stack>
              ))}
            </RadioGroup>
          </Stack>
          <Stack spacing={3}>
            <Typography level="caption1">{t('installmentDuration')}</Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                color="primary"
                sx={{
                  textTransform: 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 0,
                  py: 0.5,
                  height: 44,
                  boxSizing: 'border-box',
                  [`& .${typographyClasses.root}`]: {
                    color: 'inherit',
                  },
                }}
              >
                <Typography level="body2">{t('priceBreakdown', { breakdown: '$1320.37', months: 3 })}</Typography>
                <Typography level="caption2">{t('interestRate', { interestRate: 10 })}</Typography>
              </Button>
            </Stack>
          </Stack>
          <TcTpCardInput onChange={() => {}} />
        </Stack>
      )}
    </Sheet>
  );
};

export default TCTPPaymentMethods;
