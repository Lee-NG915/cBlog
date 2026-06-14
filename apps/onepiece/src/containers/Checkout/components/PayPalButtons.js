import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from '@paypal/paypal-js';
import { captureException } from 'utils/sentry.client.config';
import style from '../style.scss';

/**
 * PayPalButtons handles PayPal JS SDK loading and button rendering.
 * Business logic callbacks (createOrder, onApprove, onCancel) are provided by the parent.
 * @doc https://developer.paypal.com/sdk/js/configuration/#add-the-sdk
 */
const PayPalButtons = ({ order, checked, onLoading, onError, openModal, createOrder, onApprove, onCancel }) => {
  const containerRef = useRef(null);
  const messageContainerRef = useRef(null);
  // Use a ref so PayPal button closures always read the latest `checked` value
  const checkedRef = useRef(checked);
  // Use a ref so callbacks can read the latest order.number without causing re-renders
  const orderNumberRef = useRef(order.number);
  const onLoadingRef = useRef(onLoading);
  const onErrorRef = useRef(onError);
  const openModalRef = useRef(openModal);
  const createOrderRef = useRef(createOrder);
  const onApproveRef = useRef(onApprove);
  const onCancelRef = useRef(onCancel);
  // Guard against re-rendering the PayPal iframe during an active transaction
  const isTransactingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    checkedRef.current = checked;
  }, [checked]);

  useEffect(() => {
    orderNumberRef.current = order.number;
  }, [order.number]);

  useEffect(() => {
    onLoadingRef.current = onLoading;
    onErrorRef.current = onError;
    openModalRef.current = openModal;
    createOrderRef.current = createOrder;
    onApproveRef.current = onApprove;
    onCancelRef.current = onCancel;
  }, [createOrder, onApprove, onCancel, onError, onLoading, openModal]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const reportError = useCallback((error, parameters = {}) => {
    const normalizedError = error instanceof Error ? error : new Error(String(error || 'Unknown PayPal error'));
    captureException(normalizedError, {
      orderNumber: orderNumberRef.current,
      parameters,
    });
  }, []);

  const notifyError = useCallback((error, fallbackMessage = 'Something went wrong with PayPal. Please try again.') => {
    const message = error?.message || String(error || fallbackMessage);
    onErrorRef.current(message || fallbackMessage);
  }, []);

  const renderButtons = useCallback(() => {
    if (!containerRef.current || !window.paypal?.Buttons || isTransactingRef.current) return;
    containerRef.current.innerHTML = '';

    const fundingSources = [window.paypal.FUNDING.PAYPAL];

    fundingSources.forEach((fundingSource) => {
      const button = window.paypal.Buttons({
        fundingSource,
        dataPageType: 'checkout',
        style: {
          layout: 'vertical',
          height: 55,
        },
        onClick: (data, actions) => {
          if (!checkedRef.current) {
            openModalRef.current({
              status: 'failed',
              title: 'Oops',
              body: 'Please accept terms and conditions before placing order.',
            });
            return actions.reject();
          }
          isTransactingRef.current = true;
          return actions.resolve();
        },
        createOrder: (...args) => createOrderRef.current(...args),
        onApprove: (data, actions) =>
          Promise.resolve(onApproveRef.current(data, actions)).finally(() => {
            isTransactingRef.current = false;
          }),
        onCancel: (data) => {
          isTransactingRef.current = false;
          return onCancelRef.current(data);
        },
        onError: (error) => {
          isTransactingRef.current = false;
          reportError(error, {
            fundingSource,
            position: 'paypal_buttons',
          });
          notifyError(error);
        },
      });

      if (button.isEligible()) {
        button.render(containerRef.current).catch((error) => {
          reportError(error, {
            fundingSource,
            position: 'paypal_button_render',
          });
          notifyError(error);
        });
      } else {
        reportError(new Error(`${fundingSource} is not eligible`), {
          fundingSource,
          position: 'paypal_button_eligibility',
        });
      }
    });
  }, [notifyError, reportError]);

  const renderMessages = useCallback(() => {
    if (!messageContainerRef.current || !window.paypal?.Messages) return;
    messageContainerRef.current.innerHTML = '';
    const amount = Number(order.total);
    if (!(amount > 0)) return;
    window.paypal
      .Messages({
        amount,
        currency: order.currency,
        placement: 'payment',
        style: {
          layout: 'text',
          logo: { type: 'inline' },
          text: { color: 'black', align: 'center', size: 12 },
        },
      })
      .render(messageContainerRef.current)
      .catch((error) => {
        reportError(error, {
          fundingSource: 'messages',
          position: 'paypal_message',
        });
      });
  }, [order.currency, order.total, reportError]);

  useEffect(() => {
    onLoadingRef.current(true);
    loadScript({
      'client-id': __PAYPAL_CLIENT_ID__,
      currency: order.currency,
      components: 'buttons,messages',
    })
      .then(() => {
        if (!isMountedRef.current) return;
        onLoadingRef.current(false);
        renderButtons();
        renderMessages();
      })
      .catch((error) => {
        if (!isMountedRef.current) return;
        onLoadingRef.current(false);
        reportError(error, {
          fundingSource: 'buttons',
          position: 'load_paypal_script',
        });
        notifyError(error, 'PayPal is temporarily unavailable. Please try again.');
      });
  }, [notifyError, order.currency, renderButtons, renderMessages, reportError]);

  // Re-render messages when order total changes (e.g. cart updated)
  useEffect(() => {
    if (window.paypal?.Messages && messageContainerRef.current) {
      renderMessages();
    }
  }, [renderMessages]);

  return (
    <div className={style.paypalButtonsContainer}>
      <div ref={containerRef} className={`${style.paypalButtonsContainer}__paypalButtons`} />
      <div ref={messageContainerRef} className={`${style.paypalButtonsContainer}__paypalMessage`} />
    </div>
  );
};

PayPalButtons.propTypes = {
  order: PropTypes.shape({
    number: PropTypes.string,
    currency: PropTypes.string,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  checked: PropTypes.bool.isRequired,
  onLoading: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  createOrder: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PayPalButtons;
