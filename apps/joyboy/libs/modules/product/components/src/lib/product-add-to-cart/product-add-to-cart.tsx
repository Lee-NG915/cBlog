'use client';

import { Box, Button, Sheet, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import {
  Product,
  selectBundleVariants,
  selectCurrentWarrantyOffer,
  selectCurrentProductStockState,
  selectDiscontinued,
  selectLeadtimeShippingFee,
  selectProduct,
  selectSelectedWarrantyTrackingInfo,
  selectVariant,
  selectVariantQuantity,
  Variant,
  guardsmanWarrantyInteractionEvent,
} from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { STOCK_STATE, DATA_SELENIUM_ID_MAP } from '@castlery/utils';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { usePrice } from '../../hooks/use-price';
import { ProductCartToast } from '@castlery/shared-components';
import { ProductLongLeadTimeModal } from './components/product-long-lead-time-modal';
import { EVENT_MULBERRY_WARRANTY } from '@castlery/modules-tracking-services';
import { EcEnv, OnlineAddCartSource } from '@castlery/config';
import { selectAddToCartLoading, updateMiniCartMode } from '@castlery/modules-cart-domain';
import { addToCartCommandV2 } from '@castlery/modules-cart-services';
import { webAddToCartCommand } from '@castlery/modules-product-services';
import { WebMiniCart } from '@castlery/modules-composite-components';
import { sharedFeatureService } from '@castlery/shared-services';
import { captureStructuredError, addBreadcrumb, BusinessSeverity } from '@castlery/observability/client';

export const ProductAddToCart = () => {
  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';
  const dispatch = useAppDispatch();
  const enabledOrderV2 = sharedFeatureService.enabledOrderV2;
  const stockState = useAppSelector(selectCurrentProductStockState);
  const leadtimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const isOutOfStock = useMemo(() => stockState === STOCK_STATE.OUT_OF_STOCK, [stockState]);
  const discontinued = useAppSelector(selectDiscontinued);
  const product = useAppSelector(selectProduct) as Product;
  const variant = useAppSelector(selectVariant) as Variant;
  const bundleVariant = useAppSelector(selectBundleVariants);
  const currentWarrantyOffer = useAppSelector(selectCurrentWarrantyOffer);
  const selectedWarrantyTrackingInfo = useAppSelector(selectSelectedWarrantyTrackingInfo);
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  // [保险接入] Mulberry GA 埋点用 — Guardsman 走 selectedWarrantyTrackingInfo，Mulberry 走 currentWarrantyOffer
  const warrantyTrackingInfo = useMemo(() => {
    if (isGuardsmanEnabled) {
      return selectedWarrantyTrackingInfo;
    }

    if (!currentWarrantyOffer) {
      return null;
    }

    return {
      durationMonths: Number(currentWarrantyOffer.duration_months || 0),
      price: currentWarrantyOffer.cost ?? currentWarrantyOffer.customer_cost ?? '',
    };
  }, [currentWarrantyOffer, isGuardsmanEnabled, selectedWarrantyTrackingInfo]);
  const atcLoading = useAppSelector(selectAddToCartLoading);
  const variantQuantity = useAppSelector(selectVariantQuantity);
  const isDataReady = useMemo(() => !!leadtimeShippingFee, [leadtimeShippingFee]);
  const dyAfterAtcCampaign = useGetDyCampaignsQuery({
    campaignNames: ['After ATC action A/B test'],
    query: { dyApiPreview },
  });

  const { variantPrice, variantListPrice, numberVariantPrice, numberVariantListPrice } = usePrice({
    product,
    variant,
    bundleVariant,
  });
  const showSalePrice = useMemo(
    () => variantPrice && variantListPrice && variantPrice !== variantListPrice,
    [variantListPrice, variantPrice]
  );
  // const orderLoading = useAppSelector(selectOrderLoading);
  const { desktop, tablet, mobile } = useBreakpoints();
  const [isLongLeadTimeModalOpen, setIsLongLeadTimeModalOpen] = useState(false);
  const [isAddToCartToastOpen, setIsAddToCartToastOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isFullCartAfterAtc, setIsFullCartAfterAtc] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isFullCartAfterAtcRef = useRef(isFullCartAfterAtc);
  const [dyAfterAtcPosition, setDyAfterAtcPosition] = useState<string | null>(null);

  useEffect(() => {
    if (mobile) {
      isFullCartAfterAtcRef.current = isFullCartAfterAtc;
    }
  }, [isFullCartAfterAtc]);

  const handleTrackWarrantyOnAtc = useCallback(
    async (targetOffer: { durationMonths: number; price: string } | null) => {
      if (!targetOffer) {
        return;
      }

      const label = `${targetOffer.durationMonths ? Number(targetOffer.durationMonths) / 12 : 0} Years`;
      const trackingPayload = {
        action: 'add_extended_warranty' as const,
        label,
        sku: variant?.sku ?? '',
        skuName: variant?.product_name ?? '',
        position: 'pdp' as const,
        price: targetOffer.price ?? '',
      };

      if (isGuardsmanEnabled) {
        // [Guardsman 埋点] PDP 加车携带保险 → add_extended_warranty
        await dispatch(guardsmanWarrantyInteractionEvent(trackingPayload));
        return;
      }

      await dispatch(
        EVENT_MULBERRY_WARRANTY({
          ...trackingPayload,
        })
      );
    },
    [dispatch, isGuardsmanEnabled, variant?.product_name, variant?.sku]
  );

  const [{ loading: _addToCartLoading }, addToOrder] = useAsyncFn(async () => {
    // [保险接入] 加车路径分叉 — 保险 payload 组装位置不同
    // - CA (enabledOrderV2): addToCartCommandV2 → resolvePdpLineItem → buildCartWarrantyFields → 打开 MiniCart
    // - US (!enabledOrderV2): webAddToCartCommand → addToCartCommand → options.warranty_offer_id → Toast
    if (enabledOrderV2) {
      try {
        await dispatch(addToCartCommandV2({ scene: 'pdp-web', source: OnlineAddCartSource.PDP })).unwrap();
        setIsLongLeadTimeModalOpen(false);
        dispatch(updateMiniCartMode(true));
      } catch (error: Error | any) {
        // 2. 使用标准错误捕获函数上报 Sentry
        captureStructuredError(error, {
          extra: {
            buttonName: 'Add to Cart',
            pageType: 'PDP',
            productId: product?.id,
            variantId: variant?.id,
            variantSku: variant?.sku,
            productName: product?.name,
            quantity: variantQuantity || 1,
          },
        });
        setIsLongLeadTimeModalOpen(false);
        return undefined;
      }
    } else {
      try {
        await dispatch(
          webAddToCartCommand({
            ...(dyAfterAtcPosition ? { position: dyAfterAtcPosition } : {}),
          } as any)
        ).unwrap();
        setIsLongLeadTimeModalOpen(false);
        setTimeout(() => {
          if (!isFullCartAfterAtcRef.current) {
            setIsAddToCartToastOpen(true);
          } else {
            window.location.href = `${
              EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
            }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`;
          }
        }, 0);
      } catch (error: Error | any) {
        // 1. 添加 breadcrumb（业务组件自己决定是否添加）
        addBreadcrumb({
          message: 'Add to cart failed',
          level: BusinessSeverity.HIGH,
          data: {
            operation: 'add_to_cart',
            productId: product?.id,
            variantId: variant?.id,
            variantSku: variant?.sku,
            productName: product?.name,
            quantity: variantQuantity || 1,
            status: (error as any)?.status,
          },
        });

        // 2. 使用标准错误捕获函数上报 Sentry
        captureStructuredError(error, {
          extra: {
            buttonName: 'Add to Cart',
            pageType: 'PDP',
            productId: product?.id,
            variantId: variant?.id,
            variantSku: variant?.sku,
            productName: product?.name,
            quantity: variantQuantity || 1,
          },
        });
        return undefined;
      }
    }

    return;
  }, [dispatch, dyAfterAtcPosition, enabledOrderV2, product, variant, variantQuantity]);

  const handleAddToCartWithWarrantyTracking = useCallback(async () => {
    await handleTrackWarrantyOnAtc(warrantyTrackingInfo);
    await addToOrder();
  }, [addToOrder, handleTrackWarrantyOnAtc, warrantyTrackingInfo]);

  const handleAddToCartWithLongLeadTime = useCallback(
    async (e: any) => {
      e?.preventDefault();
      if (leadtimeShippingFee?.show_leadtime_explanation) {
        setIsLongLeadTimeModalOpen(true);
      } else {
        await handleAddToCartWithWarrantyTracking();
      }
    },
    [handleAddToCartWithWarrantyTracking, leadtimeShippingFee?.show_leadtime_explanation]
  );

  useEffect(() => {
    if (!buttonRef.current || desktop) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowStickyButton(false);
        } else {
          const rect = entry.boundingClientRect;
          const isDisappearingFromTop = rect.bottom < 50;
          const isDisappearingFromBottom = rect.top > window.innerHeight;
          if (isDisappearingFromTop) {
            setShowStickyButton(true);
          } else if (isDisappearingFromBottom) {
            setShowStickyButton(true);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px 0px 0px',
      }
    );

    observer.observe(buttonRef.current);

    return () => observer.disconnect();
  }, [desktop]);

  useEffect(() => {
    if (dyAfterAtcCampaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.action === 'full_cart') {
      setIsFullCartAfterAtc(true);
    }
    if (dyAfterAtcCampaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.group) {
      setDyAfterAtcPosition(dyAfterAtcCampaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.group);
    }
  }, [dyAfterAtcCampaign]);

  useEffect(() => {
    if (desktop) return;

    const footerElement = document.querySelector('footer[role="contentinfo"]');
    if (!footerElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px',
      }
    );

    observer.observe(footerElement);

    return () => observer.disconnect();
  }, [desktop]);

  return (
    <>
      <Stack px={mobile ? 6 : tablet ? 6 : undefined}>
        <Button
          ref={buttonRef}
          variant="primary"
          data-selenium={
            desktop
              ? DATA_SELENIUM_ID_MAP.ADD_TO_CART
              : tablet
              ? DATA_SELENIUM_ID_MAP.ADD_TO_CART_TABLET
              : DATA_SELENIUM_ID_MAP.ADD_TO_CART_MOBILE
          }
          disabled={discontinued || isOutOfStock}
          loading={atcLoading || _addToCartLoading || !isDataReady}
          onClick={handleAddToCartWithLongLeadTime}
          sx={{
            width: '100%',
            my: 4,
          }}
        >
          {!atcLoading && !_addToCartLoading && discontinued
            ? 'Unavailable'
            : isDataReady && isOutOfStock
            ? 'Out of Stock'
            : `Add To Cart - ${variantPrice}`}
        </Button>
      </Stack>

      {showStickyButton && !desktop && !isFooterVisible && (
        <Sheet
          variant="solid"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            px: 6,
            pt: 4,
            pb: 8,
            boxShadow: (theme) => theme.shadow.md,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Stack justifyContent="center" alignItems="flex-start" gap={1}>
              <Typography
                level="h4"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {product?.name}
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  level="body2"
                  sx={{
                    ...(showSalePrice
                      ? {
                          fontWeight: 700,
                          color: 'var(--fortress-palette-brand-terracotta-500)',
                        }
                      : {
                          color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                        }),
                  }}
                >
                  {variantPrice}
                </Typography>
                {showSalePrice && (
                  <Typography
                    level="body2"
                    sx={{
                      color: 'var(--fortress-palette-brand-mono-500)',
                      textDecoration: 'line-through',
                      ml: 1,
                    }}
                  >
                    {variantListPrice}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Button
              variant="primary"
              data-selenium={tablet ? 'add_to_cart_sticky_tablet' : 'add_to_cart_sticky_mobile'}
              disabled={discontinued || isOutOfStock}
              loading={atcLoading || _addToCartLoading || !isDataReady}
              onClick={handleAddToCartWithLongLeadTime}
              sx={{
                textWrap: 'nowrap',
              }}
            >
              {!atcLoading && !_addToCartLoading && discontinued
                ? 'Unavailable'
                : isDataReady && isOutOfStock
                ? 'Out of Stock'
                : 'Add To Cart'}
            </Button>
          </Stack>
        </Sheet>
      )}

      <ProductLongLeadTimeModal
        variant={variant}
        open={isLongLeadTimeModalOpen}
        onClose={() => setIsLongLeadTimeModalOpen(false)}
        atcLoading={atcLoading || _addToCartLoading}
        handleAddToCart={handleAddToCartWithWarrantyTracking}
      />

      {enabledOrderV2 ? (
        <WebMiniCart />
      ) : (
        <ProductCartToast
          open={isAddToCartToastOpen}
          onClose={() => setIsAddToCartToastOpen(false)}
          variant={variant}
          price={variantPrice}
          listPrice={variantListPrice}
          numberPrice={numberVariantPrice}
          numberListPrice={numberVariantListPrice}
        />
      )}
    </>
  );
};
