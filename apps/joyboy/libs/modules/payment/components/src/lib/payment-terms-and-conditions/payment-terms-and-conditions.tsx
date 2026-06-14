'use client';
import { Box, Typography, Checkbox, Link } from '@castlery/fortress';
import { useTranslation, LocalesNamespace, Trans } from '@castlery/monorepo-i18n';
import { basePageConfig, EcEnv } from '@castlery/config';

const prefix = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
const REFUND_POLICY_URL = `/${prefix}${basePageConfig['sales-and-refunds']}`;
const DELIVERY_POLICY_URL = `/${prefix}${basePageConfig['delivery']}`;

export interface PaymentTermsAndConditionsProps {
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  /**
   * Callback when checkbox state changes
   */
  onChange?: (checked: boolean) => void;
  /**
   * URL for refund policy page
   */
  refundPolicyUrl?: string;
  /**
   * URL for delivery policy page
   */
  deliveryPolicyUrl?: string;
  /**
   * Custom terms text (optional, overrides default text)
   */
  termsText?: React.ReactNode;
}

export interface PaymentTermsAndConditionsTextProps {
  /**
   * URL for refund policy page
   */
  refundPolicyUrl?: string;
  /**
   * URL for delivery policy page
   */
  deliveryPolicyUrl?: string;
  /**
   * i18n key for the terms text
   */
  i18nKey?: string;
}

const linkSx = {
  textDecoration: 'underline',
  color: 'inherit',
  '&:hover': {
    textDecoration: 'underline',
  },
};

export function PaymentTermsAndConditionsText({
  refundPolicyUrl = REFUND_POLICY_URL,
  deliveryPolicyUrl = DELIVERY_POLICY_URL,
  i18nKey = 'checkoutPayment.termsAndConditions.description',
}: PaymentTermsAndConditionsTextProps) {
  return (
    <Trans
      i18nKey={i18nKey}
      ns={LocalesNamespace.MODULES_CHECKOUT}
      components={{
        1: <Link href={refundPolicyUrl} target="_blank" rel="noopener noreferrer" sx={linkSx} />,
        2: <Link href={deliveryPolicyUrl} target="_blank" rel="noopener noreferrer" sx={linkSx} />,
      }}
    />
  );
}

export function PaymentTermsAndConditions({
  checked = false,
  onChange,
  refundPolicyUrl = REFUND_POLICY_URL,
  deliveryPolicyUrl = DELIVERY_POLICY_URL,
  termsText,
}: PaymentTermsAndConditionsProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.termsAndConditions',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  const defaultTermsText = (
    <PaymentTermsAndConditionsText refundPolicyUrl={refundPolicyUrl} deliveryPolicyUrl={deliveryPolicyUrl} />
  );

  return (
    <Box>
      <Typography
        level="h3"
        sx={{
          mb: 2,
        }}
      >
        {t('title')}
      </Typography>

      <Box
        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 3 }}
      >
        <Checkbox checked={checked} onChange={handleChange} sx={{ mt: 0.5 }} />
        <Typography level="body2" sx={{ color: 'inherit' }}>
          {termsText || defaultTermsText}
        </Typography>
      </Box>
    </Box>
  );
}

export default PaymentTermsAndConditions;
