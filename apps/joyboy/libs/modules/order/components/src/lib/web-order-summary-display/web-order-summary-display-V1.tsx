'use client';
import { Divider, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { orderFeatureService } from '@castlery/modules-order-services';
import { useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { OrderDataV1 } from '@castlery/types';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServiceItem, PromotionItem } from '@castlery/modules-composite-components';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PriceDisplay, priceDisplayClasses } from '@castlery/shared-components';

interface WebOrderSummaryDisplayV1Props {
  order: OrderDataV1;
}

export function WebOrderSummaryDisplayV1({ order }: WebOrderSummaryDisplayV1Props) {
  const { desktop, mobile } = useBreakpoints();
  const summary = order.summary;

  const getAbsoluteAmount = (value?: string | number | null) => {
    if (value === undefined || value === null || value === '') return '0';

    const amount = Math.abs(Number(value));
    return Number.isFinite(amount) ? String(amount) : '0';
  };

  const serviceList = useMemo(() => {
    const typeAmountMap = summary.serviceAmount.typeAmountMap;
    if (!typeAmountMap || typeof typeAmountMap !== 'object') return [];

    return Object.entries(typeAmountMap).map(([, value]) => {
      return {
        name: value?.name || '',
        amount: value.actualTotal,
        originalTotal: value.originalTotal,
      };
    });
  }, [summary.serviceAmount.typeAmountMap]);

  const promotionList = useMemo(() => {
    const promotions = summary.promotionDetails?.promotions;
    if (!Array.isArray(promotions) || promotions.length === 0) return [];

    return promotions.map((promotion) => {
      return {
        id: promotion.promotionID,
        name: promotion.promotionName || '',
        description: promotion.promotionDesc?.trim() || undefined,
        // amount: '-' + getAbsoluteAmount(promotion.discount),
        amount: promotion.actions.some((action) => action.actionType === 'ActionTypeFreeGift')
          ? 0
          : -1 * +promotion.discount || 0,
      };
    });
  }, [summary.promotionDetails?.promotions]);

  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderSummaryDisplay',
  });
  const isNotZero = (value: string) => {
    return !!value && Number(value) !== 0;
  };
  const showExtraDescription = orderFeatureService.showSummaryTotalAddonDescription;

  // 计算展示数据
  const displayData = useMemo(() => {
    return {
      // Items Subtotal - 使用 originalSubtotal（原价小计）
      itemSubtotal: summary.itemTotal.actualSubtotal,

      // Warranty
      warranty: summary.warrantyTotal.actualTotal,
      warrantyOriginal: summary.warrantyTotal.originalTotal,

      // Shipping - 使用 actualTotal（实际运费）
      shipping: summary.shippingFee.actualTotal,
      shippingOriginal: summary.shippingFee.shipmentOriginalTotal,

      // Services - 使用 actualTotal（实际服务费）
      services: summary.serviceAmount.actualTotal,
      servicesOriginal: summary.serviceAmount.originalTotal,

      // Promotion - 新接口使用 promotionDetails.displayPromotionTotal
      promotion: getAbsoluteAmount(summary.promotionDetails?.displayPromotionTotal),

      // Coupon
      coupon: summary.coupon,

      // Tax - 使用 additionalTaxTotal（美国/加拿大）或 includedTaxTotal（新加坡/澳洲/英国）
      tax: summary.tax.additionalTaxTotal || summary.tax.includedTaxTotal || '0',

      // Total
      total: summary.total,
    };
  }, [summary]);

  return (
    <Stack direction={desktop ? 'row-reverse' : 'column'}>
      <Stack
        sx={{
          ...(desktop ? { minWidth: 573, width: '33.16vw' } : { width: '100%' }),
          background: (theme) => theme.palette.brand.warmLinen[500],
        }}
      >
        {/* Items Subtotal */}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            px: mobile ? 4 : 6,
            py: desktop ? 5 : 4,
          }}
        >
          <Typography level="body2">{(t as any)('itemSubtotal')}</Typography>
          <Typography level="body2">{toPrice(Number(displayData.itemSubtotal), true)}</Typography>
        </Stack>
        <Divider />

        {/* Warranty */}
        {isNotZero(displayData.warrantyOriginal) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: mobile ? 4 : 6,
                py: desktop ? 5 : 4,
              }}
            >
              <Stack direction="row" gap={2} justifyContent="space-between" sx={{ width: '100%' }}>
                <Typography level="body2">{(t as any)('warranty')}</Typography>
                <Stack direction="row" gap={2} alignItems="center">
                  <PriceDisplay
                    price={displayData.warranty}
                    showFree={true}
                    strikeThroughPrice={displayData.warrantyOriginal}
                    typographyLevel="body2"
                  />
                </Stack>
              </Stack>
            </Stack>
            <Divider />
          </>
        )}

        {/* Shipping */}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            px: mobile ? 4 : 6,
            py: desktop ? 5 : 4,
          }}
        >
          <Stack direction="row" gap={2} justifyContent="space-between" sx={{ width: '100%' }}>
            <Typography level="body2">{(t as any)('shipping')}</Typography>
            <Stack
              direction="row"
              gap={2}
              alignItems="center"
              sx={{
                [`& .${priceDisplayClasses.price}`]: {
                  color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                },
                [`& .${priceDisplayClasses.strikeThroughPrice}`]: {
                  color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                },
              }}
            >
              <PriceDisplay
                price={displayData.shipping}
                strikeThroughPrice={displayData.shippingOriginal}
                typographyLevel="body2"
                showFree={true}
              />
            </Stack>
          </Stack>
        </Stack>
        <Divider />

        {/* Services */}
        {isNotZero(displayData.servicesOriginal) && (
          <>
            <ServiceItem
              text="Service"
              ctaText="View more details"
              amount={displayData.services ?? '0'}
              originalAmount={displayData.servicesOriginal}
              list={serviceList}
            />
            <Divider />
          </>
        )}

        {/* Promotion */}
        {isNotZero(displayData?.promotion) ||
          (promotionList.length !== 0 && (
            <>
              <PromotionItem
                text={(t as any)('promotion')}
                ctaText="View more details"
                amount={`-${displayData.promotion ?? '0'}`}
                list={promotionList}
              />
              <Divider />
            </>
          ))}

        {/* Coupon */}
        {isNotZero(displayData?.coupon?.amount) && (
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
                {(t as any)('coupon')}: <strong>{displayData.coupon?.code?.toUpperCase()}</strong>
              </Typography>
              <Typography level="body2">-{toPrice(Number(displayData.coupon?.amount))}</Typography>
            </Stack>
            <Divider />
          </>
        )}

        {/* Tax */}
        {isNotZero(displayData.tax) && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                px: mobile ? 4 : 6,
                py: desktop ? 5 : 4,
              }}
            >
              <Typography level="body2">{(t as any)('tax')}</Typography>
              <Typography level="body2">{toPrice(Number(displayData.tax))}</Typography>
            </Stack>
            <Divider />
          </>
        )}

        {/* Total */}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            px: mobile ? 4 : 6,
            py: desktop ? 5 : 4,
          }}
        >
          <Typography level="body1">
            {(t as any)('total')}
            {showExtraDescription && <Typography level="body1">&nbsp;{(t as any)('totalAddonDescription')}</Typography>}
          </Typography>
          <Typography level="body1">{toPrice(Number(displayData.total), true)}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
