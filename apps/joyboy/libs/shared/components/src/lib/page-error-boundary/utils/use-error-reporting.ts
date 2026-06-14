'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  captureStructuredError,
  PAGE_TYPES,
  type MonitoringContext,
  type PageType,
} from '@castlery/observability/client';

function isKnownDomMutationNoise(error: Error): boolean {
  const message = error?.message || '';
  const name = error?.name || '';

  // Browser extensions / injected scripts can mutate DOM nodes outside React's control.
  // React then throws during commit with insertBefore/removeChild "not a child" DOMException.
  if (name === 'NotFoundError') {
    return /Failed to execute '(insertBefore|removeChild)' on 'Node': The node .* is not a child of this node\./i.test(
      message
    );
  }

  return false;
}
/**
 * 用于在错误边界组件中上报错误到 Sentry 的公共 hook
 * @param error - 错误对象
 * @param pageType - 页面类型，用于在 Sentry 中标记错误来源
 * @param errorBoundaryName - 可选的错误边界名称，用于日志输出
 * @param context - 可选的监控上下文信息（domain、priority、severity 等）
 */
export function useErrorReporting(
  error: Error & { digest?: string },
  pageType: PageType,
  errorBoundaryName?: string,
  context?: Omit<MonitoringContext, 'pageType'>
) {
  const pathname = usePathname();

  const domain = context?.domain;
  const priority = context?.priority;
  const severity = context?.severity;
  const tagsKey = JSON.stringify(context?.tags);
  const extraKey = JSON.stringify(context?.extra);
  const errorBoundary = 'page';

  useEffect(() => {
    if (pageType === PAGE_TYPES.BLOG && errorBoundary === 'page' && isKnownDomMutationNoise(error)) return;

    const boundaryName = errorBoundaryName || 'ErrorBoundary';
    const contextTags = context?.tags;
    const contextExtra = context?.extra;

    // 使用 captureStructuredError 统一处理（自动日志、PII 过滤、环境检测）
    // severity/priority 不传时由 enrichContext 根据 domain 自动推断，无需在 error 页面手动设置
    captureStructuredError(error, {
      domain,
      pageType,
      ...(priority !== undefined && { priority }),
      ...(severity !== undefined && { severity }),
      tags: {
        ...contextTags,
        error_boundary: errorBoundary,
        ...(error.digest ? { digest: error.digest } : {}),
      },
      extra: {
        ...contextExtra,
        pathname,
        boundaryName,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, pageType, errorBoundaryName, pathname, domain, priority, severity, tagsKey, extraKey]);
}
