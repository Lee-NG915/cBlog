'use client';

import { Box, Typography, useBreakpoints, Loading } from '@castlery/fortress';
import { useGetCustomerOrderHistoryV1Query } from '@castlery/modules-order-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ContentLoading, WebOrdersEmptyPlaceholder } from '@castlery/shared-components';
import { WebOrderHistoryListV1 } from '../web-order-history-list/web-order-history-list-v1';
import { useState, useCallback } from 'react';
import { useInfiniteScroll } from '@castlery/utils';

const PAGE_SIZE = 10;

export function WebOrderHistoryV1() {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderHistoryPage',
  });
  const { mobile, tablet, desktop } = useBreakpoints();
  const [currentPage, setCurrentPage] = useState(1);

  // 请求当前页数据
  const { data, isLoading, isFetching, isSuccess } = useGetCustomerOrderHistoryV1Query({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const orders = data?.data?.list ?? [];
  const total = data?.data?.total ?? 0;
  const hasMore = orders.length < total;
  const showEmptyPlaceholder = isSuccess && orders.length === 0;

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  // 无限滚动
  const { triggerRef } = useInfiniteScroll({
    threshold: 300,
    isLoading: isFetching,
    hasMore,
    onLoadMore: handleLoadMore,
    enabled: !isLoading && orders.length > 0,
  });

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
            {(t as any)('title')}
          </Typography>
          {isLoading && <ContentLoading loading={isLoading} />}
          {orders?.length > 0 && (
            <>
              <WebOrderHistoryListV1 orders={orders} />

              {/* 无限滚动触发器 */}
              <Box
                ref={triggerRef}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 4,
                  minHeight: 60,
                }}
              >
                {isFetching && hasMore && (
                  <Box
                    height={200}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Loading theme="dark" />
                  </Box>
                )}
                {/* {!hasMore && orders.length > 0 && (
                  <Typography level="body2" sx={{ color: (theme) => theme.palette.brand.mono[600] }}>
                    noMoreOrders
                  </Typography>
                )} */}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
