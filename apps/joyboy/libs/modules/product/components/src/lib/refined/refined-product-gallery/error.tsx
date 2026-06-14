'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { FortressImage } from '@castlery/shared-components';

export function RefinedProductGalleryError({ error }: { error: string }) {
  useEffect(() => {
    // Log the error to an error reporting service
    Sentry.captureException(error);
    // Error already logged to Sentry
  }, [error]);

  // return <ErrorBoundary type={'page'} dyDataCampaign="" />;
  return <FortressImage src={''} alt={''} />;
}
