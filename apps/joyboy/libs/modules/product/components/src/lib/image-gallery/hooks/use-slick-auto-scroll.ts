import { useRef, useEffect, useMemo, useState } from 'react';
import { BundleVariants, Image, Product, Variant } from '@castlery/modules-product-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import type { Swiper as SwiperType } from 'swiper';
interface UseSlickAutoScrollParams {
  swiperRef: React.RefObject<SwiperType>;
  images: Image[];
  product: Product;
  variantId?: number;
  bundleVariants?: BundleVariants;
}

/**
 * 自动滚动到基础图片位置的 Hook
 * 当产品或变体切换时，自动定位到 base 或 base_old 类型的图片
 * swiper
 */
export const useSlickAutoScroll = ({
  swiperRef,
  images,
  product,
  variantId,
  bundleVariants,
}: UseSlickAutoScrollParams) => {
  const baseIndexRef = useRef<number>();
  const changeRef = useRef<boolean>(false);
  const firstLoad = useRef<boolean>(true);

  const targetBaseIndex = useMemo(() => {
    const baseIndex = images.findIndex((item) => item.type === 'base');
    const baseOldIndex = images.findIndex((item) => item.type === 'base_old');
    const validIndices = [baseIndex, baseOldIndex].filter((it) => it !== -1);
    return validIndices.length > 0 ? Math.min(...validIndices) : 0;
  }, [images]);

  baseIndexRef.current = targetBaseIndex;

  useEffect(() => {
    if (!firstLoad.current) {
      changeRef.current = true;
    }
  }, [product]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (firstLoad.current) {
        const { modelSwitch } = makePersistenceHandles();
        firstLoad.current = false;
        if (modelSwitch.getItem() === 'true' && swiperRef.current) {
          swiperRef.current.slideTo(baseIndexRef.current || 0);
          modelSwitch.removeItem();
        }
      } else if (!firstLoad.current && swiperRef.current) {
        if (product.product_type === 'bundle') {
          if (changeRef.current) {
            swiperRef.current.slideTo(0);
            changeRef.current = false;
          } else {
            swiperRef.current.slideTo(baseIndexRef.current || 0);
          }
        } else {
          swiperRef.current.slideTo(baseIndexRef.current || 0);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [product, swiperRef, variantId, bundleVariants]);

  return {
    targetBaseIndex,
    isFirstLoad: firstLoad.current,
  };
};
