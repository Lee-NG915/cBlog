'use client';
import { Box, Typography, Stack, Tag, IconButton } from '@castlery/fortress';
import { useState, Suspense, useCallback, useEffect, useMemo } from 'react';
import { GiftGallery } from '../gift-gallery/gift-gallery';
import { useCampaignGifts } from '../../hook/use-campaign-gifts';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { Close, ExpandMore, ExpandLess } from '@castlery/fortress/Icons';
import { ContentLoading, AuthModal, BackdropLoading } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { updateGiftInCartCommand } from '@castlery/modules-cart-services';
import { selectMiniCartMode, selectCartApplyWithOriginalPrice } from '@castlery/modules-cart-domain';
import type { GiftPoolGiftItemWithVariantSchema, GiftPoolSchema } from '@castlery/types';
import { chooseFreeGiftClickedEvent, useLazyGetGiftsByCouponCodeQuery } from '@castlery/modules-promotion-domain';
import { markCouponGiftsCached } from '@castlery/modules-promotion-services';
import { accessInPos } from '@castlery/config';
import { useGiftAuthGuard } from '../hooks/use-gift-auth-guard';

type ActionType = 'change' | 'add';

interface ChooseGiftGalleryProps {
  sourceType: 'campaign' | 'coupon';
  actionType: ActionType;
  onClose?: () => void;
  initialOpen?: boolean;
  /** Required when actionType="change": the existing gift line item to replace */
  lineItemId?: string;
  /** Required when sourceType="coupon": the coupon code used to unlock this gift */
  coupon?: string;
}

export function ChooseGiftGallery({
  sourceType,
  actionType,
  onClose,
  initialOpen = false,
  lineItemId,
  coupon,
}: ChooseGiftGalleryProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);
  const dispatch = useAppDispatch();
  const isMiniCartMode = useAppSelector(selectMiniCartMode);
  const useOriginalPrice = useAppSelector(selectCartApplyWithOriginalPrice);
  const isChangeGift = actionType === 'change';
  const { guardAction, openAuthModal, onAuthSuccess, onAuthClose } = useGiftAuthGuard();

  const shouldDefaultOpen = actionType === 'add' && sourceType === 'campaign' && !accessInPos;
  const [open, setOpen] = useState(initialOpen || shouldDefaultOpen);
  const [isUpdatingGift, setIsUpdatingGift] = useState(false);

  // Campaign gifts
  const { freeGiftBreakdown, isLoading: isCampaignLoading, fetchGiftsDetail } = useCampaignGifts();
  const { validCampaignGiftPromotion, allFreeGiftCampaignPromotion } = freeGiftBreakdown;

  // Coupon gifts
  const [triggerGetCouponGifts, { isLoading: isCouponLoading, data: couponGiftPools }] =
    useLazyGetGiftsByCouponCodeQuery();

  // Lazy fetch on open, with soft cache
  useEffect(() => {
    if (!open) return;
    if (sourceType === 'campaign') {
      fetchGiftsDetail();
    } else if (sourceType === 'coupon' && coupon) {
      // Always invoke the trigger so this hook instance subscribes to the RTK
      // cache entry — otherwise `couponGiftPools` stays undefined even when
      // data already exists in the store. preferCacheValue=true reuses the
      // cached value without firing a new request when available.
      triggerGetCouponGifts(coupon, true).then((result) => {
        if (!result.error) markCouponGiftsCached(coupon);
      });
    }
  }, [open, sourceType, coupon, fetchGiftsDetail, triggerGetCouponGifts]);

  const campaignGiftList = useMemo(() => {
    const currentPromotion = validCampaignGiftPromotion || allFreeGiftCampaignPromotion[0];
    return currentPromotion?.gifts.filter((gift: GiftPoolGiftItemWithVariantSchema) => !!gift.variant) ?? [];
  }, [validCampaignGiftPromotion, allFreeGiftCampaignPromotion]);

  const couponGiftList = useMemo<GiftPoolGiftItemWithVariantSchema[]>(() => {
    const pools: GiftPoolSchema[] = Array.isArray(couponGiftPools) ? (couponGiftPools as GiftPoolSchema[]) : [];
    return pools
      .filter((pool: GiftPoolSchema) => pool?.isEligible && pool?.controlType === 2)
      .flatMap((pool: GiftPoolSchema) => (pool.gifts as GiftPoolGiftItemWithVariantSchema[]) || []);
  }, [couponGiftPools]);

  const giftList = sourceType === 'coupon' ? couponGiftList : campaignGiftList;
  const isLoading = sourceType === 'coupon' ? isCouponLoading : isCampaignLoading;

  const handleChangeGift = useCallback(
    async (gift: GiftPoolGiftItemWithVariantSchema) => {
      if (!lineItemId) return false;
      const giftPoolId = gift.freeGiftId ?? gift.giftPoolId;
      if (!giftPoolId) return false;
      let isSuccess = false;
      await guardAction(async () => {
        setIsUpdatingGift(true);
        try {
          const result = await dispatch(
            updateGiftInCartCommand({
              lineItemId,
              giftPoolId,
              variantId: gift.variantId,
              quantity: gift.quantity,
              salePrice: gift.variant.price,
              ...(coupon ? { coupon: coupon } : {}),
            })
          );
          isSuccess = updateGiftInCartCommand.fulfilled.match(result);
        } finally {
          setIsUpdatingGift(false);
        }
      });
      if (isSuccess) {
        onClose?.();
      }
      return isSuccess;
    },
    [dispatch, lineItemId, coupon, onClose, guardAction]
  );

  return (
    <>
      <Box
        sx={{
          width: accessInPos ? '100%' : { xs: '100%', md: `calc(66.32vw - 96px)`, lg: `calc(66.32vw - 130px)` },
          maxWidth: '100%',
          position: 'relative',
          backgroundColor: (theme) => theme.palette.brand.warmLinen[500],
          py: 4,
        }}
      >
        <BackdropLoading loading={isUpdatingGift} />
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 50px',
            gap: 2,
            alignItems: 'center',
            px: 4,
            cursor: isChangeGift ? 'default' : 'pointer',
          }}
          onClick={() => {
            if (!isChangeGift) {
              const willOpen = !open;
              if (!accessInPos && willOpen && sourceType === 'campaign') {
                dispatch(
                  chooseFreeGiftClickedEvent({
                    label: isMiniCartMode ? 'miniCart' : 'fullCart',
                  })
                );
              }
              setOpen(willOpen);
            }
          }}
        >
          <Tag>Free</Tag>
          <Typography level={accessInPos ? 'caption1' : 'body1'}>{t('giftGallery.chooseYourFreeGift')}</Typography>
          {isChangeGift ? (
            <IconButton
              sx={{ p: 0, m: 0, minHeight: 'auto', minWidth: 'auto' }}
              onClick={() => {
                setOpen(!open);
                onClose?.();
              }}
            >
              {open ? <Close /> : null}
            </IconButton>
          ) : (
            <IconButton sx={{ p: 0, m: 0, minHeight: 'auto', minWidth: 'auto' }}>
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Stack>
        <Suspense fallback={<ContentLoading loading={true} />}>
          <Box
            sx={{
              height: open ? 'auto' : '0px',
              overflow: 'hidden',
              transition: 'height 0.5s ease-in-out',
            }}
          >
            {isLoading ? (
              <Box sx={{ minHeight: 80, position: 'relative' }}>
                <BackdropLoading loading={true} />
              </Box>
            ) : (
              <GiftGallery
                gifts={giftList}
                useOriginalPrice={useOriginalPrice}
                addHandler={isChangeGift ? handleChangeGift : undefined}
              />
            )}
          </Box>
        </Suspense>
      </Box>
      {!accessInPos && <AuthModal open={openAuthModal} onClose={onAuthClose} onSuccess={onAuthSuccess} />}
    </>
  );
}
