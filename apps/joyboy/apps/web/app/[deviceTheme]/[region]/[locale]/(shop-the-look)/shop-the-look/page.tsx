import { ShopTheLookContainer } from '@castlery/modules-others-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function ShopTheLookPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });

  return <ShopTheLookContainer type="living_room" />;
}
