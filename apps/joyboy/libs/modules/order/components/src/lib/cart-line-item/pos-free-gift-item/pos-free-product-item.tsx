'use client';
import { Box, Typography, Stack } from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import type { LineItem, VariantOptionValue, AddonServiceLineItem } from '@castlery/modules-order-domain';
import { DeleteItemButton } from '../../pos-cart-buttons/delete-item-button/delete-item-button';
import { DisabledMasker } from '../../disabled-masker/disabled-masker';
import { STOCK_STATE } from '@castlery/utils';
// import { usePathname } from 'next/navigation';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { TagIcon } from '@castlery/modules-promotion-components';
import { useCallback, useState } from 'react';
import { NiceModal } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

export interface PosFreeProductItemProps {
  item: Partial<LineItem & AddonServiceLineItem>;
  activeStatus: boolean;
  removeItem: (itemId: number) => Promise<void>;
  isExpanded: boolean;
}

export const PosFreeProductItem = ({ item, activeStatus, removeItem, isExpanded }: PosFreeProductItemProps) => {
  const { id, quantity, variant, product_type, is_region_outdated, is_price_outdated = false, stock_state } = item;
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION, { keyPrefix: 'giftRemoveConfirm' });
  // const inCheckoutPage = usePathname().includes('/checkout');
  const variantOptions: VariantOptionValue[] = variant?.variant_option_values || [];
  const isOutDated = is_region_outdated || is_price_outdated || stock_state === STOCK_STATE.OUT_OF_STOCK;
  const [openRemoveGiftConfirm, setOpenRemoveGiftConfirm] = useState(false);
  const [removingGift, setRemovingGift] = useState(false);

  const handleOpenRemoveGiftConfirm = useCallback(async () => {
    setOpenRemoveGiftConfirm(true);
  }, []);

  const handleConfirmRemoveGift = useCallback(async () => {
    if (!id || removingGift) return;
    try {
      setRemovingGift(true);
      await removeItem(id);
      setOpenRemoveGiftConfirm(false);
    } finally {
      setRemovingGift(false);
    }
  }, [id, removingGift, removeItem]);

  return (
    <Box sx={{ width: '100%' }}>
      {isOutDated && (
        <Typography
          level="caption2"
          color="danger"
          startDecorator={<Error color="danger" sx={{ '--Icon-fontSize': '24px' }} />}
          sx={{ alignItems: 'flex-start' }}
        >
          Sorry, this gift is out of stock. Please remove/change it in order to check out.
        </Typography>
      )}
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: activeStatus || isOutDated ? 'auto 24px' : '1fr',
          columnGap: 1,
          alignItems: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            columnGap: 1,
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            alignItems: 'flex-start',
            '&>span': {
              color: (theme) => (isOutDated ? theme.palette.text.secondary : theme.palette.text.primary),
            },
          }}
        >
          {isOutDated && <DisabledMasker />}
          <Typography
            level="body2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textAlign: 'left',
              '& b': {
                flexShrink: 0,
                marginRight: '4px',
              },
              '& span': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          >
            <b>{quantity} x </b>
            <span>{['swatch', 'service'].includes(product_type || '') ? variant?.name : variant?.product_name}</span>
          </Typography>
          {
            !isExpanded && (
              <>
                <TagIcon text="GIFT" w={41} h={25} sx={{ mt: 'auto' }} textSx={{ fontSize: 12 }} />
                <Typography level="caption1" sx={{ flex: '0', mt: 'auto' }}>
                  Free
                </Typography>
              </>
            )
            // )
          }
        </Box>
        {isOutDated && id ? (
          <Stack sx={{ position: 'relative', zIndex: 99 }}>
            <DeleteItemButton handler={handleOpenRemoveGiftConfirm} />
          </Stack>
        ) : (
          <>{activeStatus && id && <DeleteItemButton handler={handleOpenRemoveGiftConfirm} />}</>
        )}
      </Stack>
      {/* ================== variantOptions Section ===================== */}
      <Stack sx={{ position: 'relative' }}>
        {isOutDated && <DisabledMasker />}
        {variantOptions?.map((option: VariantOptionValue) => (
          <Typography
            level="caption1"
            key={option.option_type_id}
            sx={{ color: (theme) => (isOutDated ? theme.palette.text.secondary : theme.palette.brand.charcoal[500]) }}
          >
            {option.option_type_presentation}: {option.presentation}
          </Typography>
        ))}
      </Stack>
      <NiceModal
        warning
        border={false}
        title={t('title')}
        desc={t('desc')}
        open={openRemoveGiftConfirm}
        onClose={() => setOpenRemoveGiftConfirm(false)}
        onCancel={() => setOpenRemoveGiftConfirm(false)}
        onConfirm={handleConfirmRemoveGift}
        cancelText={t('cancel')}
        confirmText={removingGift ? t('confirmLoading') : t('confirm')}
      />
    </Box>
  );
};

export default PosFreeProductItem;
