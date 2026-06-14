'use client';
import { PageErrorBoundary } from '@castlery/shared-components';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/client';

/**
 * Account 路由专属错误边界
 * 显式传入 domain，确保错误在 Sentry 上带业务域（服务端 setGlobalSentryContext 不会传到客户端）
 */
export default function AccountError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageErrorBoundary
      error={error}
      reset={reset}
      pageType={PAGE_TYPES.ACCOUNT}
      errorBoundaryName="AccountErrorBoundary"
      context={{ domain: BUSINESS_DOMAIN.USER }}
    />
  );
}
