'use client';
import { Box, Stack, useBreakpoints, useNiceModal } from '@castlery/fortress';
import { WebOrderItemTableV1 } from '../web-order-line-items/web-order-line-items-v1';
import { WebOrderItemsMobileV1 } from '../web-order-line-items/web-order-items-mobile/web-order-items-mobile-v1';
import { WebOrderInfoOverviewV1 } from '../web-order-info-overview/web-order-info-overview-v1';
import { WebOrderServiceItemsMobileV1 } from '../web-order-line-items/web-order-service-items-mobile/web-order-service-items-mobile-v1';
import { OrderDataV1 } from '@castlery/types';
interface WebOrderHistoryListV1Props {
  orders: OrderDataV1[];
}

export function WebOrderHistoryListV1({ orders }: WebOrderHistoryListV1Props) {
  const { desktop } = useBreakpoints();
  const [modal, modalContextHolder] = useNiceModal();
  return (
    <>
      {modalContextHolder}
      <Stack direction="column" spacing={8}>
        {orders.map((order: OrderDataV1) => (
          <Box key={order.id} sx={{ mb: 6, boxShadow: 'none', borderRadius: 0 }}>
            <WebOrderInfoOverviewV1 order={order} modal={modal} isOrderListPage={true} />
            {desktop ? (
              <WebOrderItemTableV1 order={order} />
            ) : (
              <>
                <WebOrderItemsMobileV1 order={order} />
                {/* pos 手动增加的 service */}
                <WebOrderServiceItemsMobileV1 addServiceList={order.addOnServiceLineItems || []} />
              </>
            )}
          </Box>
        ))}
      </Stack>
    </>
  );
}

export default WebOrderHistoryListV1;
