import { ReferralContent } from '@castlery/shared-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const dynamic = 'force-static';

export default function ReferralPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.USER });

  return <ReferralContent />;
}
