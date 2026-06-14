'use client';
import React, { useState } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCurrentPage, selectSalesListRowInfo } from '@castlery/modules-user-domain';
import { SalesOrderDetails } from '@castlery/modules-user-components';
import { PosSalesOrderDetails } from '@castlery/modules-order-components';
import { useRouter } from 'next/navigation';
import { EcEnv } from '@castlery/config';
import { sharedFeatureService } from '@castlery/shared-services';
import { AddPaymentsV1Drawer } from '@castlery/modules-checkout-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { clearSalesOrderTransactionOrderDetail } from '@castlery/modules-order-domain';
import { clearPosOrderPayments } from '@castlery/modules-payment-domain';

export default function OrderDetails() {
  const enableOrderV2 = sharedFeatureService.enabledOrderV2;
  const dispatch = useAppDispatch();
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);

  const handleOpenPaymentDrawer = () => {
    setPaymentDrawerOpen(true);
  };

  const handleClosePaymentDrawer = () => {
    setPaymentDrawerOpen(false);
    dispatch(clearSalesOrderTransactionOrderDetail());
    dispatch(clearPosOrderPayments());
  };

  // V2 版本：直接返回
  if (enableOrderV2) {
    return (
      <>
        <PosSalesOrderDetails onOpenPaymentDrawer={handleOpenPaymentDrawer} />
        <AddPaymentsV1Drawer
          open={paymentDrawerOpen}
          onCloseDrawer={handleClosePaymentDrawer}
          afterAddPayMethod={handleClosePaymentDrawer}
          title="Payment"
        />
      </>
    );
  }

  // V1 版本：使用 Redux state
  return <OrderDetailsV1 />;
}

// 将 V1 逻辑提取到独立组件
function OrderDetailsV1() {
  const router = useRouter();
  const saleListRowInfo = useAppSelector(selectSalesListRowInfo);
  const currentPage = useAppSelector(selectCurrentPage);
  const localCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();

  // 如果没有订单信息，重定向到列表页
  React.useEffect(() => {
    if (!saleListRowInfo || Object.keys(saleListRowInfo).length === 0) {
      router.replace(`/${localCountry}/sale-history`);
    }
  }, [saleListRowInfo, router, localCountry]);

  // 加载中或无数据时显示空内容
  if (!saleListRowInfo || Object.keys(saleListRowInfo).length === 0) {
    return null;
  }

  return <SalesOrderDetails detailInfo={saleListRowInfo} currentPage={currentPage as number} />;
}
