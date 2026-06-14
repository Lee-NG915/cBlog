import {
  getIsolationScope,
  withScope,
  addBreadcrumb as sentryAddBreadcrumb,
  setUser,
  getClient,
  type Scope,
  type SeverityLevel,
} from '@sentry/nextjs';
import { EcEnv } from '@castlery/config';
import { filterPII } from '../errors/error-utils';
import type { MonitoringContext } from '../../monitoring/types';
import {
  inferDomainAndPriorityFromPageType,
  SEVERITY_TO_SENTRY_LEVEL,
  BusinessSeverity,
  BusinessPriority,
  type BusinessSeverityLevel,
  extractDomainCategory,
} from '../../monitoring/priorities';
import type { PageType } from '../../monitoring/page-types';
import type { BusinessDomain } from '../../monitoring/domains';

/**
 * 从 Sentry current scope 读取已设置的 domain、pageType。
 * 用于 enrichContext、addBreadcrumb 等需要继承全局上下文的场景。
 */
function getGlobalContext(): { domain?: string; pageType?: string } {
  try {
    const currentScope = getIsolationScope();
    const scopeData = currentScope.getScopeData();
    const currentTags = scopeData.tags || {};
    return {
      domain: typeof currentTags['domain'] === 'string' ? currentTags['domain'] : undefined,
      pageType: typeof currentTags['page_type'] === 'string' ? currentTags['page_type'] : undefined,
    };
  } catch {
    // Sentry SDK 内部异常（如 scope 未初始化）静默处理，降级返回空上下文
    return {};
  }
}

/**
 * 自动补充 domain、priority、severity。
 * 未传时依次从 context → 全局 scope → inferDomainAndPriorityFromPageType(pageType, domain) 推断；
 * domain 未传时可由 pageType 推断兜底。
 *
 * @example
 * enrichContext({ domain: BUSINESS_DOMAIN.CART })
 * enrichContext({}) // 从全局上下文继承 domain/pageType，再推断 priority/severity
 * enrichContext({ domain: BUSINESS_DOMAIN.CART, severity: BusinessSeverity.CRITICAL })
 */
export function enrichContext(context: MonitoringContext): MonitoringContext {
  const globalContext = getGlobalContext();
  const domain = context.domain ?? (globalContext.domain ? extractDomainCategory(globalContext.domain) : undefined);
  const pageType = context.pageType ?? (globalContext.pageType as PageType | undefined);
  const {
    domain: inferredDomain,
    severity: inferredSeverity,
    priority: inferredPriority,
  } = inferDomainAndPriorityFromPageType(pageType, domain);

  return {
    domain: domain ?? inferredDomain,
    pageType,
    severity: context.severity ?? inferredSeverity ?? BusinessSeverity.MEDIUM,
    priority: context.priority ?? inferredPriority ?? BusinessPriority.MEDIUM,
    userId: context.userId,
    country: context.country,
    skipSentry: context.skipSentry,
    fingerprint: context.fingerprint,
    tags: context.tags,
    extra: context.extra,
  };
}

/**
 * 设置全局 Sentry 上下文（页面加载时注入）。
 * 未传 domain 时由 inferDomainAndPriorityFromPageType(pageType, options.domain) 根据 pageType 推断兜底；
 * 未传 priority/severity 时同样由该函数推断。
 * 推荐在 layout 中用 SentryContextProvider 传 pageType（及可选的 domain）。
 *
 * @param options - 至少传 pageType；domain 可选，不传则按 pageType 推断
 * @example
 * <SentryContextProvider pageType={PAGE_TYPES.PLP}>{children}</SentryContextProvider>
 * setGlobalSentryContext({ pageType: 'plp', domain: 'product', country: 'SG' })
 */
export function setGlobalSentryContext(options: Partial<MonitoringContext> = {}): void {
  const {
    domain: inferredDomain,
    severity: inferredSeverity,
    priority: inferredPriority,
  } = inferDomainAndPriorityFromPageType(options.pageType, options.domain);
  const domain = options.domain ?? inferredDomain;

  const globalContext: MonitoringContext = {
    country: EcEnv.NEXT_PUBLIC_COUNTRY || 'unknown',
    domain,
    priority: options.priority ?? inferredPriority,
    severity: options.severity ?? inferredSeverity,
    pageType: options.pageType,
    ...(options.country !== undefined && { country: options.country }),
    ...(options.userId !== undefined && { userId: options.userId }),
  };

  // 写到 isolation scope（per-request 共享），而非 getCurrentScope()（per-async-context）。
  const scope = getIsolationScope();

  scope.setTags({
    app_version: EcEnv.NEXT_PUBLIC_VERSION || 'unknown',
    environment: EcEnv.NEXT_PUBLIC_APPLICATION_ENV || EcEnv.NODE_ENV || 'unknown',
    country: globalContext.country || 'unknown',
    ...(globalContext.domain && { domain: globalContext.domain }),
    ...(globalContext.pageType && { page_type: globalContext.pageType }),
  });

  if (globalContext.severity) {
    scope.setLevel(SEVERITY_TO_SENTRY_LEVEL[globalContext.severity]);
  }

  const businessContext: Record<string, any> = {};
  if (globalContext.priority) businessContext['priority'] = globalContext.priority;
  if (globalContext.severity) businessContext['severity'] = globalContext.severity;

  if (Object.keys(businessContext).length > 0) {
    scope.setContext('business', businessContext);
  }

  if (globalContext.userId) {
    scope.setUser({ id: globalContext.userId });
  }
}

/**
 * 在 withScope 内设置局部 Sentry 上下文，与全局 scope 的 tags/context 合并。
 * 用于 Server Actions、API routes、客户端事件处理等补充本次捕获的 domain、tags、extra 等。
 * 传入的 tags 中空字符串会被过滤（Sentry 要求 tag 值为非空）。
 *
 * @param scope - Sentry withScope 回调中的 scope
 * @param options - 本次要补充的上下文（domain、pageType、priority、severity、tags、extra 等）
 * @example
 * Sentry.withScope((scope) => {
 *   setSentryContext(scope, { domain: BUSINESS_DOMAIN.CART, priority: BusinessPriority.MEDIUM });
 *   Sentry.captureException(error);
 * });
 */
export function setSentryContext(scope: Scope, options: MonitoringContext): void {
  const { domain, pageType, priority, severity, userId, country, fingerprint, tags = {}, extra = {} } = options;

  const isolationScope = getIsolationScope();
  const scopeData = isolationScope.getScopeData();
  const currentTags = scopeData.tags || {};
  const currentContexts = scopeData.contexts || {};
  const currentBusinessContext = (currentContexts['business'] as Record<string, any>) || {};

  if (userId) {
    scope.setUser({ id: userId });
  }

  const currentCountry = typeof currentTags['country'] === 'string' ? currentTags['country'] : undefined;

  // Sentry 要求 tag 值为非空字符串，空值会触发 "Discarded invalid value: expected a non-empty value"
  const filterEmptyTags = (obj: Record<string, string>) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v === 'string' && v.length > 0)) as Record<
      string,
      string
    >;

  const tagsToSet: Record<string, string> = filterEmptyTags({
    app_version: EcEnv.NEXT_PUBLIC_VERSION || 'unknown',
    environment: EcEnv.NEXT_PUBLIC_APPLICATION_ENV || EcEnv.NODE_ENV || 'unknown',
    country: country || currentCountry || 'unknown',
    ...(domain && { domain }),
    ...(pageType && { page_type: pageType }),
    ...tags,
  });

  scope.setTags(tagsToSet);

  if (severity) {
    scope.setLevel(SEVERITY_TO_SENTRY_LEVEL[severity]);
  }

  if (fingerprint && fingerprint.length > 0) {
    scope.setFingerprint(fingerprint);
  }

  const businessContext: Record<string, any> = {
    ...currentBusinessContext,
    ...(priority && { priority }),
    ...(severity && { severity }),
  };

  if (Object.keys(businessContext).length > 0) {
    scope.setContext('business', businessContext);
  }

  if (Object.keys(extra).length > 0) {
    const filteredExtra = filterPII(extra);
    Object.entries(filteredExtra).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
  }

  const client = getClient();
  if (client) {
    const propagationContext = scope.getPropagationContext();
    if (propagationContext?.traceId) {
      scope.setTag('trace_id', propagationContext.traceId);
    }
  }
}

/**
 * 在 withScope 内先设置 Sentry 上下文再执行 callback，便于在捕获错误前注入 domain、priority 等。
 * 服务端/客户端通用。
 *
 * @param options - 要注入的上下文
 * @param callback - 设置完上下文后执行的逻辑（如调用 captureException）
 * @example
 * withSentryContext({ domain: BUSINESS_DOMAIN.CART, priority: BusinessPriority.MEDIUM }, () => {
 *   doSomething();
 *   Sentry.captureException(error);
 * });
 */
export function withSentryContext<T>(options: MonitoringContext, callback: () => T | Promise<T>): T | Promise<T> {
  return withScope((scope) => {
    setSentryContext(scope, options);
    return callback();
  });
}

/**
 * 添加业务面包屑，用于记录用户操作或业务流程步骤，便于在 Sentry 中还原错误前的行为。
 * 未传 domain 时从 getGlobalContext() 读取当前 scope 的 domain。
 *
 * @param options.message - 面包屑描述
 * @param options.domain - 可选，不传则用全局上下文的 domain
 * @param options.level - 可选，默认 'info'
 * @param options.data - 可选，附加数据
 */
export function addBreadcrumb(options: {
  message: string;
  domain?: BusinessDomain;
  level?: BusinessSeverityLevel;
  data?: Record<string, any>;
}) {
  const globalContext = getGlobalContext();
  const domain = options.domain || globalContext.domain;
  const sentryLevel: SeverityLevel = SEVERITY_TO_SENTRY_LEVEL[options.level ?? BusinessSeverity.LOW];

  sentryAddBreadcrumb({
    category: 'business',
    message: options.message,
    level: sentryLevel,
    data: {
      ...(domain && { domain }),
      ...options.data,
    },
  } as Parameters<typeof sentryAddBreadcrumb>[0]);
}

/**
 * 设置用户上下文（登录时调用）。
 * 仅传匿名 id 到 Sentry，不传 email、username 等 PII，以符合 GDPR/PDPA 等隐私要求。
 *
 * @param user - 至少包含 id（匿名标识），其他字段不会上报
 */
export function setUserContext(user: { id: string; [key: string]: any }) {
  setUser({ id: user.id });
}

/**
 * 清除用户上下文（登出时调用），清空 Sentry 当前 scope 的用户信息。
 */
export function clearUserContext() {
  setUser(null);
}
