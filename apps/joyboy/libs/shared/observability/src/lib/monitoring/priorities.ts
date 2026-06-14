import type { SeverityLevel as SentrySeverityLevel } from '@sentry/nextjs';
import { BUSINESS_DOMAIN, BusinessDomain } from './domains';
import { PAGE_TYPES } from './page-types';

/**
 * 业务严重度（统一业务抽象，与 Sentry 原生类型解耦）
 *
 * 对应关系：
 * - CRITICAL → Sentry level: fatal   → Sentry Issue Priority: High
 * - HIGH     → Sentry level: error   → Sentry Issue Priority: High
 * - MEDIUM   → Sentry level: warning → Sentry Issue Priority: Medium
 * - LOW      → Sentry level: log     → Sentry Issue Priority: Low
 */
export const BusinessSeverity = {
  CRITICAL: 'critical', // 影响核心业务（登录、支付、结账）
  HIGH: 'high', // 影响用户体验（订单、PDP、PLP）
  MEDIUM: 'medium', // 功能异常但有降级方案
  LOW: 'low', // 轻微影响
} as const;

export type BusinessSeverityLevel = (typeof BusinessSeverity)[keyof typeof BusinessSeverity];

/**
 * 业务优先级（存入 Sentry business context，供 Dashboard 过滤）
 *
 * 注意：Sentry Issue Priority 由 event level 自动推断，不能通过 SDK 直接设置。
 * 此字段仅用于自定义 business context，与 Sentry 原生优先级无直接关联。
 */
export const BusinessPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type BusinessPriorityLevel = (typeof BusinessPriority)[keyof typeof BusinessPriority];

/**
 * 业务域 severity 映射
 *
 * 通过 SEVERITY_TO_SENTRY_LEVEL 转换为 Sentry event level（scope.setLevel）
 * 通过 SEVERITY_TO_LOG_LEVEL 转换为 logger 级别
 */
export const DOMAIN_SEVERITY: Record<BusinessDomain, BusinessSeverityLevel> = {
  [BUSINESS_DOMAIN.PAYMENT]: BusinessSeverity.CRITICAL,
  [BUSINESS_DOMAIN.CHECKOUT]: BusinessSeverity.CRITICAL,
  [BUSINESS_DOMAIN.USER]: BusinessSeverity.CRITICAL,
  [BUSINESS_DOMAIN.ORDER]: BusinessSeverity.HIGH,
  [BUSINESS_DOMAIN.PRODUCT]: BusinessSeverity.MEDIUM,
  [BUSINESS_DOMAIN.SEARCH]: BusinessSeverity.MEDIUM,
  [BUSINESS_DOMAIN.CART]: BusinessSeverity.MEDIUM,
  [BUSINESS_DOMAIN.PROMOTION]: BusinessSeverity.MEDIUM,
  [BUSINESS_DOMAIN.CMS]: BusinessSeverity.LOW,
  [BUSINESS_DOMAIN.CASA]: BusinessSeverity.LOW,
};

/**
 * 业务域 priority 映射
 */
export const DOMAIN_PRIORITY: Record<BusinessDomain, BusinessPriorityLevel> = {
  [BUSINESS_DOMAIN.PAYMENT]: BusinessPriority.HIGH,
  [BUSINESS_DOMAIN.CHECKOUT]: BusinessPriority.HIGH,
  [BUSINESS_DOMAIN.USER]: BusinessPriority.HIGH,
  [BUSINESS_DOMAIN.ORDER]: BusinessPriority.HIGH,
  [BUSINESS_DOMAIN.PRODUCT]: BusinessPriority.MEDIUM,
  [BUSINESS_DOMAIN.SEARCH]: BusinessPriority.MEDIUM,
  [BUSINESS_DOMAIN.CART]: BusinessPriority.MEDIUM,
  [BUSINESS_DOMAIN.PROMOTION]: BusinessPriority.MEDIUM,
  [BUSINESS_DOMAIN.CMS]: BusinessPriority.LOW,
  [BUSINESS_DOMAIN.CASA]: BusinessPriority.LOW,
};

/**
 * BusinessSeverityLevel → Sentry event level（scope.setLevel 使用）
 */
export const SEVERITY_TO_SENTRY_LEVEL: Record<BusinessSeverityLevel, SentrySeverityLevel> = {
  [BusinessSeverity.CRITICAL]: 'fatal',
  [BusinessSeverity.HIGH]: 'error',
  [BusinessSeverity.MEDIUM]: 'warning',
  [BusinessSeverity.LOW]: 'log',
};

/**
 * BusinessSeverityLevel → logger 级别
 */
export const SEVERITY_TO_LOG_LEVEL: Record<BusinessSeverityLevel, 'fatal' | 'error' | 'warn' | 'info'> = {
  [BusinessSeverity.CRITICAL]: 'fatal',
  [BusinessSeverity.HIGH]: 'error',
  [BusinessSeverity.MEDIUM]: 'warn',
  [BusinessSeverity.LOW]: 'info',
};

/**
 * 从 domain 字符串中提取业务域分类
 */
export function extractDomainCategory(domain: string): BusinessDomain | undefined {
  const domainValues = Object.values(BUSINESS_DOMAIN);
  if (domainValues.includes(domain as BusinessDomain)) {
    return domain as BusinessDomain;
  }

  const domainLower = domain.toLowerCase();
  for (const [, value] of Object.entries(BUSINESS_DOMAIN)) {
    if (domainLower.includes(value)) {
      return value as BusinessDomain;
    }
  }

  return undefined;
}

/**
 * 根据 domain 推断 severity 和 priority
 */
export function inferPriorityFromDomain(
  domain?: string
): { severity: BusinessSeverityLevel; priority: BusinessPriorityLevel } | undefined {
  if (!domain) return undefined;

  const domainCategory = extractDomainCategory(domain);
  if (domainCategory) {
    return {
      severity: DOMAIN_SEVERITY[domainCategory],
      priority: DOMAIN_PRIORITY[domainCategory],
    };
  }

  return { severity: BusinessSeverity.MEDIUM, priority: BusinessPriority.MEDIUM };
}

/**
 * 根据 pageType 推断业务域
 */
export function inferDomainFromPageType(pageType: string): BusinessDomain | undefined {
  const pageTypeToDomain: Record<string, BusinessDomain> = {
    [PAGE_TYPES.PDP]: BUSINESS_DOMAIN.PRODUCT,
    [PAGE_TYPES.PLP]: BUSINESS_DOMAIN.SEARCH,
    [PAGE_TYPES.CART]: BUSINESS_DOMAIN.CART,
    [PAGE_TYPES.CHECKOUT]: BUSINESS_DOMAIN.CHECKOUT,
    [PAGE_TYPES.ACCOUNT]: BUSINESS_DOMAIN.USER,
    [PAGE_TYPES.CMS]: BUSINESS_DOMAIN.CMS,
    [PAGE_TYPES.BLOG]: BUSINESS_DOMAIN.CMS,
    [PAGE_TYPES.HOME]: BUSINESS_DOMAIN.CMS,
    [PAGE_TYPES.OTHER]: BUSINESS_DOMAIN.CMS,
  };

  return pageTypeToDomain[pageType];
}

/**
 * 根据 pageType 和 domain 推断 domain、severity、priority
 */
export function inferDomainAndPriorityFromPageType(
  pageType?: string,
  domain?: string
): { domain?: BusinessDomain; severity?: BusinessSeverityLevel; priority?: BusinessPriorityLevel } {
  const resolvedDomain: BusinessDomain | undefined =
    domain !== undefined && domain !== ''
      ? extractDomainCategory(domain)
      : pageType
      ? inferDomainFromPageType(pageType)
      : undefined;
  const inferred = resolvedDomain ? inferPriorityFromDomain(resolvedDomain) : undefined;
  return {
    domain: resolvedDomain,
    severity: inferred?.severity,
    priority: inferred?.priority,
  };
}
