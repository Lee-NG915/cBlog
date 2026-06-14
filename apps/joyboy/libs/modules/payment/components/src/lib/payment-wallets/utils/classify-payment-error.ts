import type { IPlaceOrderError } from '@castlery/types';
import { TransactionApiErrorCode } from '@castlery/config';

/**
 * Most categories match keys under `paymentProcessingError` in the error i18n resource.
 * Order-status categories are consumed by payment wallet special modal branches.
 */
export type PaymentErrorCategory =
  | 'orderExpired'
  | 'orderCanceled'
  | 'paymentSuccessOrderCanceled'
  | 'orderAlreadyPaid'
  | 'paymentPending'
  | 'canceledOrExpired'
  | 'clientError'
  | 'serverError'
  | 'integrationError'
  | 'threedsAuthError'
  | 'authorizationError'
  | 'accountSetupError'
  | 'cardDeclinedError'
  | 'invalidDetailsError'
  | 'amountMismatchError'
  | 'securityError'
  | 'bankAccountError'
  | 'chargeError'
  | 'invoiceError'
  | 'regionOrCurrencyError'
  | 'unsupportedMethodError'
  | 'billingAddressError'
  | 'balanceError'
  | 'promotionError'
  | 'tokenSessionError'
  | 'duplicateError'
  | 'refundStatusError'
  | 'transactionNotFoundError'
  | 'paypalError'
  | 'paymentProcessingError'
  | 'genericPaymentError';

/**
 * Synthetic code emitted by the PayPal JS SDK `onError` callback in
 * `paypal-payment-element.tsx`. Together with the BFF code `10703046`
 * (`ErrPayPalShortError`) it routes any PayPal failure to `paypalError`.
 */
export const PAYPAL_SDK_ERROR_CODE = 'PAYPAL_ERROR';

// ─── Order status error codes ────────────────────────────────────────────────
// Numeric codes returned by the backend, stringified via String() in the strategy layer.

const ORDER_EXPIRED_CODES = new Set([String(TransactionApiErrorCode.ErrOrderExpired)]);
const ORDER_CANCELED_CODES = new Set([String(TransactionApiErrorCode.ErrOrderAlreadyCanceled)]);
const PAYMENT_SUCCESS_ORDER_CANCELED_CODES = new Set([
  String(TransactionApiErrorCode.ErrPaymentSuccessButOrderCanceled),
]);

// ─── PayPal-only routing ─────────────────────────────────────────────────────
// BFF wraps PayPal short/long text into 10703046; PayPal JS SDK onError feeds
// the synthetic 'PAYPAL_ERROR' code via paypal-payment-element.tsx. Both share
// the dedicated `paypalError` category and the PRD row 19 modal copy.
// FE intentionally does not enumerate PayPal NVP/SOAP codes
// (https://developer.paypal.com/api/nvp-soap/errors/) — BFF already bucketed them.
const PAYPAL_ERROR_CODES = new Set([String(TransactionApiErrorCode.ErrPayPalShortError), PAYPAL_SDK_ERROR_CODE]);

// ─── PRD Failure Reason row 14: Payment Processing Failures ─────────────────
// These were previously left to fall through to `genericPaymentError`. PRD2
// now wants a dedicated `paymentProcessingError` category with its own copy,
// matched AFTER all provider-specific buckets so a more specific category wins.
// See payment-error-classification-table.md "Payment Processing Codes (PRD Row 14)".
const PAYMENT_PROCESSING_CODES = new Set<string>([
  // Stripe
  'payment_method_provider_timeout',
  'payment_method_unactivated',
  'payment_method_not_available',
  'payment_method_unexpected_state',
  'payment_intent_incompatible_payment_method',
  'payment_method_unsupported_type',
  'payment_intent_konbini_rejected_confirmation_number',
  'payment_intent_mandate_invalid',
  'payment_intent_unexpected_state',
  'payment_intent_payment_attempt_expired',
  'payment_intent_payment_attempt_failed',
  'capture_unauthorized_payment',
  'customer_max_payment_methods',
  'processing_error',
  'status_transition_invalid',
  // 2C2P
  '0999',
  '2002',
  '4006',
  '4020',
  '4021',
  '4022',
  '4023',
  '4024',
  '4025',
  '4026',
  '4027',
  '4028',
  '4029',
  '4030',
  '4031',
  '4037',
  '4039',
  '4040',
  '4042',
  '4060',
  '4068',
  '4069',
  '4079',
  '4086',
  '4087',
  '4088',
  '4089',
  '4090',
  '4091',
  '4092',
  '4093',
  '4095',
  '4096',
  '4097',
  '4099',
  '5998',
  '6012',
  '9035',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentProcessingFailure),
]);

// ─── Stripe decline code groups ─────────────────────────────────────────────
// Reference: https://docs.stripe.com/declines/codes

const CANCELED_OR_EXPIRED_CODES = new Set([
  'user_canceled',
  'auth_expired',
  'payment_intent_canceled',
  'payment_canceled',
  'session_expired',
  'payment_session_expired',
  '0003',
  '4080',
  '5009',
  '5017',
  '5019',
  '9020',
]);

const CARD_DECLINED_CODES = new Set([
  'card_declined',
  'card_decline_rate_limit_exceeded',
  'lost_card',
  'stolen_card',
  'do_not_honor',
  'generic_decline',
  'incorrect_number',
  'invalid_number',
  'invalid_cvc',
  'incorrect_cvc',
  'incorrect_address',
  'incorrect_zip',
  'expired_card',
  'invalid_card_type',
  'invalid_expiry_month',
  'invalid_expiry_year',
  'card_not_supported',
  'card_velocity_exceeded',
  'debit_not_authorized',
  'payment_method_provider_decline',
  'payment_method_customer_decline',
  'transaction_decline',
  'transaction_declined',
  'withdrawal_count_limit_exceeded',
  // Affirm
  'auth-declined',
  'expired-authorization',
  // 2C2P
  '4001',
  '4002',
  '4004',
  '4005',
  '4007',
  '4008',
  '4012',
  '4014',
  '4015',
  '4019',
  '4033',
  '4035',
  '4036',
  '4038',
  '4041',
  '4043',
  '4044',
  '4054',
  '4056',
  '4057',
  '4058',
  '4062',
  '4067',
  '4202',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentAuthorizationCardIssue),
]);

// 3DS authentication failure — has its own popup copy per PRD
const THREEDS_AUTH_CODES = new Set(['payment_intent_authentication_failure']);

const AUTHORIZATION_CODES = new Set([
  'authentication_required',
  'payment_intent_action_required',
  'invoice_payment_intent_requires_action',
  'not_permitted',
  'pickup_card',
  'restricted_card',
  'revocation_of_all_authorizations',
  'revocation_of_authorization',
  'unauthorised',
  // GrabPay
  'user_fail_consent',
  'mfa_not_completed',
  'pending_user_consent',
  // 2C2P
  '0004',
  '4055',
  '4075',
  '4076',
  '4077',
  '4078',
  '4081',
  '5014',
  // Affirm
  'public-api-key-not-specified',
  'api-key-pair-not-specified',
  // PayPal
  '10',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentUserAuthorizationIssue),
]);

const INVALID_DETAILS_CODES = new Set([
  'parameter_invalid_empty',
  'parameter_invalid_integer',
  'parameter_invalid_string_blank',
  'parameter_invalid_string_empty',
  'parameter_missing',
  'parameter_unknown',
  'parameters_exclusive',
  'invalid_characters',
  'forwarding_api_invalid_parameter',
  'invalid_source_usage',
  'invalid_mandate_reference_prefix_format',
  'charge_invalid_parameter',
  'balance_invalid_parameter',
  'payment_intent_invalid_parameter',
  'cardholder_phone_number_required',
  'payment_method_invalid_parameter_testmode',
  'email_invalid',
  'invalid_acr_values',
  'invalid_token',
  'invalid_argument',
  'invalid_scope',
  'invalid_request',
  'validation_error',
  'invalid_field',
  'invalid_json',
  // 2C2P
  '5003',
  '9004',
  '9005',
  '9006',
  '9008',
  '9012',
  '9013',
  '9014',
  '9043',
  '9044',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentInvalidOrMissingParameters),
]);

const BILLING_ADDRESS_CODES = new Set([
  'address_zip_fail',
  'customer_tax_location_invalid',
  'invalid_tax_location',
  'payment_method_billing_details_address_missing',
  'payment_intent_automatic_tax_incomplete',
  'shipping_address_invalid',
  'postal_code_invalid',
  'tax_id_invalid',
  'tax_id_prohibited',
  'taxes_calculation_failed',
  'stripe_tax_inactive',
]);

const AMOUNT_MISMATCH_CODES = new Set([
  'invalid_amount',
  'amount_too_large',
  'amount_too_small',
  'payment_intent_amount_reconfirmation_required',
  'payment_method_microdeposit_verification_amounts_invalid',
  'payment_method_microdeposit_verification_amounts_mismatch',
  'invalid_charge_amount',
  'amount_invalid',
  // Affirm
  'capture-greater-instrument',
  'capture-unequal-instrument',
  'refund-exceeded',
  // 2C2P
  '4013',
  '4064',
  '4070',
  '5006',
  '5015',
  '5016',
  '9009',
  // BFF
  String(TransactionApiErrorCode.ErrOrderPriceChanged),
  String(TransactionApiErrorCode.ErrPaymentAmountIssue),
]);

const BANK_ACCOUNT_CODES = new Set([
  'bank_account_declined',
  'bank_account_unusable',
  'account_closed',
  // Stripe
  'bank_account_bad_routing_numbers',
  'bank_account_exists',
  'bank_account_restricted',
  'bank_account_unverified',
  'bank_account_verification_failed',
  'instant_payouts_limit_exceeded',
  'payment_method_bank_account_already_verified',
  'payment_method_microdeposit_failed',
  'payment_method_microdeposit_verification_attempts_exceeded',
  'payment_method_microdeposit_verification_descriptor_code_mismatch',
  'payment_method_microdeposit_verification_timeout',
  'billing_invalid_mandate',
  'instant_payouts_config_disabled',
  'instant_payouts_unsupported',
  'instant_payouts_currency_disabled',
  'financial_connections_account_inactive',
  'financial_connections_no_successful_transaction_refresh',
  'payment_method_microdeposit_processing_error',
  'payment_method_bank_account_blocked',
  'account_holder_name_verification_failed',
  'payouts_not_allowed',
  // 2C2P
  '4045',
  '4046',
  '4052',
  '4053',
  '4203',
  '4204',
  '4205',
  '4208',
  '4209',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentBankAccountIssue),
]);

const CHARGE_CODES = new Set([
  'charge_exceeds_source_limit',
  'charge_expired_for_capture',
  // Stripe
  'charge_already_captured',
  'intent_invalid_state',
  'capture_charge_authorization_expired',
  'charge_disputed',
  'charge_exceeds_transaction_limit',
  // ZipPay
  'invalid_state',
  'not_found',
  'charge_not_found',
  // Affirm
  'capture-voided',
  'refund-voided',
  'refund-uncaptured',
  'partial-capture-instrument',
  'capture-limit-exceeded',
  // 2C2P
  '2003',
  '4018',
  '4047',
  '4048',
  '4049',
  '4050',
  '4071',
  '4072',
  '4073',
  '4074',
  '4082',
  '4083',
  '4084',
  '4085',
  '4130',
  '4131',
  '4132',
  '4140',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentChargeIssue),
]);

const GEO_OR_CURRENCY_CODES = new Set([
  'country_unsupported',
  'currency_not_supported',
  'payment_method_currency_mismatch',
  // 2C2P
  '5008',
  '9010',
  '9104',
  '9105',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentGeographicCurrencyRestriction),
]);

const UNSUPPORTED_METHOD_CODES = new Set([
  'no_such_payment_method',
  'alipay_upgrade_required',
  'bitcoin_upgrade_required',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentDeprecatedMethodVersion),
]);

const SECURITY_CODES = new Set([
  'fraudulent',
  'security_violation',
  'account_blocked',
  'testmode_charges_only',
  // Stripe
  'application_fees_not_allowed',
  'not_allowed_on_standard_account',
  // GrabPay
  'kyc_check_failed',
  'user_compliance_check_failed',
  'kyc_compliance_decline',
  // 2C2P
  '4059',
  '4061',
  '4063',
  '4065',
  '4066',
  '4098',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentSecurityComplianceRestriction),
]);

const ACCOUNT_SETUP_CODES = new Set([
  'account_country_invalid_address',
  'account_error_country_change_requires_additional_steps',
  'account_information_mismatch',
  'account_invalid',
  'account_number_invalid',
  'ownership_declaration_not_allowed',
  'clearing_code_unsupported',
  'country_code_invalid',
  // ZipPay
  'account_locked',
  'account_unavailable',
  'account_insufficient_funds',
  'exclusive_account',
  // 2C2P
  '4003',
  '5004',
  '5011',
  '5012',
  '5013',
  '9037',
  '9039',
  '9088',
  '9089',
  '9090',
  '9091',
  '9092',
  '9093',
  '9094',
  '9095',
  // Affirm
  'public-api-key-invalid',
  'public-api-key-wrong-environment',
  'public-api-key-inactive',
  'private-api-key-invalid',
  'api-key-pair-wrong-environment',
  'api-key-pair-inactive',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentAccountSetupIssue),
]);

const INVOICE_CODES = new Set([
  'invoice_no_customer_line_items',
  'invoice_no_subscription_line_items',
  'invoice_no_payment_method_types',
  'invoice_not_editable',
  'invoice_on_behalf_of_not_editable',
  'customer_max_subscriptions',
  // Stripe
  'invoice_upcoming_none',
  'out_of_inventory',
  // 2C2P
  '5018',
  '9901',
  '9902',
  '9903',
  '9904',
  '9905',
  '9906',
  '9907',
  '9908',
  '9909',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentSubscriptionInvoiceError),
]);

const BALANCE_CODES = new Set([
  'balance_insufficient',
  'insufficient_funds',
  'insufficient_balance',
  // 2C2P
  '4051',
  '5007',
]);

const PROMOTION_CODES = new Set([
  'coupon_expired',
  // 2C2P
  '9078',
]);

const TOKEN_SESSION_CODES = new Set([
  'token_already_used',
  'token_in_use',
  // 2C2P
  '9040',
  '9041',
]);

const DUPLICATE_CODES = new Set([
  'idempotency_key_in_use',
  'resource_already_exists',
  'duplicate_transaction',
  // 2C2P
  '9015',
  '4094',
  '5005',
]);

const REFUND_STATUS_CODES = new Set([
  'charge_already_refunded',
  'charge_not_refundable',
  'return_intent_already_processed',
  // Affirm
  'refund-expired',
  // 2C2P
  '4034',
  '4120',
  '4121',
  '4122',
]);

const TRANSACTION_NOT_FOUND_CODES = new Set(['transaction_not_found', 'not-found', 'resource_missing']);

// ─── Server Action error codes ───────────────────────────────────────────────
// Codes returned by initiatePaymentAction / capturePaymentAction.
// These must map to serverError so the user sees a recoverable error message.
// Reference: payment-refactoring-design.md § 5.2 ErrorCode 映射规范

const SERVER_ACTION_ERROR_CODES = new Set([
  'INTERNAL_ERROR',
  'INITIATE_FAILED',
  'CAPTURE_FAILED',
  'PROCESS_PAYMENT_FAILED',
  '5002',
  '9990',
  '9991',
  '9992',
  '9993',
  '9994',
  '9995',
  '9996',
  '9997',
  '9998',
  '9999',
  // BFF
  String(TransactionApiErrorCode.ErrStripeHttp5xx),
]);

const CLIENT_ACTION_ERROR_CODES = new Set([
  'invalid_payload',
  'INVALID_PAYLOAD',
  // BFF
  String(TransactionApiErrorCode.ErrStripeHttp4xx),
]);

const INTEGRATION_ERROR_CODES = new Set([
  'api_key_expired',
  'forwarding_api_inactive',
  'forwarding_api_upstream_connection_error',
  'forwarding_api_upstream_connection_timeout',
  'payment_method_configuration_failures',
  'payment_method_invalid_parameter',
  'lock_timeout',
  'missing',
  'no_account',
  'rate_limit',
  'err_capture_failed',
  'server_error',
  'client_error',
  'confirm_failed',
  'unknown',
  // 2C2P
  '6101',
  '6102',
  '6103',
  '6104',
  '6105',
  '6106',
  '6107',
  '6108',
  '6109',
  '6110',
  '7012',
  '4201',
  '9007',
  '9016',
  '9017',
  '9038',
  '9042',
  '9057',
  '9058',
  '9059',
  '9060',
  '9080',
  '9100',
  '9101',
  '9102',
  '9103',
  '9106',
  '9107',
  '9108',
  '9109',
  '9110',
  '9202',
  '9900',
  // Afterpay
  'unauthorized',
  'method_not_allowed',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentApiIntegration),
]);

const PENDING_PAYMENT_CODES = new Set([
  'processing',
  'authorising',
  'capturing',
  'pending_capture',
  'PENDING',
  '0001',
  '2001',
  '4000',
  '4009',
  '4010',
  '4011',
  '4016',
  '4032',
  '4110',
  // BFF
  String(TransactionApiErrorCode.ErrPaymentProcessingTimeout),
]);

/**
 * Classifies a payment error into a category key that maps to
 * either `paymentProcessingError.<category>` or a payment wallet special modal.
 *
 * Classification priority (highest → lowest):
 *   1. Order status errors (orderExpired, orderCanceled) — non-retryable, special modal
 *   2. `payment_already_paid` — non-retryable
 *   3. PayPal entry codes (BFF `10703046` + PayPal JS SDK `PAYPAL_ERROR`)
 *   4. Pending / canceled-or-expired semantic codes
 *   5. Server/Client Action error codes
 *   6. HTTP status code range (4xx / 5xx) from backend API
 *   7. Provider-specific categories (integration, decline, billing address, etc.)
 *   8. PRD row 14 payment-processing failure codes -> `paymentProcessingError`
 *   9. Fallback: `genericPaymentError`
 */
export function classifyPaymentError(error: Partial<IPlaceOrderError>): PaymentErrorCategory {
  const code = error.failureCode ?? '';
  const { httpStatus } = error;

  // ── 1. Order status errors (highest priority, non-retryable) ────────────
  if (ORDER_EXPIRED_CODES.has(code)) return 'orderExpired';
  if (ORDER_CANCELED_CODES.has(code)) return 'orderCanceled';
  if (PAYMENT_SUCCESS_ORDER_CANCELED_CODES.has(code)) return 'paymentSuccessOrderCanceled';

  // ── 2. Order already paid (non-retryable) ───────────────────────────────
  if (code === 'payment_already_paid') return 'orderAlreadyPaid';

  // ── 3. PayPal-specific short-circuit (BFF + JS SDK) ─────────────────────
  // Runs before paymentPending / cancellation buckets so a PayPal failure
  // that incidentally collides with a numeric subcode still surfaces PRD
  // row 19 copy.
  if (PAYPAL_ERROR_CODES.has(code)) return 'paypalError';

  // ── 4. Async payment still processing ───────────────────────────────────
  if (PENDING_PAYMENT_CODES.has(code)) return 'paymentPending';

  // ── 5. User canceled or session expired ─────────────────────────────────
  if (CANCELED_OR_EXPIRED_CODES.has(code)) return 'canceledOrExpired';

  // ── 6. Server Action error codes (from initiatePaymentAction / capturePaymentAction)
  if (SERVER_ACTION_ERROR_CODES.has(code)) return 'serverError';
  if (CLIENT_ACTION_ERROR_CODES.has(code)) return 'clientError';

  // ── 7. HTTP status-based classification (backend API errors) ────────────
  if (httpStatus !== undefined) {
    if (httpStatus >= 400 && httpStatus < 500) return 'clientError';
    if (httpStatus >= 500) return 'serverError';
  }

  // ── 8. Provider-specific code groups ────────────────────────────────────
  if (INTEGRATION_ERROR_CODES.has(code)) return 'integrationError';
  if (THREEDS_AUTH_CODES.has(code)) return 'threedsAuthError';
  if (BALANCE_CODES.has(code)) return 'balanceError';
  if (PROMOTION_CODES.has(code)) return 'promotionError';
  if (TOKEN_SESSION_CODES.has(code)) return 'tokenSessionError';
  if (DUPLICATE_CODES.has(code)) return 'duplicateError';
  if (REFUND_STATUS_CODES.has(code)) return 'refundStatusError';
  if (TRANSACTION_NOT_FOUND_CODES.has(code)) return 'transactionNotFoundError';
  if (CARD_DECLINED_CODES.has(code)) return 'cardDeclinedError';
  if (AUTHORIZATION_CODES.has(code)) return 'authorizationError';
  if (BILLING_ADDRESS_CODES.has(code)) return 'billingAddressError';
  if (INVALID_DETAILS_CODES.has(code)) return 'invalidDetailsError';
  if (AMOUNT_MISMATCH_CODES.has(code)) return 'amountMismatchError';
  if (BANK_ACCOUNT_CODES.has(code)) return 'bankAccountError';
  if (CHARGE_CODES.has(code)) return 'chargeError';
  if (GEO_OR_CURRENCY_CODES.has(code)) return 'regionOrCurrencyError';
  if (UNSUPPORTED_METHOD_CODES.has(code)) return 'unsupportedMethodError';
  if (SECURITY_CODES.has(code)) return 'securityError';
  if (ACCOUNT_SETUP_CODES.has(code)) return 'accountSetupError';
  if (INVOICE_CODES.has(code)) return 'invoiceError';

  // ── 9. PRD row 14 dedicated bucket (after provider-specific) ────────────
  if (PAYMENT_PROCESSING_CODES.has(code)) return 'paymentProcessingError';

  // ── 10. Last-resort fallback ─────────────────────────────────────────────
  return 'genericPaymentError';
}
