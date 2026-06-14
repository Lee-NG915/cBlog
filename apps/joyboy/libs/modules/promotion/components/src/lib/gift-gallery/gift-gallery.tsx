'use client';
import { Box, Stack, Link, Typography } from '@castlery/fortress';
import { useCallback, useMemo, useState } from 'react';
import { EcEnv, basePageConfig, accessInPos } from '@castlery/config';
import { ScrollWrapper, scrollTrackClasses, AuthModal } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { addGiftToCartCommand } from '@castlery/modules-cart-services';
import { selectCartGiftItems, selectMiniCartMode } from '@castlery/modules-cart-domain';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import GiftItem from '../gift-item/gift-item';
import type { GiftPoolGiftItemWithVariantSchema } from '@castlery/types';
import { PosChooseFreeGiftDeliveryModalV2 } from '../pos-chooseFreeGift-delivery-modal';
import { useGiftAuthGuard } from '../hooks/use-gift-auth-guard';

interface GiftGalleryProps {
  gifts: GiftPoolGiftItemWithVariantSchema[];
  /** 'scroll' = horizontal scrollable row (default); 'grid' = responsive wrap grid */
  layout?: 'scroll' | 'grid';
  addHandler?: (gift: GiftPoolGiftItemWithVariantSchema) => Promise<boolean>;
  /** Override the default add-to-cart handler (e.g. coupon gifts need a coupon code) */
  onAddedToCart?: (gift: GiftPoolGiftItemWithVariantSchema) => void;
  couponCode?: string; // 当 coupon类型的gift gallery时，需要传入 couponCode
  /** true → use variant.originalPrice as strike-through; false → use variant.price */
  useOriginalPrice?: boolean;
}

export function GiftGallery({
  gifts,
  layout = 'scroll',
  couponCode,
  addHandler,
  onAddedToCart,
  useOriginalPrice,
}: GiftGalleryProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);
  const { guardAction, openAuthModal, onAuthSuccess, onAuthClose } = useGiftAuthGuard();
  const cartGiftItems = useAppSelector(selectCartGiftItems);
  const isMiniCartMode = useAppSelector(selectMiniCartMode);

  const [selectedGift, setSelectedGift] = useState<GiftPoolGiftItemWithVariantSchema | null>(null);
  const [openPosModal, setOpenPosModal] = useState(false);

  // Mark gifts already in cart as selected — matched by giftPoolId + variantId.
  const giftsWithSelection = useMemo<GiftPoolGiftItemWithVariantSchema[]>(
    () =>
      gifts.map((gift) => ({
        ...gift,
        selected:
          !!gift.freeGiftId &&
          cartGiftItems.some((item) => item.giftPoolId === gift.freeGiftId && item.variant?.id === gift.variantId),
      })),
    [gifts, cartGiftItems]
  );

  const handleAddToCart = useCallback(
    async (gift: GiftPoolGiftItemWithVariantSchema) => {
      if (typeof addHandler === 'function') {
        const isSuccess = await addHandler(gift);
        if (isSuccess) {
          onAddedToCart?.(gift);
        }
        return;
      }
      if (accessInPos) {
        setSelectedGift(gift);
        setOpenPosModal(true);
        return;
      }
      const giftPoolId = gift.freeGiftId ?? gift.giftPoolId;
      if (!giftPoolId) return;
      return guardAction(async () => {
        const result = await dispatch(
          addGiftToCartCommand({
            giftPoolId,
            coupon: couponCode,
            quantity: gift.quantity,
            variantId: gift.variantId,
            salePrice: gift.variant.price,
            trackingLabel: isMiniCartMode ? 'miniCart' : 'fullCart',
          })
        );
        if (addGiftToCartCommand.fulfilled.match(result)) {
          onAddedToCart?.(gift);
        }
      });
    },
    [dispatch, couponCode, addHandler, onAddedToCart, guardAction, isMiniCartMode]
  );

  const handlePosModalClose = useCallback(
    (refresh?: boolean) => {
      const addedGift = selectedGift;
      setOpenPosModal(false);
      setSelectedGift(null);
      // refresh=false means gift was successfully added
      if (refresh === false && addedGift) {
        onAddedToCart?.(addedGift);
      }
    },
    [selectedGift, onAddedToCart]
  );

  const promoTermsUrl = accessInPos
    ? `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['promo-terms']}`
    : `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['promo-terms']}`;
  const containerSx = {
    width: 'inherit',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  } as const;

  const note = (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 4, mt: 4 }}>
      <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
        {t('giftGallery.stockNote')}
      </Typography>
      <Link variant="primary" level="caption1" underline="always" href={promoTermsUrl} rel="noreferrer" target="_blank">
        {t('giftGallery.tcsApply')}
      </Link>
    </Stack>
  );

  const giftItems = giftsWithSelection.map((gift) => (
    <GiftItem
      key={`${gift.freeGiftId ?? gift.giftPoolId ?? ''}-${gift.variantId}`}
      gift={gift}
      useOriginalPrice={useOriginalPrice}
      onAddToCart={handleAddToCart}
    />
  ));

  const posModal = accessInPos ? (
    <PosChooseFreeGiftDeliveryModalV2
      open={openPosModal}
      onClose={handlePosModalClose}
      gift={selectedGift}
      code={couponCode}
    />
  ) : null;

  const authModal = !accessInPos ? (
    <AuthModal open={openAuthModal} onClose={onAuthClose} onSuccess={onAuthSuccess} />
  ) : null;

  if (!gifts?.length) {
    return (
      <>
        <Box sx={containerSx}>
          {note}
          <Typography level="body2" color="neutral" textAlign="center">
            {t('giftGallery.noGiftsAvailable')}
          </Typography>
        </Box>
        {posModal}
        {authModal}
      </>
    );
  }

  if (layout === 'grid') {
    return (
      <>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 6,
          }}
        >
          {giftItems}
        </Box>
        {posModal}
        {authModal}
      </>
    );
  }

  return (
    <>
      <Box sx={containerSx}>
        {note}
        <ScrollWrapper
          scrollTrackHeight={8}
          sx={{
            width: 'inherit',
            py: 0,
            [`& .${scrollTrackClasses.root}`]: {
              px: 4,
            },
          }}
        >
          <Box sx={{ display: 'flex', gap: 5, pl: 4 }}>{giftItems}</Box>
        </ScrollWrapper>
      </Box>
      {posModal}
      {authModal}
    </>
  );
}
