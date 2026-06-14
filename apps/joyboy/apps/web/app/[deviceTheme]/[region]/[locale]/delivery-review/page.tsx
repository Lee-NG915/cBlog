import { DeliveryReviewContainer } from '@castlery/modules-others-components';
import { createMetadata } from '@castlery/seo';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { PageClient } from './page.client';

export const revalidate = 600;

export async function generateMetadata() {
  const title = 'Rate Your Delivery Experience';
  const description = '';

  return createMetadata({
    title,
    description,
    keywords: '',
    robots: {
      index: true,
    },
  });
}

export default async function DeliveryReviewPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.ORDER });

  return (
    <>
      <PageClient />
      <DeliveryReviewContainer />
    </>
  );
}
