'use client'; // Error components must be Client Components
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { ErrorBoundary } from '@castlery/fortress';

export function ProductReviewsError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Log the error to an error reporting service
    Sentry.captureException(error);
    // Error already logged to Sentry
  }, [error]);
  // const t = useTranslations('Error');

  return (
    <>
      <ErrorBoundary type={'page'} dyDataCampaign="" />
    </>
  );
}
