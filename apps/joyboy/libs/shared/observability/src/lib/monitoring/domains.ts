/**
 * 业务域定义（统一命名）
 *
 * 用于：
 * - 自动设置错误优先级
 * - 统一的业务域命名规范
 */
export const BUSINESS_DOMAIN = {
  USER: 'user',
  ORDER: 'order',
  PAYMENT: 'payment',
  CART: 'cart',
  PRODUCT: 'product',
  SEARCH: 'search',
  CHECKOUT: 'checkout',
  CMS: 'cms',
  PROMOTION: 'promotion',
  /** Casa / GenAI customer service. Host Sentry drops Casa SDK errors; SDK reports to its own project. */
  CASA: 'casa',
} as const;

export type BusinessDomain = (typeof BUSINESS_DOMAIN)[keyof typeof BUSINESS_DOMAIN];
