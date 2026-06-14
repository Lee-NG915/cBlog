import { ContactUsContainer } from '@castlery/modules-others-components';
import { createMetadata } from '@castlery/seo';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { PageClient } from './page.client';

export const revalidate = 600;

export async function generateMetadata() {
  const title = 'Contact Us';
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

export default function ContactUsPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });

  return (
    <>
      <PageClient />
      <ContactUsContainer />
    </>
  );
}
