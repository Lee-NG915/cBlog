export const ErrorTranslatePrefix = {
  SYSTEM_INTERNAL_ERROR: 'globalError',
  TRANSACTION_API_ERROR: 'transactionApiError',
  FAILED_TO_FETCH_ERROR: 'failedToFetchError',
} as const;

type ApiErrorModal = {
  warning: (config: Record<string, unknown>) => unknown;
};

type SystemInternalErrorParams = {
  code: string;
  numberCode: number;
  message: string;
};

type TransactionErrorParams = {
  code: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  beforeClose?: () => void;
  itemsList?: unknown[];
  customConfirmTextTslKey?: string;
};

export function createApiErrorPresenter(apiModal: ApiErrorModal) {
  return {
    showFetchError(): void {
      apiModal.warning({
        code: '',
        translatePrefix: ErrorTranslatePrefix.FAILED_TO_FETCH_ERROR,
        isSystemInternalError: true,
      });
    },

    showSystemInternalError({ code, numberCode, message }: SystemInternalErrorParams): void {
      apiModal.warning({
        code,
        translatePrefix: ErrorTranslatePrefix.SYSTEM_INTERNAL_ERROR,
        isSystemInternalError: true,
        fallbackMessage: `[${numberCode}] - ${message}`,
      });
    },

    showTransactionError({
      code,
      message,
      onConfirm,
      onCancel,
      beforeClose,
      itemsList,
      customConfirmTextTslKey,
    }: TransactionErrorParams): void {
      apiModal.warning({
        code,
        translatePrefix: ErrorTranslatePrefix.TRANSACTION_API_ERROR,
        fallbackMessage: message,
        ...(customConfirmTextTslKey ? { customConfirmTextTslKey } : {}),
        ...(Array.isArray(itemsList) && itemsList.length > 0 ? { itemsList } : {}),
        ...(onConfirm ? { onConfirm } : {}),
        ...(onCancel ? { onCancel } : {}),
        ...(beforeClose ? { beforeClose } : {}),
      });
    },
  };
}
