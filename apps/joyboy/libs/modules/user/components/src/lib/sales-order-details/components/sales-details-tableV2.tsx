import { Order } from '@castlery/modules-user-domain';
import { Box, Table, useBreakpoints } from '@castlery/fortress';
import * as React from 'react';
import { toPrice } from '@castlery/utils';
import SalesDetailsImage from './sales-details-image';
import DetailsLineOptions from './details-line-options';
import DetailBundleOptions from './details-bundle-options';
import DetailsShipmentStatus from './details-shipment-status';
interface SalesDetailsTableProps {
  order: Order;
  sx?: any;
}

export function SalesDetailsTableV2(props: SalesDetailsTableProps) {
  const { order, sx } = props;
  const { mobile } = useBreakpoints();
  const headerConfig = React.useMemo(() => {
    return [
      {
        label: 'Item Description',
        width: '40%',
        minWidth: 380,
      },
      {
        label: 'Price',
        width: '20%',
        minWidth: 200,
      },
      {
        label: 'Qty',
        width: '10%',
        minWidth: 200,
      },
      {
        label: 'Shipping Status',
        width: '30%',
        minWidth: 250,
      },
    ];
  }, []);
  const items = order.shipments.map((shipment) => {
    const lineItems = shipment.manifest.map((m: any) => order.line_items.find((i) => i.id === m));

    return lineItems.map((i: any, index: number) => {
      const price =
        i.is_gift || !!i.gift_id ? (
          <div>
            <span
              style={{
                display: 'block',
                color: '#d23b3f',
              }}
            >
              Free
            </span>
          </div>
        ) : (
          <div
          // className={`${style.table}__price`}
          >
            {+i.variant.price !== +i.variant.list_price && (
              <span
                // className={`${style.table}__price__original`}
                style={{
                  display: 'block',
                  color: '#aaa',
                  textDecoration: 'line-through',
                }}
              >
                {toPrice(i.variant.list_price)}
              </span>
            )}
            <span
              style={
                +i.variant.price !== +i.variant.list_price
                  ? {
                      display: 'block',
                      color: '#d23b3f',
                    }
                  : {}
              }
            >
              {toPrice(i.variant.price)}
            </span>
          </div>
        );

      return (
        <tr key={`${shipment.id}-${index}`}>
          <td>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <SalesDetailsImage lineItem={i} />
              <Box
                sx={{
                  flex: 3,
                  textAlign: 'left',
                  paddingTop: '5px',
                  paddingLeft: !mobile ? '10px' : '5px',
                }}
              >
                <Box>{i.product_type === 'swatch' ? i.variant.name : i.variant.product_name}</Box>
                <DetailsLineOptions
                  lineItem={i}
                  sx={{
                    color: '#888',
                  }}
                />
                {i.warranty_items && (
                  <div>
                    <p>{`Extended warranty: ${i.warranty_items.duration_months} months - ${toPrice(
                      i.warranty_items.warranty_offer_price
                    )}`}</p>
                  </div>
                )}
              </Box>
            </Box>
            <DetailBundleOptions lineItem={i} size="80px" />
          </td>
          <td
            style={{
              textAlign: 'center',
            }}
          >
            {price}
          </td>
          <td
            style={{
              textAlign: 'center',
            }}
          >
            {i.quantity}
          </td>
          {index === 0 && (
            <td
              style={{
                textAlign: 'center',
              }}
              rowSpan={shipment.manifest.length}
            >
              <DetailsShipmentStatus
                shipment={shipment}
                sx={{
                  '& > span': {
                    display: 'block',
                  },
                  '& > strong': {
                    fontWeight: 600,
                  },
                  '& > a': {
                    color: '#d23b3f',
                  },
                }}
              />
            </td>
          )}
        </tr>
      );
    });
  });

  const services = order.addon_service_line_items.map((item) => (
    <tr key={item.id}>
      <td>{item.variant.name}</td>
      <td
        style={{
          textAlign: 'center',
        }}
      >
        {toPrice(item.price, true)}
      </td>
      <td
        style={{
          textAlign: 'center',
        }}
      >
        {item.quantity}
      </td>
      <td
        style={{
          textAlign: 'center',
        }}
      >
        -
      </td>
    </tr>
  ));
  return (
    <Table borderAxis="bothBetween" sx={sx}>
      <thead>
        <tr>
          {headerConfig.map((header) => {
            return (
              <th
                style={{
                  width: header.width,
                  minWidth: header.minWidth,
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                }}
              >
                {header.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {items}
        {services}
      </tbody>
    </Table>
  );
}
