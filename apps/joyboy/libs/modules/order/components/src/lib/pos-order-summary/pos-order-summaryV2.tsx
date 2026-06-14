'use client';
import React, { useMemo, useState } from 'react';
import { Box, Stack, Typography, Divider, Button } from '@castlery/fortress';
import { calcSummary } from './util';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder } from '@castlery/modules-order-domain';
import { RowStack } from './row-stack';
import { toPrice } from '@castlery/utils';
import { ChevronUp } from '@castlery/fortress/Icons';
import { orderFeatureService } from '@castlery/modules-order-services';

interface OrderSummaryProps {
  inCheckout?: boolean;
  CouponWallet: React.ReactNode;
}
export const OrderSummaryV2: React.FC<OrderSummaryProps> = ({ CouponWallet, inCheckout = false }) => {
  const order = useAppSelector(selectOrder);
  const promotions = useMemo(
    () =>
      order?.promotions.filter(
        (p) =>
          p.adjustable_type !== 'shipment' &&
          p.adjustable_type !== 'shipment_service_fee' &&
          p.adjustable_type !== 'line_item_manual_discount'
      ) || [],
    [order]
  );
  const totalAddonDescription = orderFeatureService.getOrderSummaryTotalAddonDescription(order?.state === 'cart');
  const showSalesTax = orderFeatureService.showSalesTax;

  const [openPromotionDetails, setOpenPromotionDetails] = useState(false);

  const {
    total,
    itemTotal,
    additionalTaxTotal,
    serviceOriginal,
    serviceTotal,
    shipmentTotal,
    shipmentOriginal,
    promoTotal,
  } = useMemo(() => calcSummary(order), [order]);
  const zeroToFree = !!(order && order.line_items.length > 0);
  const payableTotal = useMemo(() => {
    if (!order || !order?.total) return 0;
    return Number(order.total) - (order.payments?.reduce((acc, payment) => acc + Number(payment.amount), 0) || 0);
  }, [order]);

  const toggleModal = () => {
    setOpenPromotionDetails(!openPromotionDetails);
  };
  return (
    <React.Fragment>
      <Box sx={{ width: '100%' }}>
        {/* ========================== item total ============================ */}
        <RowStack>
          <Typography level="body2">Items Subtotal</Typography>
          <Typography level="body2">{toPrice(itemTotal, zeroToFree)}</Typography>
        </RowStack>
        <Divider />
        {/* ========================== warranty total ============================ */}
        {!!Number(order?.warranty_total) && (
          <>
            <RowStack>
              <Typography level="body2">Warranty Subtotal</Typography>
              <Typography level="body2">{toPrice(Number(order?.warranty_total))}</Typography>
            </RowStack>
            <Divider />
          </>
        )}
        {/* ========================== shipping fee ============================ */}
        <RowStack>
          <Typography level="body2">Shipping</Typography>
          {/* =============   显示原价 ============ */}
          <RowStack sx={{ padding: 0 }}>
            {shipmentOriginal !== shipmentTotal && !!Number(shipmentOriginal) && (
              <Typography
                level="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: (theme) => theme.palette.brand.sage[500],
                }}
              >
                {toPrice(shipmentOriginal, false)}
              </Typography>
            )}
            <Typography level="body2">{toPrice(shipmentTotal, zeroToFree)}</Typography>
          </RowStack>
        </RowStack>
        <Divider />
        {/* ========================== services total ============================ */}
        {!!serviceOriginal && (
          <>
            <RowStack>
              <Typography level="body2">Services</Typography>
              <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                {serviceOriginal !== serviceTotal && (
                  <Typography
                    level="body2"
                    sx={{
                      textDecoration: 'line-through',
                      color: (theme) => theme.palette.brand.sage[500],
                    }}
                  >
                    {toPrice(serviceOriginal)}
                  </Typography>
                )}
                <Typography level="body2">{toPrice(serviceTotal, true)}</Typography>
              </Stack>
            </RowStack>
            <Divider />
          </>
        )}
        {/* ========================== promotion fee ============================ */}
        {!!promoTotal && (
          <>
            <RowStack>
              <Typography level="body2">
                Promotion
                <Button variant="tertiary" sx={{ padding: 0, minHeight: 24, ml: 1 }} onClick={toggleModal}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      level="caption2"
                      sx={{ color: (theme) => theme.palette.brand.terracotta[500], cursor: 'pointer' }}
                    >
                      More Details
                    </Typography>
                    <ChevronUp
                      sx={{
                        transform: `rotate(${openPromotionDetails ? 0 : 180}deg)`,
                        transition: 'transform 0.5s ease',
                        fill: (theme) => theme.palette.brand.terracotta[500],
                      }}
                    />
                  </Box>
                </Button>
              </Typography>
              <Typography level="body2">-{toPrice(promoTotal)}</Typography>
            </RowStack>

            <Box
              sx={{
                paddingLeft: 2,
                paddingRight: 1,
                marginBottom: openPromotionDetails ? 2 : 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxHeight: openPromotionDetails ? 1000 : 0,
                // opacity: openPromotionDetails ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.5s ease-in-out',
              }}
            >
              {promotions?.map((promotion) => (
                <Stack key={promotion.name}>
                  <Stack
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography level="caption1">{promotion.name}</Typography>
                    <Typography
                      level="caption1"
                      sx={{
                        minWidth: 60,
                        flex: 'none',
                        textAlign: 'right',
                        color: (theme) => theme.palette.brand.wheat[500],
                      }}
                    >
                      {promotion.adjustable_type === 'gift' ? 'Free' : `${toPrice(Number(promotion.amount))}`}
                    </Typography>
                  </Stack>

                  {promotion.description && (
                    <Box
                      style={{
                        color: '#767676',
                        fontSize: '12px',
                        fontWeight: '400',
                      }}
                    >
                      {promotion.description}
                    </Box>
                  )}
                </Stack>
              ))}
            </Box>

            <Divider />
          </>
        )}
        {CouponWallet}
        {/* ========================== additional tax total ============================== */}
        {showSalesTax && additionalTaxTotal !== 0 && (
          <>
            <RowStack>
              <Typography level="body2">Sales Tax</Typography>
              <Typography level="body2">{toPrice(additionalTaxTotal)}</Typography>
            </RowStack>
            <Divider />
          </>
        )}
        <RowStack>
          <Typography>
            <Typography level="subh2">Total</Typography>
            {!!totalAddonDescription && (
              <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}>
                ({totalAddonDescription})
              </Typography>
            )}
          </Typography>
          <Typography level="body2">{toPrice(total)}</Typography>
        </RowStack>
        <Divider />
        {/* ========================== amount payable ============================ */}
        {inCheckout && (
          <RowStack>
            <Typography>
              <Typography level="subh2">Amount Payable</Typography>
              {!!totalAddonDescription && (
                <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}>
                  ({totalAddonDescription})
                </Typography>
              )}
            </Typography>
            <Typography level="body2">{toPrice(payableTotal)}</Typography>
          </RowStack>
        )}
      </Box>
    </React.Fragment>
  );
};

export default OrderSummaryV2;
