// eslint-disable
import { Box, Typography, useBreakpoints } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder } from '@castlery/modules-order-domain';
import { selectFreeGiftBreakdown } from '@castlery/modules-promotion-domain';
import { EcEnv } from '@castlery/config';
import type { Order } from '@castlery/types';
import { usePriceBreakCampaign } from '../../hook/use-price-break-campaign';
import { ChooseFreeGift } from '../campaign-free-gift';
import { CheckCircle } from '@castlery/fortress/Icons';
import React, { useEffect, useMemo, useCallback } from 'react';
import { dt, EventsNames } from '@castlery/data-tracking-events';
import { logger } from '@castlery/observability/client';

export const PosPromotionHint = React.memo(() => {
  const { desktop } = useBreakpoints();
  const order = useAppSelector(selectOrder) as Order;
  const { currentPriceBreakCampaign, priceBreakCampaign } = usePriceBreakCampaign();
  const { orderCampaignGift, allFreeGiftCampaignPromotion, validCampaignGiftPromotion } = useAppSelector((state) =>
    selectFreeGiftBreakdown(state)
  );

  const {
    item_total_exclude_gift: rawItemTotal = 0,
    item_count_exclude_gift: rawItemCount = 0,
    line_items,
  } = order ?? {};

  const deliveryShipments =
    order?.shipments?.filter((shipment) =>
      shipment.manifest?.some((itemId) => {
        const lineItem = line_items?.find((item) => item.id === itemId);
        return lineItem && !lineItem.preferred_self_collection;
      })
    ) ?? [];
  const isSingleDeliveryShipment = deliveryShipments.length === 1;

  const selfCarryTotal = line_items.reduce(
    (acc, item) => acc + Number(item.preferred_self_collection ? item.price : 0),
    0
  );
  const itemTotal = Number(rawItemTotal);
  const itemCount = Number(rawItemCount);

  // 通用样式变量
  const commonStyles = useMemo(
    () => ({
      // 进度条容器样式
      progressBarContainer: {
        backgroundColor: '#F3EFE7',
        height: '8px',
        width: '100%',
        position: 'relative' as const,
        marginTop: '21px',
      },

      // 进度条填充样式
      progressBarFill: {
        backgroundColor: (theme: any) => theme.palette.brand.terracotta[500],
        display: 'block',
        height: '100%',
        transition: 'width 0.5s cubic-bezier(0.35, 0.95, 0.67, 0.99)',
      },

      // 徽章容器样式
      badgeContainer: {
        position: 'absolute' as const,
        right: -1,
        top: '50%',
        transform: 'translate(0, -50%)',
        backgroundColor: '#fff',
        borderRadius: '50%',
        width: '17px',
        height: '17px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },

      // 图标样式
      badgeIcon: {
        height: '17px',
        width: '17px',
        fill: (theme: any) => theme.palette.brand.wheat[500],
        stroke: (theme: any) => theme.palette.brand.wheat[500],
      },

      // 文本标签基础样式
      textLabelBase: {
        position: 'absolute' as const,
        top: '-100%',
        display: { xs: 'none', sm: 'block' },
        backgroundColor: (theme: any) => theme.palette.brand.terracotta[500],
        color: '#fff',
        padding: '2px 6px',
        fontSize: '12px',
        lineHeight: '17px',
        fontWeight: 600,
        whiteSpace: 'nowrap' as const,
        borderRadius: '2px',
      },

      // 三角箭头基础样式
      arrowBase: {
        content: '""',
        display: 'block',
        position: 'absolute' as const,
        bottom: 0,
        width: 0,
        height: 0,
        border: '3px solid transparent',
        borderBottom: 'none',
        borderTopColor: (theme: any) => theme.palette.brand.terracotta[500],
      },

      // 移动端样式
      mobileStyles: {
        '@media (max-width: 768px)': {
          left: 'auto',
          right: '-10px',
          transform: 'translate(0, -10px)',
          '&::after': {
            left: 'auto',
            right: '10px',
            transform: 'translate(-100%, 100%)',
          },
        },
      },
    }),
    []
  );

  // 获取文本标签样式
  const getTextLabelStyles = useCallback(
    (isLongLabel = false) => ({
      ...commonStyles.textLabelBase,
      left: isLongLabel ? '-70%' : '50%',
      transform: isLongLabel ? 'translate(0, -10px)' : 'translate(-50%, -10px)',
      '&::after': {
        ...commonStyles.arrowBase,
        left: isLongLabel ? '83%' : '50%',
        transform: isLongLabel ? 'translate(-100%, 100%)' : 'translate(-50%, 100%)',
      },
      ...commonStyles.mobileStyles,
    }),
    [commonStyles]
  );

  // 计算赠品相关状态
  const haveGiftPromotion = allFreeGiftCampaignPromotion.length > 0;

  // 判断是否有已选择的赠品（支持campaign和coupon两种类型）
  const chosenGift = orderCampaignGift;

  // 免运费相关逻辑
  let FREE_SHIPPING_LIMIT = Infinity;
  let showFreeShippingHint = false;
  let freeShippingComplete = false;

  if (isSingleDeliveryShipment || EcEnv.NEXT_PUBLIC_COUNTRY === 'SG') {
    const shipThreshold = isSingleDeliveryShipment
      ? deliveryShipments[0]?.free_shipping_threshold
      : order?.shipments[0]?.free_shipping_threshold;
    const isSg = EcEnv.NEXT_PUBLIC_COUNTRY === 'SG';
    FREE_SHIPPING_LIMIT =
      !shipThreshold || Number.isNaN(shipThreshold)
        ? isSg
          ? 500
          : Infinity
        : isSg
        ? Number(shipThreshold) + 0.01
        : Number(shipThreshold);
    showFreeShippingHint = Number.isFinite(FREE_SHIPPING_LIMIT);
    freeShippingComplete = Number(itemTotal) - Number(selfCarryTotal) >= FREE_SHIPPING_LIMIT;
  }

  // 追踪价格阶梯活动展示
  useEffect(() => {
    if (showFreeShippingHint) return;
    if (currentPriceBreakCampaign) {
      dt.track(EventsNames.EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION)({
        campaignName: priceBreakCampaign?.campaignName,
        discount: currentPriceBreakCampaign.label,
      });
    }
  }, [priceBreakCampaign, currentPriceBreakCampaign, showFreeShippingHint]);

  // 优先级处理
  // 1. 未达到免运费条件时，优先显示免运费进度条
  // 2. 已达到免运费条件时，优先显示全店活动或赠品促销
  if (showFreeShippingHint && freeShippingComplete && (currentPriceBreakCampaign || haveGiftPromotion)) {
    showFreeShippingHint = false;
  }

  // 赠品横幅显示逻辑 - 支持campaign和coupon两种类型
  let freeGiftHint = false;
  if (!chosenGift && validCampaignGiftPromotion) {
    freeGiftHint = true;
  }

  // 赠品横幅文本状态 - 兼容新的数据结构
  const freeGiftBannerTextStatus = !chosenGift && validCampaignGiftPromotion;

  const helperLinkTrigger = useCallback((priceBreakCampaign: any, currentPriceBreakCampaign: any) => {
    if (!priceBreakCampaign.link) return false;
    try {
      dt.track(EventsNames.EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK)({
        campaignName: priceBreakCampaign.campaignName,
        discount: currentPriceBreakCampaign.label,
      });
    } catch (error) {
      // Tracking error should not block the main flow
      logger.error('Failed to track campaign progress bar link click', {
        error,
        campaignName: priceBreakCampaign.campaignName,
        discount: currentPriceBreakCampaign.label,
      });
    }
  }, []);

  const isEmptyFragment = (element: React.ReactNode): boolean => {
    if (!element) return true;
    if (React.isValidElement(element) && element.type === React.Fragment) {
      const children = React.Children.toArray(element.props.children);
      return children.length === 0 || children.every(isEmptyFragment);
    }

    return false;
  };

  let promotionHint = null;

  if (showFreeShippingHint) {
    promotionHint = (
      <Box>
        <Typography
          level="caption1"
          sx={{
            marginBottom: '5px',
            color: '#323433',
          }}
        >
          {freeGiftBannerTextStatus && (
            <Box component="span" sx={{ color: '#323433', mr: 1 }}>
              Free gift unlocked！
            </Box>
          )}
          {freeShippingComplete ? (
            <>
              Congrats, you can now enjoy <strong>Free Shipping</strong>!
            </>
          ) : (
            <>
              You are <strong>{toPrice(FREE_SHIPPING_LIMIT - (Number(itemTotal) - Number(selfCarryTotal)))}</strong>{' '}
              away from Free Shipping!
            </>
          )}
        </Typography>
        <Box sx={commonStyles.progressBarContainer}>
          <Box
            sx={{
              ...commonStyles.progressBarFill,
              width: `${
                freeShippingComplete
                  ? '100%'
                  : `${Math.min(100, ((Number(itemTotal) - Number(selfCarryTotal)) / FREE_SHIPPING_LIMIT) * 100)}%`
              }`,
            }}
          />

          <Box sx={commonStyles.badgeContainer}>
            <CheckCircle sx={commonStyles.badgeIcon} />
            <Box sx={getTextLabelStyles(false)}>FREE!</Box>
          </Box>
        </Box>
      </Box>
    );
  } else if (currentPriceBreakCampaign) {
    promotionHint = (
      <Box>
        <Typography
          level="caption1"
          sx={{
            marginBottom: '5px',
            color: (theme) => theme.palette.brand.terracotta[500],
            '& a': {
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }}
        >
          {/* 显示赠品解锁状态 */}
          {freeGiftBannerTextStatus && (
            <Box component="span" sx={{ color: '#323433', mr: 1 }}>
              Free gift unlocked！
            </Box>
          )}

          <Box
            component="a"
            onClick={(e) => {
              e.preventDefault();
              helperLinkTrigger(priceBreakCampaign, currentPriceBreakCampaign);
              const webDomain =
                EcEnv.NEXT_PUBLIC_PRODUCTION_ENV === 'production'
                  ? 'https://www.castlery.com'
                  : 'https://www-test.castlery.com';
              const webUrl = `${webDomain}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${priceBreakCampaign?.link}`;
              window.open(webUrl, '_blank');
            }}
          >
            <strong>{priceBreakCampaign?.campaignName}</strong>
          </Box>
          <Box component="span">:</Box>
          <Box component="span" sx={{ color: (theme) => theme.palette.brand.charcoal[800], ml: '4px' }}>
            {toPrice(Math.max(0, currentPriceBreakCampaign.limit - itemTotal))} more to get{' '}
            {currentPriceBreakCampaign.label}!
          </Box>
        </Typography>

        <Box sx={commonStyles.progressBarContainer}>
          <Box
            sx={{
              ...commonStyles.progressBarFill,
              width: `${Math.min(100, (itemTotal / currentPriceBreakCampaign.limit) * 100)}%`,
            }}
          />

          <Box sx={commonStyles.badgeContainer}>
            {currentPriceBreakCampaign.icon && (
              // <SvgIcon name={currentPriceBreakCampaign.icon} sx={commonStyles.badgeIcon} />
              <svg role="img" aria-label={currentPriceBreakCampaign.icon}>
                <use xlinkHref={`#${currentPriceBreakCampaign.icon}`} />
              </svg>
            )}
            {currentPriceBreakCampaign.label && (
              <Box
                sx={{
                  ...getTextLabelStyles((currentPriceBreakCampaign as any)?.mode === 'long'),
                  fontSize: '10px',
                  padding: '1px 2px',
                }}
              >
                {currentPriceBreakCampaign.label}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  } else if (haveGiftPromotion && !validCampaignGiftPromotion) {
    // 使用新的数据结构处理赠品促销逻辑
    const firstGiftCampaign = allFreeGiftCampaignPromotion[0];

    const { quantity, amount, purchaseType } = firstGiftCampaign.min_spend;
    const FREE_GIFT_LIMIT = purchaseType === 1 ? +amount?.value : +quantity;
    const currentValue = purchaseType === 1 ? itemTotal : itemCount;
    const currentGiftGap = FREE_GIFT_LIMIT - currentValue;
    if (FREE_GIFT_LIMIT > 0 && currentGiftGap > 0) {
      promotionHint = (
        <>
          <Typography level="caption1">
            <Box>
              {desktop ? 'Only ' : ''}
              <strong>{purchaseType === 1 ? toPrice(currentGiftGap) : `Quantity ${currentGiftGap} `}</strong>
              more to unlock Free Gift
            </Box>
          </Typography>

          <Box sx={commonStyles.progressBarContainer}>
            {/* 进度条填充 */}
            <Box
              sx={{
                ...commonStyles.progressBarFill,
                width: `${FREE_GIFT_LIMIT > 0 ? (currentValue / FREE_GIFT_LIMIT) * 100 : 0}%`,
              }}
            />
            {/* <Box sx={commonStyles.badgeContainer}>
              <SvgIcon name="gift" sx={commonStyles.badgeIcon} />
              <Box sx={getTextLabelStyles(false)}>FREE!</Box>
            </Box> */}
          </Box>
        </>
      );
    }
  }

  const notShowPromotionHint = isEmptyFragment(promotionHint) && !freeGiftHint;
  // 判断promotionHint 是一个空标签
  if (notShowPromotionHint) return null;

  return (
    <>
      <Box sx={{ padding: '12px 8px' }}>
        {/* 赠品活动展示  */}
        <Box
          sx={{
            padding: '0 6px',
          }}
        >
          {promotionHint}
        </Box>
        {freeGiftHint && (
          <Box sx={{ marginTop: !isEmptyFragment(promotionHint) ? '10px' : 0 }}>
            {!currentPriceBreakCampaign && !showFreeShippingHint && (
              <>
                <Typography level="caption1" sx={{ mb: 1 }}>
                  Congratulations, you have unlocked a Free Gift!
                </Typography>
                <Box sx={{ ...commonStyles.progressBarContainer, mb: 1 }}>
                  <Box
                    sx={{
                      ...commonStyles.progressBarFill,
                      width: `100%`,
                    }}
                  />
                  {/* <Box sx={commonStyles.badgeContainer}> */}
                  {/* <SvgIcon name="gift" sx={commonStyles.badgeIcon} />
                    <Box sx={getTextLabelStyles(false)}>FREE!</Box> */}
                  {/* </Box> */}
                </Box>
              </>
            )}
            <ChooseFreeGift />
          </Box>
        )}
      </Box>
    </>
  );
});

export default PosPromotionHint;
