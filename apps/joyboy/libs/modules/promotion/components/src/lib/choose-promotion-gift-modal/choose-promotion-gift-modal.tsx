'use client';
import {
  Box,
  Typography,
  Link,
  Modal,
  ModalDialog,
  DialogContent,
  DialogTitle,
  ModalClose,
  Divider,
  useBreakpoints,
  CircularProgress,
} from '@castlery/fortress';
import Gift from '../campaign-free-gift/components/gift';
import type { GiftPoolGiftItemWithVariantSchema } from '@castlery/types';

interface ChoosePromotionGiftModalProps {
  open: boolean;
  onClose: () => void;
  gifts: GiftPoolGiftItemWithVariantSchema[];
  loading?: boolean;
}

/**
 * 礼品选择弹窗 - 展示层组件
 * 负责渲染礼品选择界面
 */
export function ChoosePromotionGiftModal({ open, onClose, gifts, loading = false }: ChoosePromotionGiftModalProps) {
  const { mobile } = useBreakpoints();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          minWidth: mobile ? '90vw' : 600,
          maxWidth: mobile ? '90vw' : 800,
          maxHeight: '90vh',
        }}
      >
        <ModalClose />
        <DialogTitle>Choose Your Free Gift</DialogTitle>
        <DialogContent>
          <Typography level="caption1">
            Note: Gifts are subject to stock availability.{' '}
            <Link href="/promo-terms" target="_blank" underline="always">
              T&C's apply.
            </Link>
          </Typography>
        </DialogContent>
        <Divider />

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 2,
              p: 2,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            {gifts.length > 0 ? (
              gifts.map((gift) => <Gift key={gift.variantId} gift={gift} mobileLayout={mobile} />)
            ) : (
              <Box
                sx={{
                  gridColumn: mobile ? 'span 2' : 'span 3',
                  textAlign: 'center',
                  py: 4,
                }}
              >
                <Typography level="body2" color="neutral">
                  No gifts available at the moment
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}
