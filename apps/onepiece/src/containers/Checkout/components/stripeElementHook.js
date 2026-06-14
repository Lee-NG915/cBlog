import { useMemo, useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { PAYMENT_METHOD } from '../constant';

export const useOptions = (paymentRequest) => {
  const options = useMemo(
    () => ({
      paymentRequest,
      style: {
        paymentRequestButton: {
          // One of 'default', 'book', 'buy', or 'donate'
          // Defaults to 'default'
          // type: 'buy',
          // One of 'dark', 'light', or 'light-outline'
          // Defaults to 'dark'
          theme: 'dark',
          // Defaults to '40px'. The width is always '100%'.
          // TODO 是否要区分移动端和pc端的宽度？
          // height: '55px',
          height: '58px',
        },
      },
    }),
    [paymentRequest]
  );

  return options;
};

/**
 * initializes the payment request
 */
export const usePaymentRequest = ({ options, onPaymentMethod }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [walletType, setWalletType] = useState('');

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest(options);
      setPaymentRequest(pr);
    }
  }, [stripe, options]);

  useEffect(() => {
    let subscribed = true;
    if (paymentRequest) {
      paymentRequest.canMakePayment().then(
        /**
         * @param {Object} res
         * @param {boolean} res.applePay
         * @param {boolean} res.googlePay
         * @param {boolean} res.link
         */
        (res) => {
          if (res && subscribed) {
            const supportWallet = Object.entries(res)
              .filter(([, isSupport]) => Boolean(isSupport))
              .map(([key]) => PAYMENT_METHOD[key]);
            // The if-else statements here are distinguished by priority.
            // https://stripe.com/docs/stripe-js/elements/payment-request-button?client=react
            if (supportWallet.includes(PAYMENT_METHOD.applePay)) {
              setWalletType(PAYMENT_METHOD.applePay);
            } else if (supportWallet.includes(PAYMENT_METHOD.googlePay)) {
              setWalletType(PAYMENT_METHOD.googlePay);
            } else if (supportWallet.includes(PAYMENT_METHOD.link)) {
              setWalletType(PAYMENT_METHOD.link);
            } else {
              console.error(
                JSON.stringify(
                  {
                    message: 'No supported wallet type found',
                    error: res instanceof Error ? { message: res.message, stack: res.stack } : res,
                  },
                  null,
                  2
                )
              );
            }
          }
        }
      );
    }
    return () => {
      subscribed = false;
    };
  }, [paymentRequest]);

  useEffect(() => {
    if (paymentRequest) {
      // onPaymentMethod  receive payment_response as param
      // https://stripe.com/docs/js/appendix/payment_response
      paymentRequest.on('paymentmethod', onPaymentMethod);
    }
    return () => {
      if (paymentRequest) {
        paymentRequest.off('paymentmethod', onPaymentMethod);
      }
    };
  }, [paymentRequest, onPaymentMethod]);

  return walletType ? { paymentRequest, walletType } : {};
};
