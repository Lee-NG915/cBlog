import { Button, useNiceModal, modalDialogClasses, Stack, Typography } from '@castlery/fortress';
import { useAsyncFn } from 'react-use';
import { stripeLinkPayCommand } from '@castlery/modules-checkout-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { PaymentMasker } from '../payment-masker/payment-masker';
import { createANewPosOrder } from '@castlery/modules-order-services';
import { posRoutes } from '@castlery/config';
import { useRouter } from 'next/navigation';
import { toPrice } from '@castlery/utils';

export interface AddStripeLinkButtonProps {
  orderNumber: string | undefined;
  disabled: boolean;
  afterAddPayMethod?: () => void;
}

export function AddStripeLinkButton({ orderNumber, disabled, afterAddPayMethod }: AddStripeLinkButtonProps) {
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = useNiceModal();
  const router = useRouter();

  const createNewOrder = async () => {
    await dispatch(createANewPosOrder());
    return new Promise((resolve) => {
      router.replace(posRoutes.products);
      setTimeout(resolve, 1500);
    }).then(() => {
      window.location.reload();
    });
  };

  const [payState, addPay] = useAsyncFn(async () => {
    if (!orderNumber) return Promise.reject('Please provide orderNumber');
    return dispatch(stripeLinkPayCommand({ number: orderNumber })).then((res) => {
      console.log('----res', res);
      if ('error' in res) {
        const { title, detail } = res.payload?.data?.errors?.[0] || {};
        const error = `${title}. ${detail}` || 'Failed to add payment!';
        modal.warning({
          title: 'Oops!',
          subDesc: error,
          showCancelBtn: false,
          confirmText: 'Got it',
          dialogSx: {
            maxWidth: 360,
          },
        });
        return;
      }
      const amountDue = (res.payload as { total: number }).total || 0;

      modal.success({
        success: false,
        fullScreen: true,
        showCloseBtn: false,
        showCancelBtn: false,
        confirmText: 'Next Order',
        content: (
          <Stack spacing={1}>
            <Stack>
              <Typography>Order Number: </Typography>
              <Typography sx={{ fontWeight: 600 }}>{orderNumber}</Typography>
            </Stack>
            <Stack>
              <Typography>Amount Due: </Typography>
              <Typography sx={{ fontWeight: 600 }}>{toPrice(amountDue || 0, false)}</Typography>
            </Stack>
          </Stack>
        ),
        onConfirm: createNewOrder,
        dialogSx: {
          textAlign: 'center',
          justifyContent: 'center',
          [`& .${modalDialogClasses.root}-content`]: {
            margin: 'auto',
          },

          '#modal-modal-title': {
            justifyContent: 'center',
          },
          '#modal-modal-footer > button': {
            maxWidth: 173,
          },
        },
      });
    });
  }, [dispatch, orderNumber, afterAddPayMethod]);
  return (
    <>
      <PaymentMasker loading={payState.loading} />
      <Button loading={payState.loading} onClick={addPay} disabled={disabled}>
        Send Payment Link
      </Button>
      {contextHolder}
    </>
  );
}

export default AddStripeLinkButton;
