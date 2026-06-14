import React from 'react';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export { generateMetadata } from './metadata';

async function PlaPage({
  params,
  searchParams,
}: {
  params: { slug: string; orderNumber: string; region: string };
  searchParams: URLSearchParams;
}) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PDP, domain: BUSINESS_DOMAIN.PRODUCT });

  // console.log('pla page', params, searchParams);
  return (
    <>
      {/* 切分成ssr流式渲染 */}
      PLA Fallback Page
    </>
  );
}

export default PlaPage;
