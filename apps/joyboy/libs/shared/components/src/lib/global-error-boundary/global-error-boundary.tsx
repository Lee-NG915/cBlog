'use client';

import React from 'react';
import { ErrorBoundary } from '@castlery/fortress';
import { captureStructuredError, BusinessSeverity, BusinessPriority } from '@castlery/observability/client';

export interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundaryClass extends React.Component<GlobalErrorBoundaryProps, { hasError: boolean; error?: Error }> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureStructuredError(error, {
      pageType: 'global',
      severity: BusinessSeverity.MEDIUM,
      priority: BusinessPriority.LOW,
      tags: {
        error_boundary: 'global',
      },
      extra: {
        errorInfo,
        boundaryName: 'GlobalErrorBoundary',
      },
    });
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误 UI
      return <ErrorBoundary noHeader={false} type="page" dyDataCampaign="" />;
    }

    return this.props.children;
  }
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}
