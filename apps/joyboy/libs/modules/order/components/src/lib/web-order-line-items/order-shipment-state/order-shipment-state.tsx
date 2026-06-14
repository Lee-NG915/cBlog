'use client';

import { Box, Stack, Typography, Link, useBreakpoints } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { basePageConfig, EcEnv } from '@castlery/config';

export function OrderShipmentState({ shipment, orderNumber }: { shipment: any; orderNumber: string }) {
  const { desktop, mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderHistoryPage.shipmentStatus',
  });

  const { isPending, isShipped, isCanceled } = useMemo(() => {
    const isPending = ['pending', 'backorder', 'ready'].includes(shipment.state);
    const isShipped = shipment.state === 'shipped';
    const isCanceled = shipment.state === 'canceled';
    return {
      isPending,
      isShipped,
      isCanceled,
    };
  }, [shipment.state]);

  const hideReview = useMemo(() => {
    return shipment.state !== 'delivered' || !shipment.has_unreviewed_items;
  }, [shipment.state, shipment.has_unreviewed_items]);

  const reviewLink = useMemo(() => {
    return `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${
      basePageConfig['submit-review']
    }?order=${orderNumber}&shipment=${shipment.id}`;
  }, [orderNumber, shipment.id]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: desktop ? 'center' : 'flex-start',
          justifyContent: 'center',
        }}
      >
        {isPending && (
          <Stack sx={{ gap: 1 }} direction="column">
            <Typography level="body2">{t('pending')}</Typography>
            <Typography level={mobile ? 'body2' : 'caption1'} sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
              {t('pendingDesc', {
                estimatedDeliveryDate: shipment.estimated_delivery_date_presentation
                  ? shipment.estimated_delivery_date_presentation
                  : shipment.estimated_dispatch_date_presentation,
              })}
            </Typography>
          </Stack>
        )}
        {isShipped && (
          <Stack sx={{ gap: 1 }} direction="column">
            <Typography level="body2">{t('shippedInProgress')}</Typography>
            {shipment.tracking_urls?.map((trackingUrl: string, i: number, urls: string[]) => (
              <Typography level={mobile ? 'body2' : 'caption1'} key={i}>
                <Link variant="primary" href={trackingUrl} target="_blank" rel="noopener" endDecorator={<ArrowRight />}>
                  {t('trackShipping', {
                    index: urls.length > 1 ? i + 1 : '',
                  })}
                </Link>
              </Typography>
            ))}
          </Stack>
        )}
        {isCanceled && (
          <Stack>
            <Typography level="body2">{t('canceled')}</Typography>
          </Stack>
        )}
        {!isPending && !isShipped && !isCanceled && (
          <Stack>
            <Typography level="body2">{t('shipped')}</Typography>
          </Stack>
        )}
      </Box>
      {!hideReview && (
        <Link variant="primary" level={mobile ? 'body2' : 'caption1'} href={reviewLink} endDecorator={<ArrowRight />}>
          {t('reviewCta')}
        </Link>
      )}
    </>
  );
}

export default OrderShipmentState;
