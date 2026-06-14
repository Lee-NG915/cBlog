/**
 * https://docs.stripe.com/terminal/references/api/js-sdk#api-methods
 */

export interface StripeError {
  code: string;
  message: string;
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    const rawMessage =
      (error as { message?: unknown; error?: { message?: unknown } }).error?.message ??
      (error as { message?: unknown }).message;
    if (typeof rawMessage === 'string') return rawMessage;
  }
  return '';
};

const isNoActiveAttemptError = (error: unknown) => getErrorMessage(error).includes('there was no active attempt');

export const stripeUtil = {
  /**
   * https://docs.stripe.com/terminal/references/api/js-sdk#get-connection-status
   * @returns boolean
   */
  checkConnectStatus: () => {
    let status = false;
    if (!(window as any).terminal) return status;
    const statusStr = (window as any).terminal.getConnectionStatus();
    console.log('[stripe terminal]connect status::', statusStr);
    status = statusStr === 'connected';
    return status;
  },
  // https://docs.stripe.com/terminal/references/api/js-sdk#cancel-collect-payment-method
  cancelCollectPaymentMethod: () => {
    if (!(window as any).terminal) return false;
    return (window as any).terminal.cancelCollectPaymentMethod();
  },
  //https://docs.stripe.com/terminal/references/api/js-sdk#cancel-collect-setup-intent-payment-method
  cancelCollectSetupIntentPaymentMethod: () => {
    if (!(window as any).terminal) return false;
    return (window as any).terminal.cancelCollectSetupIntentPaymentMethod();
  },
  // https://docs.stripe.com/terminal/references/api/js-sdk#cancel-process-payment
  cancelProcessPayment: () => {
    if (!(window as any).terminal) return false;
    return (window as any).terminal.cancelProcessPayment();
  },
  cancelAnyActivePaymentFlow: async () => {
    if (!(window as any).terminal) return [];
    const terminal = (window as any).terminal;
    const unexpectedErrors: unknown[] = [];
    const cancelActions = [
      () => terminal.cancelCollectPaymentMethod(),
      () => terminal.cancelCollectSetupIntentPaymentMethod(),
      () => terminal.cancelProcessPayment(),
    ];

    for (const cancelAction of cancelActions) {
      try {
        await cancelAction();
      } catch (error) {
        if (!isNoActiveAttemptError(error)) {
          unexpectedErrors.push(error);
        }
      }
    }

    return unexpectedErrors;
  },
};
