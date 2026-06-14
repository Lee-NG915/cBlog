import { PageClient } from './page.client';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export { generateMetadata } from './metadata';

export default async function AccountOrdersPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.ACCOUNT, domain: BUSINESS_DOMAIN.ORDER });
  return <PageClient />;

}
