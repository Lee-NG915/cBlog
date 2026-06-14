import React from 'react';
import { Box } from '@castlery/fortress';
import { WebOrderDetails, WebOrderDetailsV1 } from '@castlery/modules-order-components';
import { PageClient } from './page.client';
import { sharedFeatureService } from '@castlery/shared-services';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export { generateMetadata } from './metadata';

export default function AccountOrderDetailsPage() {
  const enableOrderV2 = sharedFeatureService.enabledOrderV2;

  setGlobalSentryContext({ pageType: PAGE_TYPES.ACCOUNT, domain: BUSINESS_DOMAIN.ORDER });
  return (
    <Box>
      <PageClient />
      {enableOrderV2 ? <WebOrderDetailsV1 /> : <WebOrderDetails />}
    </Box>
  );
}
