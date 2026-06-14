import { Box, Typography, Link, useBreakpoints } from '@castlery/fortress';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder } from '@castlery/modules-order-domain';
import { getGiftsByOrderNumberV2 } from '@castlery/modules-promotion-domain';
import Gift from './gift';
import type { CollapsibleContentProps } from '../types';
import type { Gift as GiftType } from '@castlery/types';
import { ScrollWrapper } from '@castlery/shared-components';
import { PosChooseFreeGiftDeliveryModal } from '../../pos-chooseFreeGift-delivery-modal';
import { accessInPos, EcEnv } from '@castlery/config';

export const CollapsibleContent = ({ isOpen, mobileLayout, gifts, curCode }: CollapsibleContentProps) => {
  const { desktop } = useBreakpoints();
  const [selectedGift, setSelectedGift] = useState<GiftPoolGiftItemWithVariantSchema | null>(null);
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrder);

  const handleChooseGift = (gift: GiftPoolGiftItemWithVariantSchema) => {
    setSelectedGift(gift);
    setOpenDeliveryModal(true);
  };

  const handleCloseModal = (refresh = false) => {
    setOpenDeliveryModal(false);
    setSelectedGift(null);
    if (order?.number && refresh) {
      dispatch(getGiftsByOrderNumberV2.initiate({ orderNumber: order.number }));
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: desktop ? 'calc(66.3vw - 162px)' : '100vw',
        margin: '0 auto',
        maxHeight: isOpen ? 1000 : 0,
        overflow: 'hidden',
        transition: 'all 0.5s ease-in-out',
      }}
    >
      <Typography level="caption1" sx={{ my: 2 }}>
        Note: Gifts are subject to stock availability.
        <Link
          component="button"
          underline="always"
          sx={{
            color: 'var(--fortress-palette-brand-burntOrange-500) !important',
            textDecorationColor: 'var(--fortress-palette-brand-burntOrange-500) !important',
          }}
          onClick={() => {
            window.open(`https://www.castlery.com/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/promo-terms`, '_blank');
          }}
        >
          T&Cs apply.
        </Link>
      </Typography>

      <ScrollWrapper
        scrollTrackHeight={8}
        sx={{
          width: '100%',
          py: 0,
          gap: 2,
          '& > .MuiStack-root': {
            marginTop: '0 !important',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
          }}
        >
          {gifts?.map((gift) => (
            <Gift
              key={gift.giftPoolId}
              gift={gift}
              mobileLayout={mobileLayout}
              posSelectDeliveryModal={handleChooseGift}
            />
          ))}
        </Box>
      </ScrollWrapper>

      {/* 统一的 Modal 管理 */}
      {accessInPos && (
        <PosChooseFreeGiftDeliveryModal
          open={openDeliveryModal}
          onClose={handleCloseModal}
          gift={selectedGift}
          code={curCode}
        />
      )}
    </Box>
  );
};
