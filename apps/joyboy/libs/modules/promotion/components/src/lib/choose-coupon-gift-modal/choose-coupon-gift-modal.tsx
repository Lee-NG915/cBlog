'use client';
import {
  Box,
  Modal,
  ModalDialog,
  DialogContent,
  DialogTitle,
  ModalClose,
  Divider,
  useBreakpoints,
  CircularProgress,
  useNiceModal,
} from '@castlery/fortress';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLazyGetGiftsByCouponCodeQuery } from '@castlery/modules-promotion-domain';
import { GiftGallery } from '../gift-gallery/gift-gallery';
import type { GiftPoolGiftItemWithVariantSchema, GiftPoolSchema } from '@castlery/types';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCartApplyWithOriginalPrice } from '@castlery/modules-cart-domain';

interface ChooseCouponGiftModalProps {
  open: boolean;
  onClose: () => void;
  couponCode: string;
}

export const ChooseCouponGiftModal = memo(({ couponCode, open, onClose }: ChooseCouponGiftModalProps) => {
  const { mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);
  const [modal, modalContextHolder] = useNiceModal();
  const hasAddedGiftRef = useRef(false);

  const [triggerGetGifts, { isFetching, data: giftPools = [] as GiftPoolSchema[] }] =
    useLazyGetGiftsByCouponCodeQuery();
  const useOriginalPrice = useAppSelector(selectCartApplyWithOriginalPrice);

  useEffect(() => {
    if (open && couponCode) {
      hasAddedGiftRef.current = false;
      triggerGetGifts(couponCode);
    }
  }, [open, couponCode, triggerGetGifts]);

  const flatGifts = useMemo<GiftPoolGiftItemWithVariantSchema[]>(
    () =>
      (giftPools || [])
        .filter((giftPool: GiftPoolSchema) => giftPool?.isEligible && giftPool?.controlType === 2)
        .flatMap((giftPool) => (giftPool.gifts as GiftPoolGiftItemWithVariantSchema[]) || []),
    [giftPools]
  );

  const handleAddedToCart = useCallback(() => {
    hasAddedGiftRef.current = true;
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (hasAddedGiftRef.current) {
      onClose();
      return;
    }
    modal.warning({
      title: t('giftCloseWarning.title'),
      desc: t('giftCloseWarning.desc'),
      cancelText: t('giftCloseWarning.cancel'),
      confirmText: t('giftCloseWarning.continue'),
      onConfirm: () => onClose(),
    });
  }, [modal, onClose, t]);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog
          sx={{
            minWidth: mobile ? '90vw' : 600,
            maxWidth: mobile ? '90vw' : 800,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <ModalClose />
          <DialogTitle level="h3" sx={{ textAlign: 'center' }}>
            {t('giftGallery.modalTitle')}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 0 }}>
            {isFetching ? (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 200,
                }}
              >
                <CircularProgress size="lg" color="neutral" />
              </Box>
            ) : (
              <GiftGallery
                gifts={flatGifts}
                layout="grid"
                couponCode={couponCode}
                useOriginalPrice={useOriginalPrice}
                onAddedToCart={handleAddedToCart}
              />
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
      {modalContextHolder}
    </>
  );
});

ChooseCouponGiftModal.displayName = 'ChooseCouponGiftModal';
