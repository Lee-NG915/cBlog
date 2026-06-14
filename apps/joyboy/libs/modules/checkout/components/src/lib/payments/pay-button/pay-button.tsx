'use client';
import React, { useState, useMemo } from 'react';
import { Button, useDecNiceModal, Stack, Typography, Box } from '@castlery/fortress';
import { PaymentTerms } from '../payment-terms/payment-terms';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectOrder, selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { useAsyncFn } from 'react-use';
import { confirmPayCommand } from '@castlery/modules-checkout-services';
import { failedModalParams, successModalParams, termsModalParams } from './helper';
import { useRouter } from 'next/navigation';
import { posRoutes } from '@castlery/config';
import { toPrice } from '@castlery/utils';

export function PayButton() {
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
  const [payResult, setPayResult] = useState<any>(null);
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const orderNumber = useAppSelector(selectCurrentOrderNumber);
  const order = useAppSelector(selectOrder);
  const dispatch = useAppDispatch();
  const payDisabled = useMemo(
    () => (!Number(order?.total) ? false : Array.isArray(order?.payments) ? order.payments.length <= 0 : true),
    [order]
  );

  const resetModalProps = useMemo(() => {
    if (!agreeTerms) return { ...modalProps, ...termsModalParams };
    return !payResult
      ? modalProps
      : 'error' in payResult
      ? {
          ...modalProps,
          ...failedModalParams,
          ...(payResult?.payload?.data
            ? { subDesc: payResult?.payload?.data?.errors?.[0]?.detail || JSON.stringify(payResult?.error) }
            : { subDesc: JSON.stringify(payResult.error) }),
        }
      : { ...modalProps, ...successModalParams };
  }, [payResult, modalProps, agreeTerms]);

  const payableTotal = useMemo(() => {
    if (!payResult || 'error' in payResult) return 0;

    return (
      payResult?.payload?.payments?.reduce(
        (acc: number, curr: { amount: string }) => acc + Number(curr?.amount) || 0,
        0
      ) ?? 0
    );
  }, [payResult]);

  const [payState, confirmPay] = useAsyncFn(async () => {
    if (!agreeTerms) {
      toggleModal();
      return Promise.resolve();
    }
    if (!orderNumber) return Promise.resolve();
    return dispatch(confirmPayCommand(orderNumber)).then((res: any) => {
      setPayResult(res);
      toggleModal();
    });
  }, [dispatch, orderNumber, toggleModal]);

  const [loadingState, createNewOrder] = useAsyncFn(async () => {
    return new Promise((resolve) => {
      router.replace(posRoutes.products);
      window.location.reload();
      setTimeout(resolve, 2000);
    });
  }, [router]);

  return (
    <React.Fragment>
      <Button fullWidth disabled={payDisabled} onClick={confirmPay} loading={payState.loading}>
        Pay
      </Button>
      <PaymentTerms checked={agreeTerms} onChange={(checked) => setAgreeTerms(checked)} />
      <NiceModal
        {...resetModalProps}
        dialogSx={{
          ...resetModalProps?.dialogSx,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!!resetModalProps && resetModalProps?.success && (
          <>
            <Stack spacing={1}>
              <Stack>
                <Typography>Order Number: </Typography>
                <Typography sx={{ fontWeight: 600 }}>{payResult?.payload?.reference_number}</Typography>
              </Stack>
              <Stack>
                <Typography>Total Paid: </Typography>
                <Typography sx={{ fontWeight: 600 }}>{toPrice(payableTotal, false)}</Typography>
              </Stack>
            </Stack>
            <Button loading={loadingState?.loading} onClick={createNewOrder} sx={{ m: 3, width: 173 }}>
              Next Order
            </Button>
          </>
        )}
      </NiceModal>
    </React.Fragment>
  );
}

export default PayButton;
