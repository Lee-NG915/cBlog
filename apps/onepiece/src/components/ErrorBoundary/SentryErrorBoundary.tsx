import React from 'react';
import * as Sentry from '@sentry/react';
import type { FallbackRender } from '@sentry/react';
import ErrorPage from './ErrorPage';

interface Props {
  children: React.ReactNode;
}

const SentryErrorBoundary: React.FC<Props> = ({ children }) => {
  const onError = (error: unknown, componentStack: string | undefined, eventId: string) => {
    // Sentry.ErrorBoundary 会自动上报异常。这里保留日志便于本地调试。
    // 如需自定义上报，可在此调用 Sentry.captureException(error)。
    // console.log('Sentry Error', error);
    // console.log('Sentry componentStack', componentStack);
    // console.log('Sentry eventId', eventId);
  };

  const fallback: FallbackRender = ({ error, componentStack, eventId }) => (
    <ErrorPage error={error} componentStack={componentStack} eventId={eventId} />
  );

  return (
    <>
      <Sentry.ErrorBoundary onError={onError} fallback={fallback}>
        {children}
      </Sentry.ErrorBoundary>
    </>
  );
};

export default SentryErrorBoundary;
