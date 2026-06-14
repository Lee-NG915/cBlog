'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { setGlobalSentryContext } from '../contexts/context-setters';
import type { PageType } from '../../monitoring/page-types';
import type { BusinessSeverityLevel, BusinessPriorityLevel } from '../../monitoring/priorities';
import type { BusinessDomain } from '../../monitoring/domains';

/**
 * Sentry 上下文 Provider 的 Props
 */
export interface SentryContextProviderProps {
  /** 页面类型（必需） */
  pageType: PageType;
  /** 业务域（可选，会根据 pageType 自动推断优先级） */
  domain?: BusinessDomain;
  /** 优先级（使用 BusinessPriority 常量）- 用于 Issue 路由和优先级区分。如果未提供，将根据 pageType/domain 自动推断。 */
  priority?: BusinessPriorityLevel;
  /** 业务严重度（使用 BusinessSeverity 常量）- 用于设置 Sentry Issue Level。如果未提供，将根据 pageType/domain 自动推断。 */
  severity?: BusinessSeverityLevel;
  /** 国家/地区代码（可选） */
  country?: string;
  /** 用户 ID（可选） */
  userId?: string;
  /** 子组件 */
  children: ReactNode;
}

/**
 * Sentry 上下文 Provider 组件（同时支持服务端和客户端）
 *
 * 在各个模块的 layout 中引入，设置该模块的 pageType，
 * 这样该模块下的所有错误上报（服务端和客户端）都会自动包含这些基础上下文。
 *
 * **工作原理**：
 * - **服务端渲染时**：在组件渲染时同步设置上下文（用于 Server Actions、服务端 fetch 等）
 * - **客户端 hydration 时**：在组件渲染时同步设置上下文，确保在 children 渲染之前完成
 * - **自动推断**：如果未提供 `domain`、`priority`、`severity`，会根据 `pageType` 自动推断
 *
 * **执行顺序保证**：
 * 1. 组件函数体执行 → `setGlobalSentryContext` 同步执行（服务端和客户端都是同步）
 * 2. `return <>{children}</>` → children 渲染
 * 3. `useEffect` 执行（仅用于 props 变化时更新上下文）
 *
 * 这样确保 children 中的任何代码（包括立即执行的 Server Actions、useEffect 等）都能获取到正确的上下文。
 *
 * **优先级映射规则**：
 * - `payment/checkout` 域 → `priority: high`, `severity: critical`（支付、结账）
 * - `user` 域 → `priority: high`, `severity: critical`（用户认证）
 * - `order` 域 → `priority: high`, `severity: high`（订单）
 * - `cart/product/search` 域 → `priority: high`, `severity: medium`（购物车、产品、搜索）
 * - `cms` 域 → `priority: low`, `severity: low`（CMS、博客）
 *
 * **使用方式**：在每个 route group 的 layout 中引入（无需区分服务端/客户端）
 *
 * **RSC 规范**：若 layout 是 Server Component，必须从 `@castlery/observability/server` 导入
 * PAGE_TYPES、BUSINESS_DOMAIN，仅从 `@castlery/observability/client` 导入本组件；
 * 否则会触发 React Client Manifest 序列化错误。
 *
 * @example
 * ```typescript
 * // 基本使用（priority 和 severity 会自动推断）
 * // apps/web/app/[deviceTheme]/[region]/[locale]/(PLP)/layout.tsx（Server Component）
 * import { SentryContextProvider } from '@castlery/observability/client';
 * import { PAGE_TYPES } from '@castlery/observability/server';
 *
 * export default function PLPLayout({ children }) {
 *   return (
 *     <SentryContextProvider pageType={PAGE_TYPES.PLP}>{children}</SentryContextProvider>
 *   );
 * }
 *
 * // 如果需要覆盖默认优先级，可以手动指定
 * <SentryContextProvider
 *   pageType={PAGE_TYPES.CHECKOUT}
 *   domain={BUSINESS_DOMAIN.CHECKOUT}
 *   priority={BusinessPriority.HIGH}
 *   severity={BusinessSeverity.CRITICAL}
 * >
 *   {children}
 * </SentryContextProvider>
 * ```
 */
export function SentryContextProvider({
  pageType,
  domain,
  priority,
  severity,
  country,
  userId,
  children,
}: SentryContextProviderProps) {
  const contextOptions = {
    pageType,
    domain,
    priority,
    severity,
    country,
    userId,
  };

  // 使用 useRef 跟踪上一次的 contextOptions（用于检测变化）
  const prevContextRef = useRef<typeof contextOptions | null>(null);

  // 同步设置上下文（服务端和客户端都是同步执行，确保在 children 渲染之前完成）
  // 这样 children 中的任何代码（包括立即执行的 Server Actions、useEffect 等）都能获取到正确的上下文
  // 每次渲染时都同步设置，确保上下文始终是最新的（setGlobalSentryContext 是幂等的）
  setGlobalSentryContext(contextOptions);

  // useEffect 用于处理 props 变化时更新上下文（例如路由切换导致 pageType 变化）
  // 虽然同步设置已经处理了大部分情况，但 useEffect 确保在客户端路由切换时也能正确更新
  useEffect(() => {
    // 检查 contextOptions 是否真的变化了（避免不必要的更新）
    const prevContext = prevContextRef.current;
    const hasChanged =
      !prevContext ||
      prevContext.pageType !== contextOptions.pageType ||
      prevContext.domain !== contextOptions.domain ||
      prevContext.priority !== contextOptions.priority ||
      prevContext.severity !== contextOptions.severity ||
      prevContext.country !== contextOptions.country ||
      prevContext.userId !== contextOptions.userId;

    if (hasChanged) {
      setGlobalSentryContext(contextOptions);
      prevContextRef.current = contextOptions;
    }
  }, [pageType, domain, priority, severity, country, userId]);

  return <>{children}</>;
}
