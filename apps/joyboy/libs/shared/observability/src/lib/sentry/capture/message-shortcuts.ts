import { captureStructuredMessage } from './capture-message';
import { BUSINESS_DOMAIN } from '../../monitoring/domains';
import type { BusinessDomain } from '../../monitoring/domains';
import type { EcommerceContext } from '../../monitoring/types';
import type { BusinessSeverityLevel } from '../../monitoring/priorities';

// ============================================================================
// 便捷函数（业务域消息捕获）
// ============================================================================

/**
 * 为特定业务域创建快捷消息捕获函数
 *
 * @example
 * ```typescript
 * const sendPaymentMessage = createDomainMessageCapture(BUSINESS_DOMAIN.PAYMENT);
 *
 * sendPaymentMessage('Refund webhook received unexpected status', {
 *   severity: BusinessSeverity.MEDIUM,
 *   extra: { orderId: '123', webhookStatus: 'unknown' },
 * });
 * ```
 */
export function createDomainMessageCapture(domain: BusinessDomain) {
  return (
    message: string,
    options?: {
      domain?: BusinessDomain;
      extra?: EcommerceContext | Record<string, any>;
      skipSentry?: boolean;
      severity?: BusinessSeverityLevel;
    }
  ) => {
    captureStructuredMessage(message, {
      domain: options?.domain || domain,
      extra: options?.extra,
      skipSentry: options?.skipSentry,
      severity: options?.severity,
    });
  };
}

/**
 * 发送支付相关消息
 *
 * @example
 * ```typescript
 * sendPaymentMessage('Payment callback status: pending', {
 *   severity: BusinessSeverity.MEDIUM,
 *   extra: { orderId: '123', transactionId: 'txn_abc' },
 * });
 * ```
 */
export const sendPaymentMessage = createDomainMessageCapture(BUSINESS_DOMAIN.PAYMENT);

/**
 * 发送订单相关消息
 *
 * @example
 * ```typescript
 * sendOrderMessage('Order status transition: confirmed -> shipped', {
 *   severity: BusinessSeverity.LOW,
 *   extra: { orderId: '123', previousStatus: 'confirmed' },
 * });
 * ```
 */
export const sendOrderMessage = createDomainMessageCapture(BUSINESS_DOMAIN.ORDER);

/**
 * 发送购物车相关消息
 *
 * @example
 * ```typescript
 * sendCartMessage('Cart total exceeds threshold', {
 *   severity: BusinessSeverity.MEDIUM,
 *   extra: { cartTotal: 99999, threshold: 50000 },
 * });
 * ```
 */
export const sendCartMessage = createDomainMessageCapture(BUSINESS_DOMAIN.CART);

/**
 * 发送产品相关消息
 *
 * @example
 * ```typescript
 * sendProductMessage('Product price mismatch detected', {
 *   severity: BusinessSeverity.MEDIUM,
 *   extra: { productId: '789', cachedPrice: 99.99, livePrice: 109.99 },
 * });
 * ```
 */
export const sendProductMessage = createDomainMessageCapture(BUSINESS_DOMAIN.PRODUCT);

/**
 * 发送用户相关消息
 *
 * @example
 * ```typescript
 * sendUserMessage('User session nearing expiry', {
 *   severity: BusinessSeverity.LOW,
 *   extra: { userId: 'user_123', expiresIn: '5m' },
 * });
 * ```
 */
export const sendUserMessage = createDomainMessageCapture(BUSINESS_DOMAIN.USER);

/**
 * 发送结账相关消息
 *
 * @example
 * ```typescript
 * sendCheckoutMessage('Shipping estimation fallback to default', {
 *   severity: BusinessSeverity.MEDIUM,
 *   extra: { reason: 'API timeout', fallbackDays: 7 },
 * });
 * ```
 */
export const sendCheckoutMessage = createDomainMessageCapture(BUSINESS_DOMAIN.CHECKOUT);
