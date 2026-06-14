'use client';
import { Box, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCartSummary, selectCartItemsCount } from '@castlery/modules-cart-domain';
import { accessInSG, accessInPos } from '@castlery/config';
import { dt, EventsNames } from '@castlery/data-tracking-events';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { usePriceBreakCampaign } from '../../hook/use-price-break-campaign';
import { useCampaignGifts } from '../../hook/use-campaign-gifts';
import { ChooseGiftGallery } from '../../lib/choose-gift-gallery/choose-gift-gallery';
import { InlineZipCodeBanner, InlineCreditBanner } from '@castlery/shared-components';
import { FreeShippingHint } from './free-shipping-hint';
import { PriceBreakHint } from './price-break-hint';
import { FreeGiftProgressHint } from './free-gift-progress-hint';
import { ProgressBar } from './progress-bar';
import React, { useEffect, useMemo } from 'react';
import { sharedFeatureService } from '@castlery/shared-services';

const enableHardCodedFreeShippingLimit = sharedFeatureService.enableHardCodedFreeShippingLimit;
const hardCodedFreeShippingLimit = sharedFeatureService.hardCodedFreeShippingLimit;

export interface PromotionHintProps {
  showCreditBanner?: boolean;
  showZipCodeBanner?: boolean;
  showChooseGiftGallery?: boolean;
}

export const PromotionHint = React.memo(function PromotionHint({
  showCreditBanner = true,
  showZipCodeBanner = true,
  showChooseGiftGallery = true,
}: PromotionHintProps) {
  const { desktop, mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);
  const cartSummary = useAppSelector(selectCartSummary);
  const cartItemsCount = useAppSelector(selectCartItemsCount);

  const { currentPriceBreakCampaign, priceBreakCampaign } = usePriceBreakCampaign();
  const { freeGiftBreakdown } = useCampaignGifts();
  const { orderCampaignGift, allFreeGiftCampaignPromotion, validCampaignGiftPromotion } = freeGiftBreakdown;

  const isSingleShipment =
    Array.isArray(cartSummary?.shippingFee?.shipments) && cartSummary?.shippingFee?.shipments?.length === 1;
  const itemTotal = cartSummary?.itemTotal?.actualSubtotal ? +cartSummary.itemTotal.actualSubtotal : 0;
  const itemCount = cartItemsCount ?? 0;

  const haveGiftPromotion = Array.isArray(allFreeGiftCampaignPromotion) && allFreeGiftCampaignPromotion.length > 0;

  const freeGiftHint = !orderCampaignGift && !!validCampaignGiftPromotion;

  const { FREE_SHIPPING_LIMIT, freeShippingComplete, showFreeShippingHint } = useMemo(() => {
    let limit = Infinity;
    let complete = false;

    // SG is a special case, always support free shipping condition in promotion hint, whether the shipment is single or more than one.
    if (isSingleShipment || accessInSG) {
      const shipThreshold = cartSummary?.shippingFee?.shipments[0]?.freeShippingThreshold;
      const thresholdNum = Number(shipThreshold);
      limit =
        !shipThreshold || Number.isNaN(thresholdNum) || thresholdNum > 99999
          ? enableHardCodedFreeShippingLimit
            ? hardCodedFreeShippingLimit
            : Infinity
          : thresholdNum;
      complete = itemTotal >= limit;
    }

    const show = Number.isFinite(limit) && !(complete && (currentPriceBreakCampaign || haveGiftPromotion));

    return { FREE_SHIPPING_LIMIT: limit, freeShippingComplete: complete, showFreeShippingHint: show };
  }, [isSingleShipment, cartSummary?.shippingFee?.shipments, itemTotal, currentPriceBreakCampaign, haveGiftPromotion]);

  useEffect(() => {
    if (showFreeShippingHint) return;
    if (currentPriceBreakCampaign) {
      dt.track(EventsNames.EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION)({
        campaignName: priceBreakCampaign?.campaignName,
        discount: currentPriceBreakCampaign.label,
      });
    }
  }, [priceBreakCampaign, currentPriceBreakCampaign, showFreeShippingHint]);

  const { showGiftProgressHint, giftProgressProps } = useMemo(() => {
    if (showFreeShippingHint || currentPriceBreakCampaign || !haveGiftPromotion || validCampaignGiftPromotion) {
      return { showGiftProgressHint: false, giftProgressProps: null };
    }

    const firstGiftCampaign = allFreeGiftCampaignPromotion[0];
    const { quantity, amount, purchaseType } = firstGiftCampaign.minSpend;
    const FREE_GIFT_LIMIT = purchaseType === 1 ? +amount : +quantity;
    const currentValue = purchaseType === 1 ? itemTotal : itemCount;

    if (FREE_GIFT_LIMIT <= 0) {
      return { showGiftProgressHint: false, giftProgressProps: null };
    }

    return {
      showGiftProgressHint: true,
      giftProgressProps: {
        purchaseType,
        gap: FREE_GIFT_LIMIT - currentValue,
        limit: FREE_GIFT_LIMIT,
        currentValue,
        desktop,
      },
    };
  }, [
    showFreeShippingHint,
    currentPriceBreakCampaign,
    haveGiftPromotion,
    validCampaignGiftPromotion,
    allFreeGiftCampaignPromotion,
    itemTotal,
    itemCount,
    desktop,
  ]);

  const hasPromotionContent =
    showFreeShippingHint || !!currentPriceBreakCampaign || showGiftProgressHint || freeGiftHint;

  if (!hasPromotionContent)
    return (
      <Box sx={{ ...(mobile && { mt: 2 }) }}>
        {showCreditBanner && <InlineCreditBanner />}
        {showZipCodeBanner && <InlineZipCodeBanner />}
      </Box>
    );

  return (
    <Box sx={{ ...(mobile && { mt: 2 }) }}>
      {showFreeShippingHint && (
        <FreeShippingHint
          freeShippingComplete={freeShippingComplete}
          showFreeGiftUnlocked={freeGiftHint}
          gap={FREE_SHIPPING_LIMIT - itemTotal}
          limit={FREE_SHIPPING_LIMIT}
          itemTotal={itemTotal}
        />
      )}
      {!showFreeShippingHint && currentPriceBreakCampaign && priceBreakCampaign && (
        <PriceBreakHint
          showFreeGiftUnlocked={freeGiftHint}
          campaign={priceBreakCampaign}
          currentDiscount={currentPriceBreakCampaign}
          itemTotal={itemTotal}
        />
      )}
      {showGiftProgressHint && giftProgressProps && <FreeGiftProgressHint {...giftProgressProps} />}
      <Stack direction="column" gap={accessInPos ? 2 : 4}>
        {freeGiftHint ? (
          <>
            <Stack sx={{ direction: 'column', gap: accessInPos ? 0 : 4 }}>
              {!currentPriceBreakCampaign && !showFreeShippingHint && (
                <Box>
                  <Typography level={accessInPos ? 'caption1' : 'body1'}>
                    {t('promotionHint.freeGiftUnlockedCongrats')}
                  </Typography>
                  <ProgressBar width={100} />
                </Box>
              )}
              {showCreditBanner && <InlineCreditBanner />}
              {showZipCodeBanner && <InlineZipCodeBanner />}
            </Stack>
            {showChooseGiftGallery && <ChooseGiftGallery sourceType="campaign" actionType="add" />}
          </>
        ) : (
          <>
            {showCreditBanner && <InlineCreditBanner />}
            {showZipCodeBanner && <InlineZipCodeBanner />}
          </>
        )}
      </Stack>
    </Box>
  );
});

PromotionHint.displayName = 'PromotionHint';
