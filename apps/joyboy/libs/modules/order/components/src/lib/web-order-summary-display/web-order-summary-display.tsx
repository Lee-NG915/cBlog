'use client';
import { Divider, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { orderFeatureService } from '@castlery/modules-order-services';
import { useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

interface WebOrderSummaryDisplayV2Props {
  order: any;
}
export function WebOrderSummaryDisplayV2({ order }: WebOrderSummaryDisplayV2Props) {
  const { desktop, mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderSummaryDisplay',
  });
  const isNotZero = (value: string) => {
    return !!value && Number(value) !== 0;
  };
  const showExtraDescription = orderFeatureService.showSummaryTotalAddonDescription;

  const summaryData = useMemo(() => {
    // calculate promotion
    let coupon;
    let promoTotal;
    let manualDiscountTotal;
    let additionalTaxTotal;
    let shipmentTotal;
    let servicesTotal;
    let warrantyTotal;
    let giftTotal;
    let servicePromo;
    let shipmentPromo;
    if (order) {
      giftTotal = order.line_items
        .filter((item: any) => !!item.is_gift)
        .reduce((result: any, item: any) => result + (Number(item.amount) || 0), 0);
      manualDiscountTotal = order.line_items.reduce(
        (result: any, item: any) => result + +(item.manual_discount_total || ''),
        0
      );
      coupon = order.coupon ? +order.coupon.amount : 0;
      additionalTaxTotal = +order.additional_tax_total;
      servicePromo = order.promotions
        .filter((promotion: any) => promotion.adjustable_type === 'shipment_service_fee')
        .reduce((acc: any, promotion: any) => acc + +promotion.amount, 0);
      shipmentPromo = order.promotions
        .filter((promotion: any) => promotion.adjustable_type === 'shipment')
        .reduce((acc: any, promotion: any) => acc + +promotion.amount, 0);

      // promotion 总价需要减掉 gift 的价格
      const promotionGiftTotal = order.promotions
        .filter((promotion: any) => promotion.adjustable_type === 'gift')
        .reduce((result: any, promotion: any) => result + Math.abs(Number(promotion.amount)), 0);
      promoTotal =
        +order.adjustment_total -
        coupon -
        manualDiscountTotal -
        additionalTaxTotal -
        shipmentPromo -
        servicePromo +
        promotionGiftTotal;

      servicesTotal = +order.service_fee_total || 0;
      shipmentTotal = +order.shipment_total - servicesTotal;
      warrantyTotal = +order.warranty_total || 0;
    }
    return {
      ...order,
      coupon,
      promoTotal,
      manualDiscountTotal,
      additionalTaxTotal,
      shipmentTotal,
      servicesTotal,
      warrantyTotal,
      giftTotal,
      servicePromo,
      shipmentPromo,
    };
  }, [order]);

  return (
    <Stack direction={desktop ? 'row-reverse' : 'column'}>
      <Stack
        sx={{
          ...(desktop ? { minWidth: 573, width: '33.16vw' } : { width: '100%', pb: 8 }),
          background: (theme) => theme.palette.brand.warmLinen[500],
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            px: mobile ? 4 : 6,
            py: desktop ? 5 : 4,
          }}
        >
          <Typography level="body2">{t('itemSubtotal')}</Typography>
          <Typography level="body1">
            {toPrice(Number(summaryData.item_total + summaryData.manualDiscountTotal - summaryData.giftTotal), true)}
          </Typography>
        </Stack>
        <Divider />
        {isNotZero(summaryData.warrantyTotal) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: mobile ? 4 : 6,
                py: desktop ? 5 : 4,
              }}
            >
              <Typography level="body2">{t('warranty')}</Typography>
              <Typography level="body1">{toPrice(Number(summaryData.warrantyTotal))}</Typography>
            </Stack>
            <Divider />
          </>
        )}

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            px: mobile ? 4 : 6,
            py: desktop ? 5 : 4,
          }}
        >
          <Typography level="body2">{t('shipping')}</Typography>
          {summaryData.shipmentPromo === 0 ? (
            <Typography level="body1">{toPrice(Number(summaryData.shipmentTotal), true)}</Typography>
          ) : (
            <Stack direction="row" spacing={1}>
              <Typography
                level="body1"
                sx={{
                  textDecoration: 'line-through',
                }}
              >
                {toPrice(Number(summaryData.shipmentTotal))}
              </Typography>
              <Typography level="body1">
                {toPrice(Number(summaryData.shipmentTotal + summaryData.shipmentPromo), true)}
              </Typography>
            </Stack>
          )}
        </Stack>
        <Divider />
        {isNotZero(summaryData.servicesTotal) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: mobile ? 4 : 6,
                py: desktop ? 5 : 4,
              }}
            >
              <Typography level="body2">{t('service')}</Typography>
              {summaryData.servicePromo === 0 ? (
                <Typography level="body1">{toPrice(Number(summaryData.servicesTotal))}</Typography>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Typography
                    level="body1"
                    sx={{
                      textDecoration: 'line-through',
                    }}
                  >
                    {toPrice(Number(summaryData.servicesTotal))}
                  </Typography>
                  <Typography level="body1">
                    {toPrice(Number(summaryData.servicesTotal + summaryData.servicePromo), true)}
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Divider />
          </>
        )}
        {isNotZero(summaryData.promoTotal) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: mobile ? 4 : 6,
                py: desktop ? 5 : 4,
              }}
            >
              <Typography level="body2">{t('promotion')}</Typography>
              {/* toPrice(promoTotal) */}
              <Typography level="body1">{toPrice(Number(summaryData.promoTotal))}</Typography>
            </Stack>
            <Divider />
          </>
        )}
        {isNotZero(summaryData.coupon) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: mobile ? 4 : 6,
                py: desktop ? 5 : 4,
              }}
            >
              <Typography level="body2">
                {t('coupon')}: <strong>{order.coupon?.code?.toUpperCase()}</strong>
              </Typography>
              <Typography level="body1">
                {order.coupon?.free_gift
                  ? 'Free Gift'
                  : toPrice(Number(summaryData.coupon) + Number(order.warranty_total_discount || 0))}
              </Typography>
            </Stack>
            <Divider />
          </>
        )}
        {isNotZero(summaryData.additionalTaxTotal) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: mobile ? 4 : 6,
                py: desktop ? 5 : 4,
              }}
            >
              <Typography level="body2">{t('tax')}</Typography>
              <Typography level="body1">{toPrice(Number(summaryData.additionalTaxTotal))}</Typography>
            </Stack>
            <Divider />
          </>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            px: mobile ? 4 : 6,
            py: desktop ? 5 : 4,
          }}
        >
          <Typography level="body2">
            {t('total')}
            {showExtraDescription && <Typography level="body2">&nbsp;{t('totalAddonDescription')}</Typography>}
          </Typography>
          <Typography level="body1">{toPrice(Number(summaryData.total), true)}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
