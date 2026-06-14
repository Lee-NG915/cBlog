/**
 * 标准化页面类型常量
 *
 * 用于错误边界中手动指定页面类型，避免拼写错误
 * 每个 Route Group 的 error.tsx 应该使用这些常量
 */
export const PAGE_TYPES = {
  /** 商品详情页 (Product Detail Page) */
  PDP: 'pdp',
  /** 购物车页 */
  CART: 'cart',
  /** 结账页 */
  CHECKOUT: 'checkout',
  /** 账户页 */
  ACCOUNT: 'account',
  /** 商品列表页 (Product Listing Page) */
  PLP: 'plp',
  /** 首页 */
  HOME: 'home',
  /** CMS 动态路由页面 */
  CMS: 'cms',
  /** 博客页 */
  BLOG: 'blog',
  /** 其他页面 */
  OTHER: 'other',
} as const;

/**
 * 页面类型的 TypeScript 类型
 */
export type PageType = (typeof PAGE_TYPES)[keyof typeof PAGE_TYPES];
