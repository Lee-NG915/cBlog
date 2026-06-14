import { SubmitReviewContent } from '@castlery/modules-user-components';
import { SubmitReviewPageClient } from './page.client';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function SubmitReviewPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.USER });

  return (
    <>
      <SubmitReviewPageClient />
      <SubmitReviewContent />
    </>
  );
}
