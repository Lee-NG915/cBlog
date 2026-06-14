'use client';
import { basePageConfig, EcEnv } from '@castlery/config';
import { Box, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowBackIosNew } from '@castlery/fortress/Icons';
import { getOrderDetails } from '@castlery/modules-order-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { ContentLoading } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { WebOrderInfoOverview } from '../web-order-info-overview/web-order-info-overview';
import {
  WebOrderItemsMobile,
  webOrderItemsMobileClassNames,
} from '../web-order-line-items/web-order-items-mobile/web-order-items-mobile';
import { WebOrderItemTable } from '../web-order-line-items/web-order-line-items';
import { WebOrderServiceItemsMobile } from '../web-order-line-items/web-order-service-items-mobile/web-order-service-items-mobile';
import { WebOrderSummaryDisplayV2 } from '../web-order-summary-display/web-order-summary-display';
import { OrderBaseInfo } from './order-base-info';
import { selectedActiveUser } from '@castlery/modules-user-domain';

export function WebOrderDetails() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number') as string;
  const currentUser = useAppSelector(selectedActiveUser);

  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderDetailsPage',
  });
  const ordersHistoryUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig.orders}`;
  const { desktop, tablet, mobile } = useBreakpoints();
  const getOrder = useMemo(() => getOrderDetails.select({ orderNumber: orderNumber }), [orderNumber]);
  const { data: order = null, isLoading } = useAppSelector(getOrder);

  const renderHeader = () => {
    return (
      <Stack
        sx={{
          ...(desktop ? { gap: 8 } : { gap: 4, px: tablet ? 8 : 4 }),
        }}
      >
        <Link
          level="body1"
          color="neutral"
          startDecorator={<ArrowBackIosNew sx={{ width: 16, height: 16 }} />}
          href={ordersHistoryUrl}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {t('backButton')}
        </Link>
        <Typography level="h2">{t('title')}</Typography>
      </Stack>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ px: desktop ? 15 : tablet ? 6 : 4, py: 20 }}>
        {renderHeader()}
        <ContentLoading loading={isLoading} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        minHeight: 500,
        ...(desktop ? { px: 15, py: 10 } : { py: 8 }),
      }}
    >
      {renderHeader()}
      {!order || currentUser?.email !== order.email ? (
        <Box sx={{ mt: 4 }}>
          <Typography level="body2">{t('notFound')}</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            ...(desktop && {
              gap: 7,
              py: 4,
            }),
            ...(tablet && {
              gap: 7,
              [`.${webOrderItemsMobileClassNames.listItemWrapper}`]: {
                pt: 0,
              },
            }),
            ...(mobile && {
              gap: 4,
              [`.${webOrderItemsMobileClassNames.listItemWrapper}`]: {
                pt: 0,
              },
            }),
          }}
        >
          <OrderBaseInfo order={order} />
          <Stack sx={{ gap: desktop ? 0 : 6 }}>
            <WebOrderInfoOverview order={order} hideViewDetails={true} />
            {desktop ? (
              <WebOrderItemTable order={order} />
            ) : (
              <>
                <WebOrderItemsMobile orderId={order.id} orderNumber={order.number} />
                <WebOrderServiceItemsMobile serviceItems={order.addon_service_line_items} />
              </>
            )}
          </Stack>

          <WebOrderSummaryDisplayV2 order={order} />
        </Box>
      )}
    </Box>
  );
}

export default WebOrderDetails;
