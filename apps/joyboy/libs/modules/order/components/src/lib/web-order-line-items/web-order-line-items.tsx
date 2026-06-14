'use client';

import { Typography, Table, useBreakpoints } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ProductLineItemInfo } from '@castlery/shared-components';
import { selectModifiedOrderItems } from '@castlery/modules-order-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { OrderShipmentState } from './order-shipment-state/order-shipment-state';

export function WebOrderItemTable({ order }: { order: any }) {
  const { md } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderItemTable',
  });
  const headersTitles = t('tableHeader', { returnObjects: true });
  const modifiedOrderItems = useAppSelector((state) => selectModifiedOrderItems(state, order.id));

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
          {Object.keys(headersTitles)?.map((header: string) => {
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
        {modifiedOrderItems.map((shipment: any) => {
          return (
            <>
              {shipment.line_items.map((item: any, itemIndex: number) => (
                <>
                  <tr key={item.id}>
                    <td style={{ minWidth: 260 }}>
                      <ProductLineItemInfo item={item} />
                    </td>

                    <td>
                      <Typography level="body1">
                        {item.isGift
                          ? toPrice(0, true)
                          : toPrice((+item.amount + (+item.manual_discount_total || 0)) / item.quantity, true)}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body2">{item.quantity || ''}</Typography>
                    </td>
                    <td
                      style={{
                        ...(itemIndex < shipment.line_items.length - 1 &&
                          shipment.line_items.length > 1 && { borderBottom: 'none' }),
                      }}
                    >
                      {itemIndex === 0 ? <OrderShipmentState shipment={shipment} orderNumber={order.number} /> : null}
                    </td>
                  </tr>
                </>
              ))}
            </>
          );
        })}
        {/* ================= service items ================= */}
        {order.addon_service_line_items?.map((item: any, index: number) => {
          return (
            <tr key={item.id}>
              <td>
                <Typography level="body2">{item.variant.name}</Typography>
              </td>
              <td>
                <Typography level="body2">{toPrice(+item.total / item.quantity, true)}</Typography>
              </td>
              <td>
                <Typography level="body2">{item.quantity}</Typography>
              </td>
              <td
                style={{
                  ...(index < order.addon_service_line_items.length - 1 &&
                    order.addon_service_line_items.length > 1 && { borderBottom: 'none' }),
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

export default WebOrderItemTable;
