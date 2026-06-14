'use client';
import { useEffect, useMemo } from 'react';
import { Box, Link, Stack, useBreakpoints, useNiceModal } from '@castlery/fortress';
import { ArrowLeft } from '@castlery/fortress/Icons';
import { OrderDataV1 } from '@castlery/types';
import { useGetOrderDetailsV1Query, setSalesOrderTransactionOrderDetail } from '@castlery/modules-order-domain';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ContentLoading, CustomLink } from '@castlery/shared-components';
import { useSearchParams } from 'next/navigation';
import { WebOrderItemTableV1 } from '../web-order-line-items/web-order-line-items-v1';
import { WebOrderSummaryDisplayV1 } from '../web-order-summary-display/web-order-summary-display-V1';
import { OrderBaseInfoV1 } from '../web-order-details/order-base-info-v1';
import { WebOrderInfoOverviewV1 } from '../web-order-info-overview/web-order-info-overview-v1';
import { WebOrderItemsMobileV1 } from '../web-order-line-items/web-order-items-mobile/web-order-items-mobile-v1';
import { WebOrderServiceItemsMobileV1 } from '../web-order-line-items/web-order-service-items-mobile/web-order-service-items-mobile-v1';
import { OrderHistoryAtcButton } from '../order-history-atc-button/order-history-atc-button';
import { PosSalesOrderPayButton } from '../pos-sales-order-pay-button/pos-sales-order-pay-button';
import { OrderHistoryCancelOrderBtn } from '../order-history-cancel-order-btn/order-history-cancel-order-btn';
import { useAppDispatch } from '@castlery/shared-redux-store';

export function PosSalesOrderDetails({ onOpenPaymentDrawer }: { onOpenPaymentDrawer: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') as string;
  const { desktop } = useBreakpoints();

  const { data: order, isLoading } = useGetOrderDetailsV1Query({ id: orderId });
  const [modal, modalContextHolder] = useNiceModal();
  const currentOrder = order?.data as unknown as OrderDataV1;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentOrder) {
      dispatch(setSalesOrderTransactionOrderDetail(currentOrder));
    }
  }, [currentOrder]);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止 Link 的默认跳转行为
    router.back();
  };
  const isCanceled: boolean = useMemo(() => {
    if (!currentOrder) return false;
    if (currentOrder.status === 'CANCELED') {
      return true;
    }
    return false;
  }, [currentOrder]);

  const onlyHaveService: boolean = useMemo(() => {
    if (!currentOrder) return false;
    return !currentOrder.shipments || (Array.isArray(currentOrder.shipments) && currentOrder.shipments?.length === 0);
  }, [currentOrder]);

  const isPayProcessing: boolean = useMemo(() => {
    if (!currentOrder) return false;
    if (currentOrder.status === 'PENDING_PAYMENT') {
      return true;
    }
    return false;
  }, [currentOrder]);

  if (!orderId) {
    return null;
  }

  return (
    <>
      {modalContextHolder}
      <Box
        sx={{
          boxSizing: 'border-box',
          minHeight: 500,
          pt: 6,
          width: '100%',
          desktop: { px: 6 },
        }}
      >
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            width: '100%',
            desktop: { gap: 8 },
            tablet: { gap: 4, px: 6 },
            mobile: { gap: 4, px: 4 },
          }}
        >
          <Link
            level="body2"
            startDecorator={<ArrowLeft width={20} height={20} />}
            href="#" // 或者保留原 href 作为 fallback
            onClick={handleBack}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              color: 'var(--fortress-palette-warning-500)',
              textDecoration: 'none',
            }}
            component={CustomLink}
          >
            Back
          </Link>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {isCanceled && !onlyHaveService && <OrderHistoryAtcButton order={currentOrder} modal={modal} />}
            {isPayProcessing && (
              <>
                <PosSalesOrderPayButton order={currentOrder} onOpenPaymentDrawer={onOpenPaymentDrawer} />
                <OrderHistoryCancelOrderBtn order={currentOrder} onSuccess={() => router.back()} />
              </>
            )}
          </Box>
        </Stack>
        {isLoading && (
          <Box
            sx={{
              desktop: { px: 15 },
              tablet: { px: 6 },
              mobile: { px: 4 },
              py: 20,
            }}
          >
            <ContentLoading loading={isLoading} />
          </Box>
        )}
        {order ? (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              desktop: {
                gap: 7,
                py: 4,
              },
              tablet: {
                gap: 7,
              },
              mobile: {
                gap: 4,
              },
            }}
          >
            <OrderBaseInfoV1 order={currentOrder} />
            <Stack>
              <WebOrderInfoOverviewV1 order={currentOrder} hideViewDetails={true} modal={modal} />
              {desktop ? (
                <WebOrderItemTableV1 order={currentOrder} />
              ) : (
                <>
                  <WebOrderItemsMobileV1 order={currentOrder} />
                  <WebOrderServiceItemsMobileV1 addServiceList={currentOrder.addOnServiceLineItems || []} />
                </>
              )}
            </Stack>
            <WebOrderSummaryDisplayV1 order={currentOrder} />
          </Box>
        ) : null}
      </Box>
    </>
  );
}

export default PosSalesOrderDetails;
