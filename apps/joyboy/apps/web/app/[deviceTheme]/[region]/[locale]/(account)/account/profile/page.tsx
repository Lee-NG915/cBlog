import { UserPagContent } from '@castlery/modules-user-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function UserPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.ACCOUNT, domain: BUSINESS_DOMAIN.USER });
  return <UserPagContent />;
}
