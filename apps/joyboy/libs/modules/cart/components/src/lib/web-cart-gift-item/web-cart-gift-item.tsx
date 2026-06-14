'use client';
import { Stack, Box, useBreakpoints, Chip } from '@castlery/fortress';
import { InfoThin } from '@castlery/fortress/Icons';
import type { GiftLineItemSchema } from '@castlery/types';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { CartItemPicSection } from '../cart-item-pic-section/cart-item-pic-section';
import { LineItemBaseInfo } from '../cart-item-info/line-item-base-info';
import { WebRemoveAction } from '../web-remove-action/web-remove-action';
import { CartItemPriceSection } from '../cart-item-price-section/cart-item-price-section';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChooseGiftGallery } from '@castlery/modules-promotion-components';
import { useState, useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

function GiftMasker() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: (theme) => theme.palette.brand.mono[50],
        opacity: 0.5,
        zIndex: 1,
      }}
    />
  );
}

interface WebCartGiftItemProps {
  item: GiftLineItemSchema;
}
export function WebCartGiftItem({ item }: WebCartGiftItemProps) {
  const { desktop, tablet, mobile, md } = useBreakpoints();
  const miniCartMode = useAppSelector(selectMiniCartMode);
  const isDesktopLayout = desktop && !md;
  const [showGiftGallery, setShowGiftGallery] = useState(false);
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);

  const isUnavailable = !item.isActive || item.isDeleted || !item.isEligible || item.isRegionOutdated;

  const picProps = useMemo(
    () => ({
      variant: {
        ...item.variant,
        sku: item.variant.sku,
        images: item.variant.images.map((image) => ({
          links: {
            mini: image.links.mini,
          },
        })),
      },
      visitedInOffline: item.visitedInOffline,
    }),
    [item.variant, item.visitedInOffline]
  );

  const isMobileLayout = mobile || miniCartMode;
  const isTabletLayout = tablet || md;
  const columnGap = isDesktopLayout ? 6 : 4;

  // Actions section styles — mirrors cart-item-info
  const actionsSectionStyles = useMemo(
    () =>
      isDesktopLayout
        ? {
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mt: miniCartMode ? 4 : 0,
          }
        : {
            height: 35,
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 4,
          },
    [isDesktopLayout, miniCartMode]
  );

  return (
    <>
      {isUnavailable && (
        <Chip
          variant="outlined"
          color="primary"
          sx={{ height: 'auto !important', textAlign: 'left', gap: 0.5 }}
          startDecorator={<InfoThin sx={{ width: 12, height: 12, color: 'inherit' }} />}
        >
          {t('giftGallery.giftUnavailableBanner')}
        </Chip>
      )}
      <Stack
        sx={{
          position: 'relative',
          py: isMobileLayout ? 4 : 6,
          ...(miniCartMode && { py: 0 }),
        }}
      >
        {isUnavailable && <GiftMasker />}
        {/* RowLayout: image | info (matches cart-item-info grid pattern) */}
        <Stack
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            alignItems: 'center',
            gap: columnGap,
          }}
        >
          <CartItemPicSection item={picProps} />
          {/* Info + actions (desktop/tablet) */}
          <Stack
            direction={isDesktopLayout ? 'row' : 'column'}
            sx={{
              width: '100%',
              flex: 1,
              justifyContent: isDesktopLayout ? 'space-between' : 'flex-start',
              alignItems: 'stretch',
              ...(isTabletLayout && !isMobileLayout && { gap: 12 }),
            }}
          >
            <Stack direction="column" gap={3} sx={{ width: '100%' }}>
              <LineItemBaseInfo item={item} onChangeGift={() => setShowGiftGallery(true)} />
            </Stack>
            {/* Desktop/tablet actions inside info column */}
            {!isMobileLayout && (
              <Stack direction={isDesktopLayout ? 'column-reverse' : 'row'} sx={actionsSectionStyles}>
                <Stack sx={{ ...(isUnavailable && { position: 'relative', zIndex: 2 }) }}>
                  <WebRemoveAction item={item} isGift />
                </Stack>
                <CartItemPriceSection isGift item={item} />
              </Stack>
            )}
          </Stack>
        </Stack>
        {/* Mobile actions — outside grid, at bottom (matches cart-item-info pattern) */}
        {isMobileLayout && (
          <Stack direction="row" sx={actionsSectionStyles}>
            <Stack sx={{ ...(isUnavailable && { position: 'relative', zIndex: 2 }) }}>
              <WebRemoveAction item={item} isGift />
            </Stack>
            <CartItemPriceSection isGift item={item} />
          </Stack>
        )}
      </Stack>
      {showGiftGallery && (
        <ChooseGiftGallery
          sourceType={item.coupon ? 'coupon' : 'campaign'}
          coupon={item.coupon}
          actionType="change"
          initialOpen={true}
          lineItemId={item.id}
          onClose={() => setShowGiftGallery(false)}
        />
      )}
    </>
  );
}

export default WebCartGiftItem;
