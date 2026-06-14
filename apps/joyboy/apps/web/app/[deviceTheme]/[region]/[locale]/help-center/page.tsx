import { EcEnv } from '@castlery/config';
import { createMetadata, keywords as defaultKeywords } from '@castlery/seo';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { Content } from './components/content';
import { PageClient } from './page.client';

export const revalidate = 600;

export async function generateMetadata() {
  const title = 'Help Center';
  const description =
    'Get answers for your questions on Castlery’s order & payment methods, shipping & delivery times, refund & warranty policy, product manufacturing and more.';

  return createMetadata({
    title,
    description,
    keywords: defaultKeywords[EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() as keyof typeof defaultKeywords],
    robots: {
      index: true,
    },
  });
}

export default function HelpCenterPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });

  return (
    <>
      <PageClient />
      <Content />
    </>
  );
}
