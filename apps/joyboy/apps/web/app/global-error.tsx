'use client';
import { useEffect } from 'react';
import { ErrorBoundary } from '@castlery/fortress';
import { captureStructuredError, BusinessSeverity } from '@castlery/observability/client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    captureStructuredError(error, {
      severity: BusinessSeverity.CRITICAL,
      tags: {
        error_boundary: 'global',
        digest: error.digest || '',
      },
      extra: {
        digest: error.digest,
        boundaryLevel: 'global',
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        <ErrorBoundary type="page" retryEvent={reset} dyDataCampaign="" />
      </body>
    </html>
  );
}
