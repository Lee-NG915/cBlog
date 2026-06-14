'use client';
import { Box, CircularProgress } from '@castlery/fortress';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import {
  selectFreeGiftBreakdown,
  selectFreeGiftsLoadingV2,
  getGiftsByOrderNumberV2,
} from '@castlery/modules-promotion-domain';
import { GiftHeader } from './components/gift-header';
import { CollapsibleContent } from './components/collapsible-content';
import type { FreeGiftProps } from './types';
import { dt, EventsNames } from '@castlery/data-tracking-events';
import { usePathname } from 'next/navigation';
import { useBreakpoints } from '@castlery/fortress/hooks';
import { selectOrder } from '@castlery/modules-order-domain';
import { logger } from '@castlery/observability/client';

export const ChooseFreeGift = ({ onRemoveFreeGift, onChangeClose, changeGiftId }: FreeGiftProps) => {
  const { desktop } = useBreakpoints();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrder);

  const isMiniCart = !pathname.includes('cart');
  const mobileLayout = isMiniCart || !desktop;
  const isChangeGift = !!changeGiftId;
  const [isOpen, setIsOpen] = useState(isChangeGift);
  const { validCampaignGiftPromotion, allFreeGiftCampaignPromotion, allFreeGiftValidPromotion } =
    useAppSelector(selectFreeGiftBreakdown);
  const freeGiftsLoading = useAppSelector(selectFreeGiftsLoadingV2);

  useEffect(() => {
    if (isChangeGift && isOpen && order) {
      dispatch(getGiftsByOrderNumberV2.initiate({ orderNumber: order?.number, coupon_code: order?.coupon?.code }));
    }
  }, [isChangeGift, isOpen, order, dispatch]);

  let currentPromotion = null;

  const getCurrentPromotion = (giftId: string) => {
    for (const promotion of allFreeGiftValidPromotion) {
      const gift = promotion.gifts?.find((gift: any) => gift.gift_pool_id === giftId);
      if (gift) {
        return promotion;
      }
    }
    return null;
  };

  if (isChangeGift) {
    currentPromotion = getCurrentPromotion(changeGiftId as string);
  } else {
    currentPromotion = validCampaignGiftPromotion || allFreeGiftCampaignPromotion[0];
  }

  const currentCode = isChangeGift && currentPromotion?.control_type === 2 ? order?.coupon?.code : undefined;

  const promotionGiftList = currentPromotion?.gifts;

  const handleToggle = () => {
    if (isChangeGift) {
      onRemoveFreeGift?.();
    } else {
      if (!isOpen) {
        try {
          dt.track(EventsNames.EVENT_GWP_BANNER_CLICK)({});
        } catch (error) {
          // Tracking error should not block the main flow
          logger.error('Failed to track GWP banner click event', { error });
        }
      }
      setIsOpen(!isOpen);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        px: 2,
        py: mobileLayout ? 1 : 2,
        borderRadius: '4px',
        background: 'var(--fortress-palette-brand-flour-100, #FFF8EB)',
      }}
    >
      {freeGiftsLoading && isOpen && (
        <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', zIndex: 9 }} />
      )}
      <GiftHeader
        isChangeGift={isChangeGift}
        mobileLayout={mobileLayout}
        isOpen={isOpen}
        onToggle={handleToggle}
        onChangeClose={onChangeClose}
      />
      <CollapsibleContent isOpen={isOpen} mobileLayout={mobileLayout} gifts={promotionGiftList} curCode={currentCode} />
    </Box>
  );
};

export default ChooseFreeGift;
