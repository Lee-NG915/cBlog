export const TransactionDomain = {
  CHECKOUT: 'checkout',
  PAYMENT: 'payment',
} as const;

export const TransactionResult = {
  STARTED: 'started',
  SUCCESS: 'success',
  FAILURE: 'failure',
  TIMEOUT: 'timeout',
  CANCELED: 'canceled',
  PROCESSING: 'processing',
  RETRYING: 'retrying',
} as const;

export const TransactionActionType = {
  SDK_CONFIRM: 'SDK_CONFIRM',
  REDIRECT: 'REDIRECT',
  SDK_POPUP: 'SDK_POPUP',
  SUCCESS: 'SUCCESS',
} as const;

export const TransactionErrorCategory = {
  SYSTEM_ERROR: 'system_error',
  PROVIDER_ERROR: 'provider_error',
  NETWORK_ERROR: 'network_error',
  VALIDATION_ERROR: 'validation_error',
  BUSINESS_RULE_ERROR: 'business_rule_error',
  TIMEOUT_ERROR: 'timeout_error',
  USER_ABORT: 'user_abort',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

export type TransactionDomainType = (typeof TransactionDomain)[keyof typeof TransactionDomain];
export type TransactionResultType = (typeof TransactionResult)[keyof typeof TransactionResult];
export type TransactionActionTypeValue = (typeof TransactionActionType)[keyof typeof TransactionActionType];
export type TransactionErrorCategoryType = (typeof TransactionErrorCategory)[keyof typeof TransactionErrorCategory];

export type TransactionStep =
  | 'checkout_init'
  | 'checkout_info_fetch'
  | 'address_validate'
  | 'inventory_reserve'
  | 'promotion_apply'
  | 'create_order'
  | 'payment_method_select'
  | 'payment_initiate'
  | 'payment_sdk_ready'
  | 'payment_sdk_confirm'
  | 'payment_redirect'
  | 'payment_popup'
  | 'payment_callback_receive'
  | 'payment_capture'
  | 'payment_result_render';

export interface TransactionObservabilityContext {
  domain: TransactionDomainType;
  step: TransactionStep;
  result?: TransactionResultType;
  traceId?: string;
  attemptId?: string;
  orderId?: string;
  orderNumber?: string;
  paymentId?: string;
  provider?: string;
  region?: string;
  locale?: string;
  channel?: string;
  env?: string;
  service?: string;
  version?: string;
  release?: string;
  cartId?: string;
  checkoutTokenHash?: string;
  paymentAmount?: number | string;
  currency?: string;
  paymentMethodKey?: string;
  actionType?: TransactionActionTypeValue;
  retryCount?: number;
  isRetry?: boolean;
  is3DS?: boolean;
  isRedirectFlow?: boolean;
  isFallbackFlow?: boolean;
  errorCode?: string;
  errorCategory?: TransactionErrorCategoryType | string;
  errorMessage?: string;
  httpStatus?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TransactionEventOptions {
  message?: string;
  fingerprint?: string[];
  skipSentry?: boolean;
}
