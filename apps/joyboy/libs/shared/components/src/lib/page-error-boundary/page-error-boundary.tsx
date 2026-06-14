'use client';

import { ErrorBoundary } from '@castlery/fortress';
import { useErrorReporting } from './utils/use-error-reporting';
import type { MonitoringContext, PageType } from '@castlery/observability/client';

export interface PageErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  pageType: PageType;
  errorBoundaryName?: string;
  dyDataCampaign?: string;
  /** 可选的监控上下文信息（domain、priority、severity 等） */
  context?: Omit<MonitoringContext, 'pageType'>;
}

/**
 * 页面错误边界组件，封装了错误上报和错误 UI 渲染
 * @param error - 错误对象
 * @param reset - 重置函数
 * @param pageType - 页面类型，用于在 Sentry 中标记错误来源
 * @param errorBoundaryName - 可选的错误边界名称，用于日志输出
 * @param dyDataCampaign - 可选的 DY 数据活动名称，默认为空字符串
 * @param context - 可选的监控上下文信息（domain、priority、severity 等）
 */
export function PageErrorBoundary({
  error,
  reset,
  pageType,
  errorBoundaryName,
  dyDataCampaign = '',
  context,
}: PageErrorBoundaryProps) {
  useErrorReporting(error, pageType, errorBoundaryName, context);

  return <ErrorBoundary type="page" retryEvent={reset} dyDataCampaign={dyDataCampaign} />;
}
