import { EC_COUNTRIES_ENUM, EcEnv } from '@castlery/config';
import { Bcp47Locales, fallbackLocale, supportLanguages, supportLocales } from '@castlery/monorepo-i18n';

/**
 * The locales supported by the region
 * @default `REGIONAL_SUPPORTED_LOCALES[region][0]` is the regional default locale
 * @example ca:['en-CA','fr-CA'] => The default locale is 'en-CA' in ca market
 */
export const REGIONAL_SUPPORTED_LOCALES = {
  // 为什么必须维护REGIONAL_SUPPORTED_LOCALES？
  // 因为开启acceptLanguageHeader后，CA的用户可能会检测到en-US为首选语言，但en-US的translation中，是针对US市场维护的翻译，可能会出现 Castlery US 等信息，不符合实际使用
  [EC_COUNTRIES_ENUM.Enum.SG]: [Bcp47Locales.EN_SG],
  [EC_COUNTRIES_ENUM.Enum.US]: [Bcp47Locales.EN_US],
  [EC_COUNTRIES_ENUM.Enum.AU]: [Bcp47Locales.EN_AU],
  [EC_COUNTRIES_ENUM.Enum.CA]: [Bcp47Locales.EN_CA],
  [EC_COUNTRIES_ENUM.Enum.UK]: [Bcp47Locales.EN_GB],
};

// Use project's existing navigation configuration
export const SUPPORTED_REGIONS = EcEnv.NEXT_PUBLIC_ACCESS_COUNTRY.map((country) => country.toLowerCase());
export const SUPPORTED_LANGUAGES = supportLanguages;
export const SUPPORTED_LOCALES = supportLocales;

// Default values aligned with project defaults
export const DEFAULT_REGION = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase() as keyof typeof EC_COUNTRIES_ENUM;

export const DEFAULT_LOCALE = fallbackLocale;

export const WEB_SERVER_NAME = EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME;

// === 项目路由表 ===
// 维护项目中实际存在的路由模式，供各个中间件复用

/**
 * 项目中的主要路由模式
 * 基于实际业务需求维护，避免重复定义
 */
export const ROUTE_PATTERNS = {
  // 首页
  HOME: '/home',

  // 产品相关页面
  PRODUCT: '/products', // 产品详情页
  PLA: '/pla', // 产品落地页

  // 内容页面
  BLOG: '/blog', // 博客页面

  // 用户相关
  ACCOUNT: '/account', // 用户账户
  LOGIN: '/login', // 登录
  REGISTER: '/register', // 注册

  // 购物流程
  CART: '/cart', // 购物车
  CHECKOUT: '/checkout', // 结账流程

  // 功能页面
  SEARCH: '/search', // 搜索页面

  COLLECTION: '/collection',

  // 心愿单
  WISHLIST: '/wishlist',

  // T&C
  // 销售和退款
  SALESANDREFUNDS: '/sales-and-refunds',
  // 推广条款
  PROMOTERMS: '/promo-terms',
  // 保修条款
  WARRANTY: EcEnv.NEXT_PUBLIC_COUNTRY === 'UK' ? '/guarantee' : '/warranty',
  // 使用条款
  TERMSOFUSE: '/terms-of-use',
  // 配送条款
  DELIVERY: '/delivery',
  // 隐私政策
  PRIVACYPOLICY: '/privacy-policy',
  // 无障碍政策
  ACCESSIBILITY: '/accessibility',
} as const;

/**
 * PLP/CLP 中间件应该跳过的路由模式
 * 如果路径匹配这些模式，就不运行 PLP/CLP 中间件
 */
export const SKIP_FOR_PLP_CLP = [
  ROUTE_PATTERNS.PRODUCT,
  ROUTE_PATTERNS.PLA,
  ROUTE_PATTERNS.BLOG,
  ROUTE_PATTERNS.ACCOUNT,
  ROUTE_PATTERNS.LOGIN,
  ROUTE_PATTERNS.REGISTER,
  ROUTE_PATTERNS.CART,
  ROUTE_PATTERNS.CHECKOUT,
  ROUTE_PATTERNS.SEARCH,
  ROUTE_PATTERNS.COLLECTION,
  ROUTE_PATTERNS.WISHLIST,
] as const;
