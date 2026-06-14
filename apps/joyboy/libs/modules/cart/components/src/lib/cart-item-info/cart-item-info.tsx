'use client';
import { memo, Suspense, useMemo } from 'react';
import { Stack, useBreakpoints, Typography, Tag, Link } from '@castlery/fortress';
import { CartBundleItemInfo } from '../cart-bundle-item-info/cart-bundle-item-info';
import { LineItemSchema, GiftLineItemSchema, BundleLineItem_V2 } from '@castlery/types';
import { LLTTag, CartItemOptionPresentation, ChangeGiftButton, LeadTimePresentation } from './line-item-base-info';
import { ProductTypeMapping, EcEnv, basePageConfig, accessInPos, enableWarranty } from '@castlery/config';
import { ProductReviewSummary, PriceDisplay } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { getDeliveryTimePresentation } from '@castlery/utils';
import { CartItemName } from '../cart-item-name/cart-item-name';
import { WarrantyRemoveButton } from '../warranty-remove-button/warranty-remove-button';
import { WarrantyInlineButton } from '../warranty-inline-button/warranty-inline-button';
import { CartItemPicture, LAYOUT_MODE } from '../cart-item-picture/cart-item-picture';
import { useLineItemLink } from '../hooks/useLineItemLink';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ArrowRight } from '@castlery/fortress/Icons';
import { WebQtyActions } from '../web-qty-actions/web-qty-actions';
import { WebRemoveAction } from '../web-remove-action/web-remove-action';
import { CartItemPriceSection } from '../cart-item-price-section/cart-item-price-section';
import { isItemOutdated } from '@castlery/modules-cart-services';

export { LAYOUT_MODE } from '../cart-item-picture/layout.config';

const salesAndRefundsUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY}${basePageConfig['sales-and-refunds']}`.toLowerCase();
const posSalesAndRefundsUrl = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}${salesAndRefundsUrl}`;

// Layout configuration constants
const COLUMN_GAP_CONFIG = {
  [LAYOUT_MODE.CART]: {
    DESKTOP: 6,
    TABLET: 4,
    MOBILE: 4,
  },
  [LAYOUT_MODE.MINI_CART]: {
    DESKTOP: 4,
    TABLET: 4,
    MOBILE: 4,
  },
  [LAYOUT_MODE.SHIPMENT]: {
    DESKTOP: 4,
    TABLET: 4,
    MOBILE: 4,
  },
  [LAYOUT_MODE.SUMMARY]: {
    DESKTOP: 6,
    TABLET: 4,
    MOBILE: 4,
  },
} as const;

const FULFILLMENT_METHOD_TEXT: Record<number, string> = {
  1: 'Delivery',
  2: 'Cash&Carry',
} as const;
const FULFILLMENT_WAREHOUSE_TEXT: Record<number, string> = {
  1: 'From Showroom',
  2: 'From Warehouse',
} as const;

interface RowLayoutProps {
  children: React.ReactNode;
  columnGap: number;
}

// mini cart == mobile
// desktop == 2 columns
// tablet == 2 rows 1column
const RowLayout = memo<RowLayoutProps>(({ children, columnGap }) => {
  const layoutStyle = useMemo(() => {
    return {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'max-content 1fr',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: columnGap,
    };
  }, [columnGap]);

  return <Stack sx={{ ...layoutStyle }}>{children}</Stack>;
});

RowLayout.displayName = 'RowLayout';

interface CartItemInfoProps {
  item: LineItemSchema;
  layoutMode: keyof typeof LAYOUT_MODE;
  showO2OTag?: boolean;
  showReviews?: boolean;
  showWarranty?: boolean;
  supportChooseWarranty?: boolean;
  showCustomized?: boolean;
  showLeadTime?: boolean;
  showLLTTag?: boolean;
  showCartActionSection?: boolean;
}

export const CartItemInfo = memo<CartItemInfoProps>(
  ({
    item,
    layoutMode,
    showReviews = true,
    showO2OTag = true,
    showWarranty = true,
    showCustomized = true,
    showLeadTime = true,
    showLLTTag = true,
    supportChooseWarranty = true,
    showCartActionSection = true,
  }) => {
    const { t } = useTranslation(LocalesNamespace.MODULES_PRODUCT, {
      keyPrefix: 'productLineItemInfo',
    });
    const { mobile, tablet, md, desktop } = useBreakpoints();

    const miniCartMode = useAppSelector(selectMiniCartMode);
    const productUrl = useLineItemLink(item);
    const isMobileLayout = mobile || miniCartMode;
    const isTabletLayout = tablet || md;
    const isDesktopLayout = desktop && !md;

    const isOutdated = isItemOutdated(item);

    const isBundleItem = useMemo(
      () =>
        item.productType === ProductTypeMapping.BUNDLE &&
        Array.isArray(item.bundleLineItems) &&
        item.bundleLineItems.length > 0,
      [item.productType, item.bundleLineItems]
    );

    const columnGap = useMemo(() => {
      const mode = miniCartMode ? LAYOUT_MODE.MINI_CART : layoutMode;
      const device = isMobileLayout ? 'MOBILE' : isTabletLayout ? 'TABLET' : 'DESKTOP';
      return COLUMN_GAP_CONFIG[mode as keyof typeof LAYOUT_MODE][device];
    }, [isMobileLayout, isTabletLayout, miniCartMode, layoutMode]);

    const isServiceOrSwatchItem = useMemo(
      () => [ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(item.productType as ProductTypeMapping),
      [item.productType]
    );

    const isGift = useMemo(() => !!item.isGift || !!item.giftPoolId, [item.isGift, item.giftPoolId]);

    const deliveryLeadTimePresentation = useMemo(() => {
      const { startDeliveryTime, endDeliveryTime, startDispatchTime, endDispatchTime } = item.leadTimeInfo || {};
      return getDeliveryTimePresentation({
        startDeliveryTime,
        endDeliveryTime,
        startDispatchTime,
        endDispatchTime,
      });
    }, [item.leadTimeInfo]);

    const hasWarranty = useMemo(() => !!item.warrantyItem?.warrantyOfferId, [item.warrantyItem?.warrantyOfferId]);

    // [保险接入] 全 Cart / MiniCart / POS 行内保险展示与增删（CartItemInfo 主组件）
    // - supportChooseWarranty=false 时只读展示，不渲染 Inline/Remove 按钮
    const enableShowWarranty = useMemo(
      () => enableWarranty && !isServiceOrSwatchItem && showWarranty,
      [isServiceOrSwatchItem, showWarranty]
    );

    const hideDeliveryTimePresentation = useMemo(() => {
      return item.isRegionOutdated || !deliveryLeadTimePresentation;
    }, [item, deliveryLeadTimePresentation]);

    const isNotDisplayInCart = useMemo(() => {
      return layoutMode !== LAYOUT_MODE.CART && layoutMode !== LAYOUT_MODE.MINI_CART;
    }, [layoutMode]);

    // Actions section styles
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

    // Price and quantity section styles
    const priceQtyStyles = useMemo(() => {
      if (isDesktopLayout) {
        return {
          width: 250,
          maxWidth: 260,
          justifyContent: 'space-between',
        };
      }
      if (isTabletLayout) {
        return {
          gap: 12,
          // width: { sm: '100%', md: 250 },
          // gap: { sm: 12, md: 4 },
          // justifyContent: 'flex-end',
        };
      }
      if (isMobileLayout) {
        return {
          justifyContent: 'flex-end',
          gap: 4,
        };
      }
      return {};
    }, [isDesktopLayout, isTabletLayout, isMobileLayout]);

    const summaryPx = useMemo(() => {
      if (layoutMode !== LAYOUT_MODE.SUMMARY) return undefined;
      if (isMobileLayout) return 4;
      return 6;
    }, [layoutMode, isMobileLayout]);

    return (
      <Stack sx={{ width: '100%', ...(summaryPx !== undefined && { px: summaryPx }) }}>
        <RowLayout columnGap={columnGap}>
          {/* Picture section */}
          <Stack
            direction="column"
            sx={{
              flex: 'none',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            {showO2OTag && item.visitedInOffline && (
              <Tag variant="outlined">
                <Typography level="caption2">Showroom pick</Typography>
              </Tag>
            )}
            <CartItemPicture
              imageUrl={item.variant.images?.[0]?.links?.large}
              productType={item.productType as ProductTypeMapping}
              productUrl={productUrl}
              layoutMode={layoutMode}
            />
            {showReviews && (
              <Suspense>
                <ProductReviewSummary sku={item.variant.sku} href={productUrl} />
              </Suspense>
            )}
          </Stack>
          {/* Info section */}
          <Stack
            direction={isDesktopLayout ? 'row' : 'column'}
            sx={{
              width: '100%',
              flex: 1,
              justifyContent: isDesktopLayout ? 'space-between' : 'flex-start',
              alignItems: 'stretch',
              ...(isTabletLayout && { gap: 12 }),
            }}
          >
            <Stack direction="column" gap={accessInPos ? 0 : 3} sx={{ width: '100%' }}>
              {showLLTTag && item.llt && !item.isRegionOutdated && <LLTTag />}
              <Stack sx={{ ...(accessInPos && { mb: 2 }) }}>
                <CartItemName item={item} />
                <CartItemOptionPresentation item={item} />
              </Stack>
              {isGift && layoutMode !== LAYOUT_MODE.SUMMARY && layoutMode !== LAYOUT_MODE.SHIPMENT && (
                <ChangeGiftButton item={item as unknown as GiftLineItemSchema} />
              )}
              {showLeadTime && !hideDeliveryTimePresentation && (
                <LeadTimePresentation
                  deliveryLeadTimePresentation={deliveryLeadTimePresentation}
                  warehouseDisplayName={item.warehouseDisplayName}
                />
              )}

              {enableShowWarranty && (
                <Stack>
                  {hasWarranty ? (
                    <>
                      <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
                        {t('warrantyTip', {
                          durationMonths: item.warrantyItem?.durationMonths,
                          warrantyOfferPrice: item.warrantyItem?.warrantyOfferPrice,
                        } as any)}
                      </Typography>
                      {supportChooseWarranty && <WarrantyRemoveButton targetLineItemId={item.id} />}
                    </>
                  ) : (
                    supportChooseWarranty && enableWarranty && <WarrantyInlineButton targetLineItemId={item.id} />
                  )}
                </Stack>
              )}
              {isNotDisplayInCart && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  sx={{ width: '100%' }}
                >
                  <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
                    {t('quantity', { qty: item.quantity } as any)}
                  </Typography>
                  {layoutMode === LAYOUT_MODE.SUMMARY && (
                    <PriceDisplay
                      price={isGift ? '0' : item.displayTotal}
                      showFree={true}
                      typographyLevel="caption1"
                      strikeThroughPrice={isGift ? '0' : item.originalTotal}
                    />
                  )}
                </Stack>
              )}
              {accessInPos && (
                <Stack>
                  <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
                    {FULFILLMENT_WAREHOUSE_TEXT[item.fulfillmentWarehouse]} /{' '}
                    {FULFILLMENT_METHOD_TEXT[item.fulfillmentMethod]}
                  </Typography>
                </Stack>
              )}
              {/* Customized tip */}
              {showCustomized && item.variant.isCustomized && (
                <Stack direction="column" gap={1}>
                  <Typography level="caption2">{t('customizedTip' as any)}</Typography>
                  <Link
                    href={accessInPos ? posSalesAndRefundsUrl : salesAndRefundsUrl}
                    target="_blank"
                    level="caption2"
                    rel="noopener"
                    variant="primary"
                    endDecorator={<ArrowRight />}
                  >
                    {(t as any)('customizedCTA')}
                  </Link>
                </Stack>
              )}
            </Stack>
            {/* Actions section */}
            {showCartActionSection && !(isMobileLayout || md) && (
              <Stack direction={isDesktopLayout ? 'column' : 'row'} sx={actionsSectionStyles}>
                <Stack direction="row" sx={priceQtyStyles}>
                  <WebQtyActions item={item} />
                  <CartItemPriceSection isGift={!!isGift} item={item} />
                </Stack>
                <Stack sx={{ ...(isOutdated && { position: 'relative', zIndex: 2 }) }}>
                  <WebRemoveAction item={item} />
                </Stack>
              </Stack>
            )}
          </Stack>
        </RowLayout>
        {isBundleItem && (
          <Stack sx={{ mt: 4 }}>
            {item.bundleLineItems?.map((bundleItem) => (
              <RowLayout key={bundleItem.variant?.id} columnGap={columnGap}>
                <CartItemPicture
                  imageUrl={bundleItem.variant.images?.[0]?.links?.large}
                  productType={item.productType}
                  productUrl={productUrl}
                  isBundleImage={true}
                  layoutMode={layoutMode}
                />
                <CartBundleItemInfo bundleItem={bundleItem as unknown as BundleLineItem_V2} />
              </RowLayout>
            ))}
          </Stack>
        )}

        {/* Actions section */}
        {showCartActionSection && (isMobileLayout || md) && (
          <Stack direction={'row'} sx={actionsSectionStyles}>
            <Stack sx={{ ...(isOutdated && { position: 'relative', zIndex: 2 }) }}>
              <WebRemoveAction item={item} />
            </Stack>
            <Stack direction="row" sx={priceQtyStyles}>
              <WebQtyActions item={item} />
              <CartItemPriceSection isGift={!!isGift} item={item} />
            </Stack>
          </Stack>
        )}
      </Stack>
    );
  }
);

CartItemInfo.displayName = 'CartItemInfo';

export default CartItemInfo;
