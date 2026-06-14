'use client';

import { Box, Typography, useBreakpoints } from '@castlery/fortress';
import { getCustomerOrderHistory } from '@castlery/modules-order-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { ContentLoading, WebOrdersEmptyPlaceholder } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useMemo } from 'react';
import { WebOrderHistoryList } from '../web-order-history-list/web-order-history-list';

export function WebOrderHistory() {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderHistoryPage',
  });
  const { mobile, tablet, desktop } = useBreakpoints();

  const getOrderHistory = useMemo(() => getCustomerOrderHistory.select(), []);
  const { data: orders = [], isLoading, isSuccess } = useAppSelector(getOrderHistory);

  const showEmptyPlaceholder = isSuccess && (!orders || orders.length === 0);

  return (
    <Box
      sx={{
        minHeight: 500,
        width: '100%',
        ...(desktop
          ? {
              px: 15,
              py: 8,
            }
          : {
              py: 7,
            }),
      }}
    >
      {showEmptyPlaceholder ? (
        <Box
          sx={{
            ...(tablet && {
              px: 6,
            }),
            ...(mobile && {
              px: 4,
            }),
          }}
        >
          <WebOrdersEmptyPlaceholder />
        </Box>
      ) : (
        <Box>
          <Typography
            level="h2"
            sx={{
              ...(desktop && { mb: 8 }),
              ...(mobile && { mb: 6, px: 4 }),
              ...(tablet && { mb: 8, px: 6 }),
            }}
          >
            {t('title')}
          </Typography>
          {isLoading && <ContentLoading loading={isLoading} />}
          {orders?.length > 0 && <WebOrderHistoryList orders={orders} />}
        </Box>
      )}
    </Box>
  );
}
