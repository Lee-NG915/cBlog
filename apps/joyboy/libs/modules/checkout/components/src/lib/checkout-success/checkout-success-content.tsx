'use client';
import { Box, Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { CheckCircleFilled } from '@castlery/fortress/Icons';
import { basePageConfig, EcEnv } from '@castlery/config';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { OrderDataV1 } from '@castlery/types';
import { checkoutFeatureService } from '@castlery/modules-checkout-services';

import { GoogleCustomerReviews } from '../google-customer-reviews/google-customer-reviews';
import { useEstimatedDeliveryDate } from '../hooks/use-estimated-delivery-date';

const prefix = `/${EcEnv.NEXT_PUBLIC_COUNTRY}`.toLowerCase();
const orderDetailsPath = prefix + basePageConfig['order-details'];
const continueShoppingPath = prefix + basePageConfig.home;

type CheckoutSuccessContentProps = {
  order: OrderDataV1;
  orderId: string;
};

export const CheckoutSuccessContent = ({ order, orderId }: CheckoutSuccessContentProps) => {
  const { mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, { keyPrefix: 'checkoutSuccess' as any });
  const user = useAppSelector(selectedActiveUser);

  const descriptions = (t('descriptions' as any, { returnObjects: true }) ?? []) as unknown as string[];
  const referenceNumber = order?.referenceNumber || '';
  const estimatedDeliveryDate = useEstimatedDeliveryDate(order);

  const orderTotal = parseFloat(order?.summary?.total || '0');
  const gcrEmail = user?.email || '';
  const gcrCountry = EcEnv.NEXT_PUBLIC_COUNTRY || '';
  const canRenderGoogleCustomerReviews = Boolean(
    checkoutFeatureService.enableGoogleCustomerReviews && gcrEmail && gcrCountry && orderTotal > 0
  );

  const viewOrderHref = `${orderDetailsPath}?id=${encodeURIComponent(orderId)}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '60vh',
        padding: { xs: 4, md: 15 },
        textAlign: 'center',
        gap: 4,
      }}
    >
      {canRenderGoogleCustomerReviews && (
        <GoogleCustomerReviews
          orderId={orderId}
          email={gcrEmail}
          deliveryCountry={gcrCountry}
          estimatedDeliveryDate={estimatedDeliveryDate}
          gcrOptInStyle={mobile ? 'BOTTOM_TRAY' : 'CENTER_DIALOG'}
        />
      )}

      <Box sx={{ marginBottom: 4 }}>
        <CheckCircleFilled sx={{ width: 108, height: 108, color: (theme) => theme.palette.brand.leafGreen[500] }} />
      </Box>

      <Typography
        level="h2"
        sx={{
          marginBottom: 3,
          fontSize: { xs: '24px', md: '32px' },
          fontWeight: 600,
        }}
      >
        {t('title' as any)}
      </Typography>

      {referenceNumber && (
        <Typography level="subh1">{t('orderNumber', { orderNumber: referenceNumber } as any)}</Typography>
      )}

      <Stack>
        {descriptions.map((description, index) => (
          <Typography key={index} level="body2">
            {description}
          </Typography>
        ))}
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: 600,
          mt: 9,
        }}
      >
        <Button
          component="a"
          href={viewOrderHref}
          variant="secondary"
          fullWidth
          sx={{ minWidth: { xs: '100%', sm: 240 } }}
        >
          {t('viewOrderDetails' as any)}
        </Button>
        <Button
          component="a"
          href={continueShoppingPath}
          variant="primary"
          fullWidth
          sx={{ minWidth: { xs: '100%', sm: 240 } }}
        >
          {t('continueShopping' as any)}
        </Button>
      </Stack>
    </Box>
  );
};
