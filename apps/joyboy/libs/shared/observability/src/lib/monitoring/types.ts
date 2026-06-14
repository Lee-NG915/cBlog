import type { BusinessSeverityLevel, BusinessPriorityLevel } from './priorities';
import type { BusinessDomain } from './domains';
import type { PageType } from './page-types';

/**
 * 电商常用的业务上下文字段（类型提示用）
 *
 * 用于 extra 字段，提供电商场景的智能提示
 */
export interface EcommerceContext {
  /** 订单相关 */
  orderId?: string;
  orderStatus?: string;
  orderTotal?: number;

  /** 商品相关 */
  productId?: string;
  productSku?: string;
  productName?: string;
  productPrice?: number;
  quantity?: number;

  /** 购物车相关 */
  cartId?: string;
  cartTotal?: number;
  itemCount?: number;

  /** 支付相关 */
  paymentMethod?: string;
  paymentAmount?: number;
  transactionId?: string;

  /** 用户相关 */
  userId?: string;
  userEmail?: string;

  /** API 相关 */
  apiStatus?: number;
  errorMessage?: string;

  /** 其他自定义字段 */
  [key: string]: any;
}

/**
 * 业务监控上下文配置接口（统一）
 *
 * 平台无关的监控上下文，当前通过 Sentry 适配器上报。
 */
export interface MonitoringContext {
  /**
   * 业务域（使用 BUSINESS_DOMAIN 常量）
   * 例如: BUSINESS_DOMAIN.CART, BUSINESS_DOMAIN.PAYMENT, BUSINESS_DOMAIN.PRODUCT, BUSINESS_DOMAIN.USER
   * 用于 Issue 路由到团队和优先级推断
   */
  domain?: BusinessDomain;

  /** 页面类型（如 cart、checkout、pdp） */
  pageType?: PageType;

  /** 优先级（使用 BusinessPriority 常量，可自动推断）*/
  priority?: BusinessPriorityLevel;

  /** 业务严重度（使用 BusinessSeverity 常量，可自动推断）*/
  severity?: BusinessSeverityLevel;

  /** 用户 ID */
  userId?: string;

  /** 国家/地区代码 */
  country?: string;

  /** 是否跳过上报（仅打日志）*/
  skipSentry?: boolean;

  /**
   * 错误分组指纹（用于将相同业务场景的错误分组）
   * 如果不指定，将根据 domain 自动生成
   * @example [BUSINESS_DOMAIN.CART]
   */
  fingerprint?: string[];

  /**
   * 自定义 Sentry 标签（有索引，可在 Sentry UI / 告警规则中过滤）。
   *
   * **与 `extra` 的区别**：
   * - `tags` — 写入 `scope.setTags`，在 Sentry 中**可搜索、可过滤**，告警规则可以用 `tag:value` 匹配
   * - `extra` — 写入 `scope.setExtras`，**仅供调试**，不可检索，不影响告警路由
   *
   * **迁移指引**：从 `Sentry.captureException(e, { tags, extra })` 迁移时，
   * 两个字段必须分别保留，不能合并进 `extra`，否则告警规则过滤会静默失效。
   *
   * @example
   * ```typescript
   * // 原写法
   * Sentry.captureException(e, {
   *   tags: { errorType: status, productSku: sku },
   *   extra: { variantCode, queryStr },
   * });
   *
   * // 迁移后
   * captureStructuredError(e, {
   *   tags: { errorType: status, productSku: sku },   // ← 保留在 tags
   *   extra: { variantCode, queryStr },               // ← 保留在 extra
   * });
   * ```
   */
  tags?: Record<string, string>;

  /**
   * 额外上下文数据（调试用，自动过滤 PII，不可在 Sentry 中检索）。
   *
   * 电商场景推荐使用 EcommerceContext 获得智能提示。
   * 如果原始 `Sentry.captureException` 调用有 `tags` 字段，请勿将其合并至此处。
   *
   * @example
   * ```typescript
   * extra: {
   *   orderId: '123',
   *   productId: '456',
   *   quantity: 2,
   * } as EcommerceContext
   * ```
   */
  extra?: Record<string, any> | EcommerceContext;
}
