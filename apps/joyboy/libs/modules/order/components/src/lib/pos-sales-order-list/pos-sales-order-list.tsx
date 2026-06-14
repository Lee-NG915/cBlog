'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Stack, Typography, Loading, Pagination, Divider } from '@castlery/fortress';
import { useGetPosCustomerOrderHistoryV1Query } from '@castlery/modules-order-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import { PosSalesOrderListItem } from './components/pos-sales-order-list-item';

const PAGE_SIZE = 5;

export function PosSalesOrderList({
  onOpenPaymentDrawer,
  refreshKey,
}: {
  onOpenPaymentDrawer: () => void;
  refreshKey?: number;
}) {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderHistoryPage',
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从 URL 读取页码，默认为 1
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  // 同步 URL 参数到 state
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  // 请求当前页数据 - 基于 currentPage 触发请求
  const { data, isFetching, isSuccess, refetch } = useGetPosCustomerOrderHistoryV1Query({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (refreshKey !== undefined) {
      refetch();
    }
  }, [refreshKey, refetch]);

  // 计算显示相关的数据
  const orders = useMemo(() => data?.data?.list ?? [], [data]);
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showEmptyPlaceholder = isSuccess && orders.length === 0;

  // 计算当前显示的订单范围
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, total);

  // 处理分页变化 - 更新 URL 参数
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    // 更新 URL 参数
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {/* 订单数量信息 */}
      {!showEmptyPlaceholder && (
        <Box
          sx={{
            py: 4,
          }}
        >
          <Typography level="caption1" textAlign="center">
            {total > 0 ? `${startIndex} - ${endIndex} of ${total} orders` : 'No orders'}
          </Typography>
        </Box>
      )}

      {/* 订单列表区域 */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          px: 6,
          py: 4,
          position: 'relative',
        }}
      >
        {isFetching && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Loading theme="dark" />
          </Box>
        )}
        {showEmptyPlaceholder ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <Typography level="body2">{t('emptyOrders', 'No orders found')}</Typography>
          </Box>
        ) : (
          <Stack
            direction="column"
            spacing={0}
            sx={{
              ...(isFetching && {
                // 添加一个蒙层
                opacity: 0.5,
              }),
            }}
          >
            {orders.map((order) => (
              <>
                <PosSalesOrderListItem
                  key={order.id}
                  order={order}
                  onOpenPaymentDrawer={onOpenPaymentDrawer}
                  onCountdownExpiredRefresh={refetch}
                />
                <Divider sx={{ my: 6 }} />
              </>
            ))}
          </Stack>
        )}
      </Box>

      {/* 分页组件 */}
      {!showEmptyPlaceholder && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
            px: 6,
          }}
        >
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
        </Box>
      )}
    </Box>
  );
}
