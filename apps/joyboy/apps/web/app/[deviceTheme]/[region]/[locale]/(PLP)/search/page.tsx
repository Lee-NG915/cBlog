import { SearchResultsPage } from '@castlery/modules-search-components/server';
import { createMetadata } from '@castlery/seo';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { PlpSearchPageClient } from './page-client';
import { CategoryDyTagServer } from '@castlery/modules-composite-components';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return createMetadata({
    title: 'Search',
    description: 'Search results of Castlery',
    keywords: 'Search, Results',
    robots: {
      index: false,
      'max-image-preview': 'large',
    },
  });
}
export default async function SearchPage({ searchParams }: { searchParams: { dyApiPreview?: string } }) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PLP, domain: BUSINESS_DOMAIN.SEARCH });

  return (
    <>
      <PlpSearchPageClient breadcrumb="Search Results" />
      <CategoryDyTagServer breadcrumbNames={['Search Results']} />
      <SearchResultsPage dyApiPreview={searchParams.dyApiPreview} />
    </>
  );
}
