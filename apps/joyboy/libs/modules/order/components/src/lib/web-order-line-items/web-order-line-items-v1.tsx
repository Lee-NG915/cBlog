'use client';

import { Typography, Table, useBreakpoints } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ProductLineItemInfoV1, PriceDisplay } from '@castlery/shared-components';
import { OrderShipmentStateV1 } from './order-shipment-state/order-shipment-state-v1';
import { AddOnServiceLineItemV1, OrderDataV1, OrderLineItemV1, OrderShipmentV1 } from '@castlery/types';

export function WebOrderItemTableV1({ order }: { order: OrderDataV1 }) {
  const { md } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderItemTable',
  });
  const headersTitles = t('tableHeader', { returnObjects: true });

  // const modifiedOrderItems = useAppSelector((state) => selectModifiedOrderItems(state, order.id));
  return (
    <Table
      sx={{
        borderCollapse: 'separate',
        borderSpacing: 0,
        width: '100%',
        '& th, & td': {
          width: '10%',
          py: 4,
          px: 0,
          verticalAlign: 'top',
          textAlign: 'center',
        },
        '& th': {
          borderBottom: (theme) => `1px solid ${theme.palette.brand.mono[300]} !important`,
        },
        '& td': {
          borderColor: (theme) => theme.palette.brand.mono[300],
          borderWidth: 1,
          borderStyle: 'solid',
          borderLeft: 'none',
          borderTop: 'none',
          width: md ? '15%' : '10%',
          px: md ? 0 : 4,
        },
        '& td:first-of-type, & th:first-of-type': {
          textAlign: 'left',
          width: md ? '48%' : '51.77%',
          px: md ? 0 : 4,
        },
        '& td:last-of-type, & th:last-of-type': {
          borderRight: 'none',
          width: md ? '22%' : '28.2%',
        },
      }}
    >
      <thead>
        <tr>
          {Object.keys(headersTitles)?.map((header: any) => {
            return (
              <th>
                <Typography level="subh2" sx={{ fontWeight: 'md', textTransform: 'uppercase' }}>
                  {headersTitles[header]}
                </Typography>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {Array.isArray(order.shipments) &&
          order.shipments.length > 0 &&
          order.shipments.map((shipment: OrderShipmentV1) => {
            return (
              <>
                {Array.isArray(shipment.lineItems) &&
                  shipment.lineItems.length > 0 &&
                  shipment.lineItems.map((item: OrderLineItemV1, itemIndex: number) => {
                    const existManualDiscount = !!item.manualDiscountTotal && Number(item.manualDiscountTotal) > 0;
                    return (
                      <tr key={item.id}>
                        <td style={{ minWidth: 260 }}>
                          <ProductLineItemInfoV1 item={item} />
                        </td>
                        <td>
                          <PriceDisplay
                            price={item?.isGift ? '0' : item.displayPrice}
                            strikeThroughPrice={!item?.isGift && existManualDiscount ? item.originalPrice : undefined}
                            showFree={true}
                          />
                        </td>
                        <td>
                          <Typography level="body2">{item.quantity || ''}</Typography>
                        </td>
                        <td
                          style={{
                            ...(itemIndex < shipment.lineItems.length - 1 &&
                              shipment.lineItems.length > 1 && { borderBottom: 'none' }),
                          }}
                        >
                          {/* 一个shipment只展示一个OrderShipmentState */}
                          {itemIndex === 0 ? (
                            <OrderShipmentStateV1 shipment={shipment} orderNumber={order.number} />
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
              </>
            );
          })}
        {/* ================= service items ================= */}
        {Array.isArray(order?.addOnServiceLineItems) &&
          order?.addOnServiceLineItems?.length > 0 &&
          order?.addOnServiceLineItems.map((item: AddOnServiceLineItemV1, index: number) => {
            return (
              <tr key={item.id}>
                <td>
                  <Typography level="body2">{item.productName}</Typography>
                </td>
                <td>
                  {/* <Typography level="body2">{toPrice(+item.displayPrice, true)}</Typography> */}
                  <PriceDisplay price={item.displayPrice} showFree={true} />
                </td>
                <td>
                  <Typography level="body2">{item.quantity}</Typography>
                </td>
                <td
                  style={{
                    ...(index < (order?.addOnServiceLineItems?.length ?? 0) - 1 &&
                      (order?.addOnServiceLineItems?.length ?? 0) > 1 && { borderBottom: 'none' }),
                  }}
                >
                  {index === 0 ? <Typography level="body2">-</Typography> : null}
                </td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  );
}

export default WebOrderItemTableV1;
