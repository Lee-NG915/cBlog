'use client';
import {
  Box,
  Modal,
  ModalDialog,
  DialogContent,
  DialogTitle,
  ModalClose,
  Divider,
  Typography,
  Link,
  useBreakpoints,
} from '@castlery/fortress';
import { memo, useEffect } from 'react';
import { GiftGallery } from '../gift-gallery/gift-gallery';
import { useCampaignGifts } from '../../hook/use-campaign-gifts';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ContentLoading } from '@castlery/shared-components';
import type { GiftPoolGiftItemWithVariantSchema } from '@castlery/types';
import { basePageConfig, EcEnv, accessInPos } from '@castlery/config';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCartApplyWithOriginalPrice } from '@castlery/modules-cart-domain';

const promoTermsUrl = accessInPos
  ? `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['promo-terms']}`
  : `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['promo-terms']}`;
interface ChooseCampaignGiftModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChooseCampaignGiftModal = memo(({ open, onClose }: ChooseCampaignGiftModalProps) => {
  const { mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);

  const { freeGiftBreakdown, isLoading, fetchGiftsDetail } = useCampaignGifts();
  const { validCampaignGiftPromotion, allFreeGiftCampaignPromotion } = freeGiftBreakdown;
  const useOriginalPrice = useAppSelector(selectCartApplyWithOriginalPrice);

  const currentPromotion = validCampaignGiftPromotion || allFreeGiftCampaignPromotion[0];
  const gifts = currentPromotion?.gifts.filter((gift: GiftPoolGiftItemWithVariantSchema) => !!gift.variant);

  useEffect(() => {
    if (open) {
      fetchGiftsDetail();
    }
  }, [open, fetchGiftsDetail]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          minWidth: mobile ? '90vw' : 600,
          maxWidth: mobile ? '90vw' : 800,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ModalClose />
        <DialogTitle level="h3" sx={{ textAlign: 'center' }}>
          {t('giftGallery.modalTitle')}
        </DialogTitle>
        <Typography level="caption1">
          Note: Gifts are subject to stock availability.{' '}
          <Link variant="primary" href={promoTermsUrl} target="_blank" underline="always">
            T&C's apply.
          </Link>
        </Typography>
        <Divider sx={{ my: 6 }} />
        <DialogContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box
              sx={{ width: '100%', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ContentLoading loading={true} />
            </Box>
          ) : (
            <GiftGallery
              gifts={gifts}
              layout="grid"
              useOriginalPrice={useOriginalPrice}
              onAddedToCart={() => onClose()}
            />
          )}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
});

ChooseCampaignGiftModal.displayName = 'ChooseCampaignGiftModal';
