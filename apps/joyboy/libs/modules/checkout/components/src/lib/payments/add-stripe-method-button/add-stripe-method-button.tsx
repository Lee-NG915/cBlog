import { Button, useNiceModal } from '@castlery/fortress';
import { useAsyncFn } from 'react-use';
import { addStripePayMethodCommand } from '@castlery/modules-checkout-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { stripeUtil } from '@castlery/utils';
import { PaymentMasker } from '../payment-masker/payment-masker';
import { StripeCancelButton } from '../stripe-cancel-button/stripe-cancel-button';
import { useCallback, useState } from 'react';

export interface AddStripeMethodButtonProps {
  disabled: boolean;
  addApiPayload: {
    orderNumber: string;
    id: number;
    name: string;
    amount: number;
    payType: string;
    comment: string;
  } | null;
  buttonText?: string;
  afterAddPayMethod?: () => void;
}

export function AddStripeMethodButton({
  disabled,
  addApiPayload,
  afterAddPayMethod,
  buttonText,
}: AddStripeMethodButtonProps) {
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = useNiceModal();
  const [showCancelButton, setShowCancelButton] = useState(false);

  const stripeProcessingHandler = useCallback((status: 'pending' | 'success' | 'failed') => {
    setShowCancelButton(() => status === 'pending');
  }, []);

  const cancelPay = useCallback(async () => {
    const unexpectedErrors = await stripeUtil.cancelAnyActivePaymentFlow();
    if (unexpectedErrors.length > 0) {
      console.error('[stripe terminal]cancel payment flow failed:', unexpectedErrors);
    }
  }, []);

  const [payState, addPay] = useAsyncFn(async () => {
    if (!addApiPayload) return Promise.reject('Please provide addApiPayload');
    const readerConnected = stripeUtil.checkConnectStatus();
    if (!readerConnected) {
      modal.warning({
        title: 'Oops!',
        subDesc: 'Please connect reader first!',
        showCancelBtn: false,
        confirmText: 'Got it',
        dialogSx: {
          maxWidth: 360,
        },
      });
      return Promise.reject('Please connect reader first!');
    }
    return dispatch(addStripePayMethodCommand({ ...addApiPayload, stripeProcessingHandler })).then(async (res) => {
      if ('error' in res) {
        await cancelPay();
        let msg =
          typeof res.payload === 'string' ? res.payload : res.payload ? JSON.stringify(res.payload) : res.error.message;

        if (msg && msg.includes('The POS is no longer authenticated')) {
          // 添加字符串: 请检查POS是否已经断开连接
          msg = msg + 'Please check if the reader has been disconnected.';
        }
        msg &&
          modal.warning({
            title: 'Oops!',
            subDesc: msg,
            showCancelBtn: false,
            confirmText: 'Got it',
            dialogSx: {
              maxWidth: 360,
            },
          });
        return;
      }
      afterAddPayMethod && afterAddPayMethod();
    });
  }, [dispatch, afterAddPayMethod, addApiPayload, stripeProcessingHandler, cancelPay]);
  return (
    <>
      <PaymentMasker loading={payState.loading}>{showCancelButton && <StripeCancelButton />}</PaymentMasker>
      <Button loading={payState.loading} onClick={addPay} disabled={disabled}>
        {buttonText || 'Add Payment'}
      </Button>
      {contextHolder}
    </>
  );
}

export default AddStripeMethodButton;
