'use client';
import { useTranslation, LocalesNamespace, Trans } from '@castlery/monorepo-i18n';
import { Typography, Stack, Link } from '@castlery/fortress';
import { contactUsUrl, orderHistoryPath } from '../constants';
import type { PaymentErrorCategory } from '../utils/classify-payment-error';
// List, ListItem

// const BulletPoint = () => (
//   <Typography level="body2" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
//     ·
//   </Typography>
// );
export interface PaymentErrorPopupDetailProps {
  orderNumber: string;
  errorMessage?: string;
  category?: PaymentErrorCategory;
  failureCode?: string;
  failureInfo?: string;
  /**
   * Interpolated into i18n templates that contain a `{{shortMessage}}` slot
   * (currently only `paymentProcessingError.paypalError` per PRD row 19).
   */
  shortMessage?: string;
  details?: Record<string, any> | null;
}

export interface InvalidLineItem {
  lineItemId: string;
  name: string;
  variantId: number;
}

export const PaymentErrorPopupDetail = ({
  orderNumber,
  errorMessage,
  category,
  failureCode,
  failureInfo,
  shortMessage,
  details,
}: PaymentErrorPopupDetailProps) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.paymentWallets.errors',
  });

  return (
    <Stack gap={3} sx={{ mt: 3, mb: 6 }}>
      {orderNumber && (
        <Stack direction="row" justifyContent="center" gap={1}>
          <Typography level="body2" fontWeight={600}>
            {t('orderNumber' as any)}:
          </Typography>
          <Typography level="body2">#{orderNumber}</Typography>
        </Stack>
      )}
      {(category || errorMessage) && (
        <Stack>
          <Typography level="body2" textAlign="center">
            {category ? (
              <Trans
                i18nKey={`paymentProcessingError.${category}`}
                ns={LocalesNamespace.ERROR}
                components={{
                  // `paymentSuccessOrderCanceled` is the only category whose
                  // <1> slot is a contact-us link (per i18n value); all other
                  // categories use <1> as the order-history link.
                  1: (
                    <Link
                      href={category === 'paymentSuccessOrderCanceled' ? contactUsUrl : orderHistoryPath}
                      sx={{ color: 'inherit', textDecoration: 'underline' }}
                    />
                  ),
                }}
                // `shortMessage` interpolates the PayPal `[SHORT]` text into the
                // `paypalError` template; other categories ignore the variable.
                values={{ shortMessage: shortMessage ?? '' }}
              />
            ) : (
              errorMessage
            )}
          </Typography>
        </Stack>
      )}

      {failureCode && (
        <Stack direction="row" justifyContent="center" gap={1}>
          <Typography level="body2" fontWeight={600}>
            {t('failureCode' as any)}:
          </Typography>
          <Typography level="body2">{failureCode}</Typography>
        </Stack>
      )}

      {failureInfo && (
        <Stack direction="row" justifyContent="center" gap={1}>
          <Typography level="body2" fontWeight={600} sx={{ minWidth: 85 }}>
            {t('failureInfo' as any)}:
          </Typography>
          <Typography level="body2">{failureInfo}</Typography>
        </Stack>
      )}
    </Stack>
  );
};
