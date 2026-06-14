'use client';
import React from 'react';
import { ErrorBoundary } from '@castlery/fortress';
import { captureStructuredError } from '@castlery/observability/client';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundaryClass extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到 Sentry
    captureStructuredError(error, {
      extra: {
        boundaryLevel: 'global',
        componentStack: errorInfo.componentStack,
      },
    });
    // Error already logged to Sentry with full context
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误 UI
      return (
        <ErrorBoundary
          type="page"
          dyDataCampaign=""
          customContent={
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>页面出现错误</h1>
              <p style={{ marginBottom: '24px', color: '#666' }}>抱歉，页面遇到了一个意外错误。请刷新页面重试。</p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#c1af86',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                刷新页面
              </button>
            </div>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}
