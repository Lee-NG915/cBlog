import { MaintenanceView } from '@castlery/shared-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function MaintenancePage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });
  return <MaintenanceView />;
}
