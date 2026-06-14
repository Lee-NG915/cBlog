'use client';
import { Box, Stack, useBreakpoints } from '@castlery/fortress';
import { WebOrderItemTable } from '../web-order-line-items/web-order-line-items';
import { WebOrderItemsMobile } from '../web-order-line-items/web-order-items-mobile/web-order-items-mobile';
import { WebOrderInfoOverview } from '../web-order-info-overview/web-order-info-overview';
import { WebOrderServiceItemsMobile } from '../web-order-line-items/web-order-service-items-mobile/web-order-service-items-mobile';

interface WebOrderHistoryListProps {
  orders: any[];
}

export function WebOrderHistoryList({ orders }: WebOrderHistoryListProps) {
  const { desktop } = useBreakpoints();

  return (
    <Stack direction="column" spacing={8}>
      {orders.map((order: any) => (
        <Box key={order.id} sx={{ mb: 6, boxShadow: 'none', borderRadius: 0 }}>
          <WebOrderInfoOverview order={order} />
          {desktop ? (
            <WebOrderItemTable order={order} />
          ) : (
            <>
              <WebOrderItemsMobile orderId={order.id} orderNumber={order.number} />
              <WebOrderServiceItemsMobile serviceItems={order.addon_service_line_items} />
            </>
          )}
        </Box>
      ))}
    </Stack>
  );
}

export default WebOrderHistoryList;
