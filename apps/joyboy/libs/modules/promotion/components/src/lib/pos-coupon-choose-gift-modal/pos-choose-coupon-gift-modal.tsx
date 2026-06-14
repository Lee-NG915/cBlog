'use client';
import { Modal, Sheet, Typography, Box, Link, CircularProgress } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder } from '@castlery/modules-order-domain';
import { selectFreeGiftBreakdown, getGiftsByOrderNumberSilent } from '@castlery/modules-promotion-domain';
import Gift from '../campaign-free-gift/components/gift';
import type { Gift as GiftType } from '@castlery/types';
import { PosChooseFreeGiftDeliveryModal } from '../pos-chooseFreeGift-delivery-modal';
import { CampaignInfoModal } from '../campaign-free-gift/components/campaign-info-modal';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
}

export const ChooseCouponGiftModal = ({ open, onClose, code }: PromptModalProps) => {
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrder);
  const [loading, setLoading] = useState(false);
  const [openRemindModal, setOpenRemindModal] = useState(false);

  // const giftPromotions = useAppSelector(selectFreeGiftsV2);
  const { validCouponGiftPromotion } = useAppSelector(selectFreeGiftBreakdown);

  // const isEligible = !!validCouponGiftPromotion;
  const gifts = validCouponGiftPromotion?.gifts || [];

  const handleChooseGift = (gift: GiftType) => {
    setSelectedGift(gift);
    setOpenDeliveryModal(true);
  };

  const handleCloseDeliveryModal = async (refresh = false) => {
    setOpenDeliveryModal(false);
    setSelectedGift(null);
    if (refresh) {
      if (order?.number) {
        setLoading(true);
        try {
          await dispatch(
            getGiftsByOrderNumberSilent.initiate({ orderNumber: order.number, coupon_code: code })
          ).unwrap();
        } catch (error) {
          logger.error('Failed to fetch gifts after choosing', { error, orderNumber: order.number, code });
        } finally {
          setLoading(false);
        }
      }
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        disableEscapeKeyDown
        open={open}
        // onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          '&:focus-visible': { outline: 'none' },
        }}
      >
        <Sheet
          sx={{
            p: 3,
            width: 700,
            maxWidth: '90vw',
            maxHeight: '90vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {loading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1000 }} />}
          <Box
            onClick={() => {
              setOpenRemindModal(true);
              // onClose();
            }}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              width: 40,
              height: 40,
            }}
          >
            <Close sx={{ width: 24, height: 24, fill: (theme) => theme.palette.brand.wheat[500] }} />
          </Box>
          {/* 目前 title 没有 24px 的level ,所以看起来样式有区别*/}
          <Typography
            id="modal-title"
            level="h3"
            textAlign="center"
            sx={{
              fontWeight: 600,
              lineHeight: '175%',
              fontFamily: 'Poppins',
            }}
          >
            Choose Your Free Gift
          </Typography>
          <Typography level="caption1" textAlign="center">
            Note: Gifts are subject to stock availability.{' '}
            <Link
              component="button"
              underline="always"
              sx={{
                color: 'var(--fortress-palette-brand-burntOrange-500) !important',
                textDecorationColor: 'var(--fortress-palette-brand-burntOrange-500) !important',
              }}
              onClick={() => {
                window.open(
                  `https://www.castlery.com/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/promo-terms`,
                  '_blank'
                );
              }}
            >
              T&Cs apply.
            </Link>
          </Typography>
          <Box sx={{ width: '100%', height: '1px', m: 3, background: (theme) => theme.palette.brand.wheat[500] }}></Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              maxHeight: '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              justifyContent: 'center',
              padding: 1,
            }}
          >
            {gifts?.map((gift: any) => (
              <Gift key={gift.id} gift={gift} posSelectDeliveryModal={handleChooseGift} isCouponModule />
            ))}
          </Box>
        </Sheet>
      </Modal>

      {/* 配送选择 Modal */}
      <PosChooseFreeGiftDeliveryModal
        open={openDeliveryModal}
        onClose={handleCloseDeliveryModal}
        gift={selectedGift}
        code={code}
      />

      <CampaignInfoModal
        open={openRemindModal}
        onClose={() => setOpenRemindModal(false)}
        title="Don't miss your free gift!"
        description="Closing this pop-up will remove the applied gift code."
        cancelText="Cancel"
        confirmText="Continue"
        onConfirm={() => {
          setOpenRemindModal(false);
          onClose();
        }}
      />
    </>
  );
};

export default ChooseCouponGiftModal;
