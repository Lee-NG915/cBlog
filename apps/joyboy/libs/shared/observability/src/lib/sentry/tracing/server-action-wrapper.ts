import { startSpan } from '@sentry/nextjs';
import { captureStructuredError } from '../capture/capture-error';
import { addBreadcrumb } from '../contexts/context-setters';
import type { MonitoringContext } from '../../monitoring/types';
import { filterPII } from '../errors/error-utils';
import { BusinessSeverity } from '../../monitoring/priorities';

/**
 * Server Action 配置选项
 */
export interface ServerActionOptions {
  /** Action 名称（用于追踪和日志） */
  actionName: string;
  /** 是否记录成功执行的 breadcrumb */
  recordSuccess?: boolean;
  /** 自定义上下文数据 */
  context?: Record<string, any>;
  /** 监控上下文（用于 Issue 路由和优先级区分） */
  monitoringContext?: MonitoringContext;
}

/**
 * 将 FormData 转换为普通对象（用于日志记录）
 */
function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      // 限制值的长度，避免记录过大的数据
      obj[key] = value.length > 200 ? `${value.substring(0, 200)}... [truncated]` : value;
    } else {
      obj[key] = '[File]';
    }
  });

  return obj;
}

/**
 * Server Action 错误包装器
 *
 * 自动捕获 Server Action 中的错误并上报到 Sentry
 * 创建 Sentry transaction 追踪性能
 * 记录 formData 和请求上下文（自动过滤 PII）
 * 记录成功执行的 breadcrumb
 *
 * @example
 * ```typescript
 * import { withServerActionInstrumentation } from '@castlery/observability';
 *
 * // 用户登录 Server Action
 * export const loginAction = withServerActionInstrumentation(
 *   async (formData: FormData) => {
 *     const email = formData.get('email') as string;
 *     const password = formData.get('password') as string;
 *     return await loginHandler(email, password);
 *   },
 *   {
 *     actionName: 'loginAction',
 *     monitoringContext: {
 *       domain: BUSINESS_DOMAIN.USER,  // 使用业务域常量
 *       severity: BusinessSeverity.CRITICAL, // 登录失败是严重问题
 *     },
 *   }
 * );
 *
 * // 加购 Server Action
 * export const addToCartAction = withServerActionInstrumentation(
 *   async (productId: string, quantity: number) => {
 *     return await addToCart(productId, quantity);
 *   },
 *   {
 *     actionName: 'addToCartAction',
 *     monitoringContext: {
 *       domain: BUSINESS_DOMAIN.CART,
 *     },
 *     context: {
 *       productId: 'xxx',  // 额外的调试信息
 *       quantity: 2,
 *     },
 *   }
 * );
 * ```
 */
export function withServerActionInstrumentation<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: ServerActionOptions
): T {
  const { actionName, recordSuccess = true, context = {}, monitoringContext = {} } = options;

  const domain = monitoringContext.domain || undefined;

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // 创建 Sentry transaction 追踪性能
    return await startSpan(
      {
        name: actionName,
        op: 'function.server_action',
        attributes: {
          'server_action.name': actionName,
          ...(domain && { domain }),
        },
      },
      async (span) => {
        const startTime = Date.now();

        try {
          // 转换参数为可记录的格式（FormData -> Object）
          const argsForLogging = args.map((arg) => {
            if (arg instanceof FormData) {
              return formDataToObject(arg);
            }
            return arg;
          });

          // 过滤 PII（使用统一的 filterPII）
          const filteredArgs = filterPII(argsForLogging);

          // 记录 Server Action 调用的 breadcrumb（使用封装的 addBreadcrumb）
          addBreadcrumb({
            message: `Executing ${actionName}`,
            domain,
            level: BusinessSeverity.LOW,
            data: {
              action: actionName,
              args: filteredArgs,
              ...filterPII(context),
            },
          });

          // 执行原始 action
          const result = await action(...args);

          // 记录成功执行
          if (recordSuccess) {
            const duration = Date.now() - startTime;
            addBreadcrumb({
              message: `${actionName} completed successfully`,
              domain,
              level: BusinessSeverity.LOW,
              data: {
                action: actionName,
                duration,
                ...filterPII(context),
              },
            });
          }

          // 设置 span 状态为成功
          span?.setStatus({ code: 1, message: 'ok' });

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;

          // 设置 span 状态为错误
          span?.setStatus({ code: 2, message: 'internal_error' });

          // 转换参数为可记录的格式
          const argsForLogging = args.map((arg) => {
            if (arg instanceof FormData) {
              return formDataToObject(arg);
            }
            return arg;
          });

          // 捕获错误到 Sentry（captureStructuredError 内部会自动过滤 PII）
          const eventId = captureStructuredError(error as Error, {
            ...monitoringContext,
            severity: monitoringContext.severity || BusinessSeverity.HIGH,
            tags: {
              ...monitoringContext.tags,
              action_name: actionName,
              action_type: 'server_action',
            },
            extra: {
              action: actionName,
              duration,
              args: argsForLogging, // filterPII 在 captureStructuredError 内部执行
              ...context,
            },
          });

          // 记录错误 breadcrumb（使用封装的 addBreadcrumb）
          addBreadcrumb({
            message: `${actionName} failed`,
            domain,
            level: BusinessSeverity.HIGH,
            data: {
              action: actionName,
              error: (error as Error).message,
              duration,
              eventId,
            },
          });

          // 返回安全的错误消息（避免泄露内部细节）
          throw new Error(`Server action failed: ${actionName}. Event ID: ${eventId}`);
        }
      }
    );
  }) as T;
}
