'use client';
import { useMemo } from 'react';
import { Box, Stack, Typography, Link, useBreakpoints } from '@castlery/fortress';
import { toPrice, formatDate } from '@castlery/utils';
import { EcEnv, basePageConfig } from '@castlery/config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { NextLink, CustomLink } from '@castlery/shared-components';

interface WebOrderInfoOverviewProps {
  hideViewDetails?: boolean;
  order: {
    number: string;
    reference_number: string;
    completed_at: string;
    total: number;
    order_status: string;
  };
}
export function WebOrderInfoOverview({ order, hideViewDetails = false }: WebOrderInfoOverviewProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderInfoOverview',
  });
  const { desktop, mobile, tablet, md } = useBreakpoints();

  const detailsUrl = useMemo(
    () => `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['order-details']}?number=${order.number}`,
    [order.number]
  );
  const orderPlaced = useMemo(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    //此处显示用户当地的时区时间
    return order.completed_at ? formatDate(order.completed_at, 'MMM d yyyy, h:mm  aa', timeZone) : '';
  }, [order.completed_at]);

  const orderStatus = useMemo(() => {
    if (!order) return '';
    if (order.order_status === 'cancelled') {
      return t('canceled');
    }
    return order.order_status ? order.order_status.replace(/_/g, ' ') : '';
  }, [order, t]);

  return (
    <Box
      sx={{
        ...(desktop
          ? {
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              px: 6,
              py: 3,
            }
          : {
              width: '100vw',
              py: 4,
              px: tablet ? 6 : 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }),
        background: (theme) => theme.palette.brand.warmLinen[500],
      }}
    >
      <Box
        sx={{
          ...(desktop
            ? { width: md ? '80%' : '65%', display: 'flex', justifyContent: 'space-between' }
            : {
                display: 'grid',
                gridTemplateColumns: 'repeat(2,1fr)',
                rowGap: 3,
                alignItems: 'center',
                justifyContent: 'space-between',
              }),
        }}
      >
        <Stack direction="column" gap={1}>
          <Typography
            level="subh3"
            sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
          >
            {t('orderNo')}
          </Typography>
          <Typography level="body2">{order.reference_number}</Typography>
        </Stack>
        <Stack direction="column" gap={1}>
          <Typography
            level="subh3"
            sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
          >
            {t('orderPlaced')}
          </Typography>
          <Typography level="body2">{orderPlaced}</Typography>
        </Stack>
        <Stack direction="column" gap={1}>
          <Typography
            level="subh3"
            sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
          >
            {t('total')}
          </Typography>
          <Typography level="body2">{toPrice(order.total, true)}</Typography>
        </Stack>
        <Stack direction="column" gap={1}>
          <Typography
            level="subh3"
            sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
          >
            {t('orderStatus')}
          </Typography>
          <Typography level="body2" sx={{ textTransform: 'capitalize' }}>
            {orderStatus}
          </Typography>
        </Stack>
      </Box>
      {!hideViewDetails && (
        <Link variant="primary" href={detailsUrl} level={mobile ? 'body2' : 'caption1'} component={CustomLink}>
          {t('viewOrderDetails')}
        </Link>
      )}
    </Box>
  );
}
