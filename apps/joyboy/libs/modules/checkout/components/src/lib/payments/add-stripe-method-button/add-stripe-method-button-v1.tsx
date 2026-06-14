import { Button, useNiceModal, Modal, ModalDialog, Loading, Typography, Box } from '@castlery/fortress';
import { useAsyncFn } from 'react-use';
import { addStripePayMethodCommandV1 } from '@castlery/modules-checkout-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { stripeUtil } from '@castlery/utils';
import { PaymentMasker } from '../payment-masker/payment-masker';
import { StripeCancelButton } from '../stripe-cancel-button/stripe-cancel-button';
import { useState } from 'react';

export interface AddStripeMethodButtonV1Props {
  disabled: boolean;
  addApiPayload: {
    orderNumber: string;
    orderId: string;
    provider: string;
    amount: string;
    description: string;
    remarks?: string;
    currency: string;
  } | null;
  buttonText?: string;
  afterAddPayMethod?: () => void;
}

export function AddStripeMethodButtonV1({
  disabled,
  addApiPayload,
  afterAddPayMethod,
  buttonText,
}: AddStripeMethodButtonV1Props) {
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = useNiceModal();
  const [showCancelButton, setShowCancelButton] = useState(false);

  const stripeProcessingHandler = (status: 'pending' | 'success' | 'failed') => {
    setShowCancelButton(() => status === 'pending');
  };
  const cancelPay = async () => {
    await stripeUtil.cancelCollectPaymentMethod();
    await stripeUtil.cancelCollectSetupIntentPaymentMethod();
  };

  const [payState, addPay] = useAsyncFn(async () => {
    if (!addApiPayload) return Promise.reject('Please provide addApiPayload');

    const readerConnected = stripeUtil.checkConnectStatus();

    console.log('🚀 ~ readerConnected:', readerConnected);
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

    return dispatch(addStripePayMethodCommandV1({ ...addApiPayload, stripeProcessingHandler })).then((res) => {
      if ('error' in res) {
        cancelPay();
      }
      afterAddPayMethod && afterAddPayMethod();
    });
  }, [dispatch, afterAddPayMethod, addApiPayload, stripeProcessingHandler, cancelPay, modal]);
  return (
    <>
      {/* <PaymentMasker loading={payState.loading}>{showCancelButton && <StripeCancelButton />}</PaymentMasker> */}
      <Button disabled={payState.loading} onClick={addPay}>
        {buttonText || 'Add Payment'}
      </Button>
      {contextHolder}
      <Modal open={payState.loading} onClose={() => {}}>
        <ModalDialog
          sx={{
            width: 640,
            height: 156,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography level="h3">Payment in progress</Typography>
            <Loading theme="dark" />
            {showCancelButton && (
              <Button variant="secondary" color="neutral" size="lg" onClick={cancelPay}>
                Cancel
              </Button>
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default AddStripeMethodButtonV1;
