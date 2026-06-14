import { captureStructuredError } from './capture-error';
import { BUSINESS_DOMAIN } from '../../monitoring/domains';
import type { BusinessDomain } from '../../monitoring/domains';
import type { EcommerceContext } from '../../monitoring/types';
import type { BusinessSeverityLevel } from '../../monitoring/priorities';
import { isUserInputError, isExpectedBusinessError } from '../errors/error-utils';

// ============================================================================
// 便捷函数（电商特定场景）
// ============================================================================

/**
 * 为特定业务域创建快捷错误捕获函数
 *
 * @example
 * ```typescript
 * const capturePaymentError = createDomainErrorCapture(BUSINESS_DOMAIN.PAYMENT);
 *
 * // 使用 EcommerceContext 获得智能提示
 * capturePaymentError(error, {
 *   domain: 'stripe_checkout',
 *   extra: {
 *     orderId: '123',
 *     paymentMethod: 'credit_card',
 *     paymentAmount: 99.99,
 *   }
 * });
 * ```
 */
export function createDomainErrorCapture(domain: BusinessDomain) {
  return (
    error: any,
    options?: {
      domain?: BusinessDomain;
      extra?: EcommerceContext | Record<string, any>;
      skipSentry?: boolean;
      severity?: BusinessSeverityLevel;
    }
  ) => {
    captureStructuredError(error, {
      domain: options?.domain || domain,
      extra: options?.extra,
      skipSentry: options?.skipSentry,
      severity: options?.severity,
    });
  };
}

/**
 * 捕获支付相关错误
 *
 * @example
 * ```typescript
 * capturePaymentError(error, {
 *   domain: 'stripe_checkout',
 *   extra: {
 *     orderId: '123',
 *     paymentMethod: 'credit_card',
 *     paymentAmount: 99.99,
 *     transactionId: 'txn_abc',
 *   }
 * });
 * ```
 */
export const capturePaymentError = createDomainErrorCapture(BUSINESS_DOMAIN.PAYMENT);

/**
 * 捕获订单相关错误
 *
 * @example
 * ```typescript
 * captureOrderError(error, {
 *   domain: 'create_order',
 *   extra: {
 *     orderId: '123',
 *     orderTotal: 299.99,
 *     orderStatus: 'pending',
 *   }
 * });
 * ```
 */
export const captureOrderError = createDomainErrorCapture(BUSINESS_DOMAIN.ORDER);

/**
 * 捕获购物车相关错误
 *
 * @example
 * ```typescript
 * // domain 参数是可选的，默认使用 BUSINESS_DOMAIN.CART
 * captureCartError(error, {
 *   extra: {
 *     productId: '456',
 *     quantity: 2,
 *     cartTotal: 199.99,
 *   }
 * });
 * ```
 */
export const captureCartError = createDomainErrorCapture(BUSINESS_DOMAIN.CART);

/**
 * 捕获产品相关错误
 *
 * @example
 * ```typescript
 * // domain 参数是可选的，默认使用 BUSINESS_DOMAIN.PRODUCT
 * captureProductError(error, {
 *   extra: {
 *     productId: '789',
 *     productSku: 'SKU-123',
 *     productName: 'Owen Sofa',
 *   }
 * });
 * ```
 */
export const captureProductError = createDomainErrorCapture(BUSINESS_DOMAIN.PRODUCT);

/**
 * 捕获用户相关错误
 *
 * @example
 * ```typescript
 * captureUserError(error, {
 *   domain: 'login',
 *   extra: {
 *     userId: 'user_123',
 *     userEmail: 'user@example.com',
 *   }
 * });
 * ```
 */
export const captureUserError = createDomainErrorCapture(BUSINESS_DOMAIN.USER);

/**
 * 捕获结账相关错误
 *
 * @example
 * ```typescript
 * captureCheckoutError(error, {
 *   domain: 'checkout_submit',
 *   extra: {
 *     cartTotal: 399.99,
 *     itemCount: 3,
 *   }
 * });
 * ```
 */
export const captureCheckoutError = createDomainErrorCapture(BUSINESS_DOMAIN.CHECKOUT);

// Re-export error utils for convenience
export { isUserInputError, isExpectedBusinessError };
