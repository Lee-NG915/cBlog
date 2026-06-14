'use client';
import * as React from 'react';
import { SalesOrderList } from '@castlery/modules-user-components';
import { sharedFeatureService } from '@castlery/shared-services';
import { PosSalesOrderList } from '@castlery/modules-order-components';
import { useState } from 'react';
import { AddPaymentsV1Drawer } from '@castlery/modules-checkout-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { clearSalesOrderTransactionOrderDetail } from '@castlery/modules-order-domain';
import { clearPosOrderPayments } from '@castlery/modules-payment-domain';

export default function SaleHistoryPage() {
  const enableOrderV2 = sharedFeatureService.enabledOrderV2;
  const dispatch = useAppDispatch();
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return enableOrderV2 ? (
    <>
      <PosSalesOrderList
        refreshKey={refreshKey}
        onOpenPaymentDrawer={() => {
          setPaymentDrawerOpen(true);
        }}
      />
      <AddPaymentsV1Drawer
        open={paymentDrawerOpen}
        onCloseDrawer={() => {
          setPaymentDrawerOpen(false);
          dispatch(clearSalesOrderTransactionOrderDetail());
          dispatch(clearPosOrderPayments());
        }}
        afterAddPayMethod={() => {
          setPaymentDrawerOpen(false);
          dispatch(clearSalesOrderTransactionOrderDetail());
          setRefreshKey((prev) => prev + 1);
        }}
        title="Payment"
      />
    </>
  ) : (
    <SalesOrderList />
  );
}
