import { Order } from '@castlery/modules-user-domain';
import * as React from 'react';
import { toPrice } from '@castlery/utils';
import { EcEnv } from '@castlery/config';
import { Grid } from '@castlery/fortress';
import { SalesOrderCell } from './sales-order-cell';
import { Box, Typography, TypographySystem } from '@castlery/fortress';
import { orderFeatureService } from '@castlery/modules-order-services';

interface DetailsFooterProps {
  order: Order;
  sx?: any;
}

export const DetailsFooterV2 = (props: DetailsFooterProps) => {
  const { order, sx } = props;
  const taxAddonDescription = orderFeatureService.getOrderSummaryTotalAddonDescription();
  const showSalesTax = orderFeatureService.showSalesTax;
  const localCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();
  const footerDisplay = React.useMemo(() => {
    return {
      '& .MuiBox-root': {
        'justify-content': 'space-between',
      },
    };
  }, []);
  const coupon = React.useMemo(() => {
    return order.coupon ? +order.coupon.amount : 0;
  }, [order.coupon]);
  const manualDiscountTotal = React.useMemo(() => {
    return order.line_items.reduce((result, item) => {
      return result + (+item.manual_discount_total || 0);
    }, 0);
  }, [order]);

  const orderGiftTotal = React.useMemo(() => {
    return order.line_items
      .filter((item) => !!item.gift_id || !!item.is_gift)
      .reduce((result, item) => result + (Number(item.amount) || 0), 0);
  }, [order]);

  const servicePromo = order.promotions
    .filter((promotion) => promotion.adjustable_type === 'shipment_service_fee')
    .reduce((acc, promotion) => acc + +promotion.amount, 0);
  const shipmentPromo = order.promotions
    .filter((promotion) => promotion.adjustable_type === 'shipment')
    .reduce((acc, promotion) => acc + +promotion.amount, 0);

  // promotion 总价需要减掉 gift 的价格
  const promotionGiftTotal = order.promotions
    .filter((promotion) => promotion.adjustable_type === 'gift')
    .reduce((result, promotion) => result + Number(promotion.amount), 0);

  const promoTotal =
    +order.adjustment_total -
    coupon -
    manualDiscountTotal -
    +order.additional_tax_total -
    shipmentPromo -
    servicePromo -
    promotionGiftTotal;
  const servicesTotal = React.useMemo(() => {
    return +order.service_fee_total || 0; //service fee
  }, [order]);
  const taxTotal = React.useMemo(() => {
    return +order.additional_tax_total; //tax. 这个字段已经做了国家区分，sg中的additional_tax_total始终为0，其他国家才会有值
  }, [order]);

  const footerConfig = React.useMemo(() => {
    return [
      {
        cellInfo: {
          label: 'Items Subtotal',
          value: `${toPrice(+order.item_total + manualDiscountTotal - orderGiftTotal)}`,
        },
        xs: 12,
        align: 'row',
        sx: footerDisplay,
      },
      {
        cellInfo: {
          label: 'Warranty Subtotal',
          value: +order.warranty_total > 0 ? `${toPrice(+order.warranty_total)}` : '',
        },
        xs: 12,
        align: 'row',
        sx: footerDisplay,
      },
      {
        cellInfo: {
          renderOptions: +order.shipment_total && (
            <>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginRight: '0.5rem',
                  display: 'inline-block',
                }}
              >
                Shipping
              </Typography>
              {shipmentPromo === 0 ? (
                <Typography sx={{ color: '#666', fontSize: '1rem' }}>
                  {toPrice(+order.shipment_total - servicesTotal)}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    sx={{ color: '#666', fontSize: '1rem', marginRight: '0.5rem', textDecoration: 'line-through' }}
                  >
                    {toPrice(+order.shipment_total - servicesTotal)}
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '1rem' }}>
                    {toPrice(+order.shipment_total - servicesTotal + shipmentPromo, true)}
                  </Typography>
                </Box>
              )}
            </>
          ),
        },
        xs: 12,
        align: 'row',
        sx: footerDisplay,
      },
      {
        cellInfo: {
          renderOptions: servicesTotal && (
            <>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginRight: '0.5rem',
                  display: 'inline-block',
                }}
              >
                Services
              </Typography>
              {servicePromo === 0 ? (
                <Typography sx={{ color: '#666', fontSize: '1rem' }}>{toPrice(servicesTotal)}</Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    sx={{ color: '#666', fontSize: '1rem', marginRight: '0.5rem', textDecoration: 'line-through' }}
                  >
                    {toPrice(servicesTotal)}
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '1rem' }}>
                    {toPrice(servicesTotal + servicePromo, true)}
                  </Typography>
                </Box>
              )}
            </>
          ),
          // value: servicesTotal ? `${toPrice(servicesTotal)}` : '',
        },
        xs: 12,
        align: 'row',
        sx: footerDisplay,
      },
      {
        cellInfo: {
          label: 'Promotion',
          value: promoTotal ? `${toPrice(promoTotal)}` : '',
        },
        xs: 12,
        align: 'row',
        sx: footerDisplay,
      },
      {
        cellInfo: {
          label: order.coupon ? (
            <Box>
              <Typography
                level="body2"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginRight: '0.5rem',
                  display: 'inline-block',
                }}
              >
                Coupon Code:
              </Typography>
              <strong
                style={{
                  color: '#d23b3f',
                }}
              >
                {order.coupon.code.toUpperCase()}
              </strong>
            </Box>
          ) : (
            ''
          ),
          renderOptions: order.coupon ? (
            <Typography
              level="body2"
              sx={{
                color: '#666',
                fontSize: '1rem',
              }}
            >
              {order.coupon.free_gift ? 'Free' : toPrice(+order.coupon.amount + +order.warranty_total_discount)}
            </Typography>
          ) : undefined,
        },
        xs: 12,
        align: 'row',
        sx: footerDisplay,
      },
      ...(showSalesTax
        ? [
            {
              cellInfo: {
                label: 'Sales Tax',
                value: taxTotal ? `${toPrice(taxTotal)}` : '',
              },
              xs: 12,
              align: 'row',
              sx: footerDisplay,
            },
          ]
        : []),
      {
        cellInfo: {
          label: (
            <Box
              sx={{
                color: 'var(--fortress-palette-text-primary, var(--fortress-palette-neutral-800, #171A1C))',
              }}
            >
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginRight: '0.5rem',
                }}
              >
                Total
              </span>
              <em
                style={{
                  color: '#888',
                  fontWeight: 'normal',
                  fontSize: '0.8rem',
                  fontStyle: 'normal',
                }}
              >
                ({taxAddonDescription})
              </em>
            </Box>
          ),
          value: `${toPrice(+order.total)}`,
        },
        xs: 12,
        align: 'row',
        sx: {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '1px',
            backgroundColor: '#eee',
          },
          '& p': {
            color: '#424242',
            fontWeight: 600,
            fontSize: '1.2rem',
          },
          ...footerDisplay,
        },
      },
    ];
  }, [
    footerDisplay,
    localCountry,
    manualDiscountTotal,
    order.coupon,
    order.item_total,
    order.shipment_total,
    order.total,
    order.warranty_total,
    promoTotal,
    servicesTotal,
    taxTotal,
    showSalesTax,
    taxAddonDescription,
  ]);

  return (
    <Grid sx={sx} container rowSpacing={1}>
      {footerConfig.map((cell) =>
        cell.cellInfo.value || cell.cellInfo.renderOptions ? <SalesOrderCell {...cell} /> : ''
      )}
    </Grid>
  );
};
