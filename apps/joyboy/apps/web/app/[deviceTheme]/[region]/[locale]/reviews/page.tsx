import { ReviewContainer } from '@castlery/modules-others-components';
import { getReviewListByPageOnServer } from '@castlery/modules-others-domain';
import { createMetadata } from '@castlery/seo';
import { PageClient } from './page.client';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const title = 'Reviews';
  const description = 'Read reviews from our customers and see what they think about our products.';

  return createMetadata({
    title,
    description,
    keywords: '',
    robots: {
      index: true,
    },
  });
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.USER });
  const result = await getReviewList({ page: searchParams?.p ? Number(searchParams?.p) : undefined });

  return (
    <>
      <PageClient />
      <ReviewContainer result={result} />
    </>
  );
}

const getReviewList = async ({ page = 1 }: { page?: number }) => {
  const result = await getReviewListByPageOnServer(page, 10);
  if (!result) {
    return null;
  }
  return result;
};
