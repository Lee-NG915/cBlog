'use client';
import { Box } from '@castlery/fortress';
import { WebOrderHistory, WebOrderHistoryV1 } from '@castlery/modules-order-components';
import { useGetCustomerOrderHistoryQuery } from '@castlery/modules-order-domain';
import { sharedFeatureService } from '@castlery/shared-services';

export function PageClient() {
  const enableOrderV2 = sharedFeatureService.enabledOrderV2;

  useGetCustomerOrderHistoryQuery(undefined, { skip: enableOrderV2 });

  return enableOrderV2 ? (
    <Box>
      <WebOrderHistoryV1 />
    </Box>
  ) : (
    <Box>
      <WebOrderHistory />
    </Box>
  );
}
