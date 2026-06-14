import { Button, useNiceModal } from '@castlery/fortress';
import { useAsyncFn } from 'react-use';
import { addPayMethodToOrderCommand } from '@castlery/modules-checkout-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { PaymentMasker } from '../payment-masker/payment-masker';

export interface AddPaymentButtonProps {
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

export function AddPaymentButton({ disabled, addApiPayload, afterAddPayMethod, buttonText }: AddPaymentButtonProps) {
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = useNiceModal();

  const [payState, addPay] = useAsyncFn(async () => {
    if (!addApiPayload) return Promise.reject('Please provide addApiPayload');
    return dispatch(addPayMethodToOrderCommand(addApiPayload)).then((res) => {
      const { errors } = res.payload?.data || {};
      if (errors) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        const { title, detail } = errors?.[0];
        const error = title ? `${title}. ${detail}` : detail;
        error &&
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
      afterAddPayMethod && afterAddPayMethod();
    });
  }, [addApiPayload, dispatch, modal]);

  return (
    <>
      <PaymentMasker loading={payState.loading} />
      <Button loading={payState.loading} onClick={addPay} disabled={disabled}>
        {buttonText || 'Add Payment'}
      </Button>
      {contextHolder}
    </>
  );
}

export default AddPaymentButton;
