'use client';
import { useEffect, useRef } from 'react';
import { useInstantSearch, useHits } from 'react-instantsearch';
import { handleFilterAndSortTracking } from './filter-sort-tracking';
import {
  initializeImpressionTracking,
  reobserveProductElements,
  resetImpressionTracking,
  cleanupTrackingImpression,
  type HitData,
} from './hit-impression-tracking';
import { Middleware, UiState } from 'instantsearch.js';
import { useAppDispatch } from '@castlery/shared-redux-store';
import {
  EVENT_PLP_PRODUCT_CLICK,
  EVENT_PLP_FILTER,
  EVENT_PLP_PRODUCT_IMPRESSION,
  EVENT_ADD_TO_WISHLIST,
} from '@castlery/modules-tracking-services';
import { initializeHitClickTracking } from './hit-click-tracking';
import { useCategoriesData } from '../config/search-context';

export function TrackingMiddleware({ categoryPermalink }: { categoryPermalink: string }) {
  const { addMiddlewares } = useInstantSearch();
  const dispatch = useAppDispatch();
  const categoryData = useCategoriesData();
  const { items } = useHits();
  const dataPage = categoryPermalink;
  // const zipcode = useAppSelector(selectedCurrentZipcode); // abby remove this logic

  // Use refs to store the latest values without triggering middleware re-registration
  const itemsRef = useRef(items);
  const categoryDataRef = useRef(categoryData);
  const dataPageRef = useRef(dataPage);
  const previousPageRef = useRef<number | undefined>(undefined);

  // Update refs when values change
  useEffect(() => {
    itemsRef.current = items;
    categoryDataRef.current = categoryData;
    dataPageRef.current = dataPage;
  }, [items, categoryData, dataPage]);

  // Re-observe product elements when items change (data has loaded and DOM is ready)
  useEffect(() => {
    if (items.length > 0) {
      // Use requestAnimationFrame to ensure DOM has been updated
      requestAnimationFrame(() => {
        reobserveProductElements();
      });
    }
  }, [items]);

  useEffect(() => {
    const trackFilterAndSort = async (attribute: string, action: string, label: string) => {
      let _label = label;
      if (attribute === 'category') {
        _label = categoryDataRef.current?.find((item) => item.permalink === label)?.name || label;
      }
      await dispatch(EVENT_PLP_FILTER({ action, label: _label }));
    };

    const trackProductImpression = async (hitDatas: HitData[]) => {
      const hitList: { product: any; variant: any; page: string }[] = [];
      // 对hitDatas去重，根据hitIndex去重
      const newHitList = hitDatas.filter(
        (hitData, index, self) => index === self.findIndex((t) => t.hitIndex === hitData.hitIndex)
      );
      newHitList.forEach((hitData) => {
        const product = itemsRef.current?.find((item) => item.__position.toString() === hitData.hitIndex);
        const variant = product?.variants?.find((variant: any) => variant.sku === hitData.hitSku);
        if (product && variant) {
          hitList.push({ product: product, variant: variant, page: dataPageRef.current });
        }
      });
      await dispatch(EVENT_PLP_PRODUCT_IMPRESSION({ list: hitList }));
    };

    const trackProductClick = async (hitData: HitData, type: 'wishlist' | 'product') => {
      const product = itemsRef.current?.find((item) => item.__position.toString() === hitData.hitIndex);
      const variant = product?.variants?.find((variant: any) => variant.sku === hitData.hitSku);
      if (product && variant) {
        if (type === 'wishlist') {
          await dispatch(EVENT_ADD_TO_WISHLIST({ variant: variant }));
        }
        if (type === 'product') {
          await dispatch(EVENT_PLP_PRODUCT_CLICK({ product: product, variant: variant, page: dataPageRef.current }));
        }
      }
    };

    const mw: Middleware = () => {
      return {
        $$type: 'search-tracking-middleware',
        onStateChange(options: { uiState: UiState }) {
          handleFilterAndSortTracking(options.uiState, trackFilterAndSort);
          resetImpressionTracking();

          // // Detect page changes
          // const indexNames = Object.keys(options.uiState);
          // const currentPage = indexNames.length > 0 ? options.uiState[indexNames[0]]?.page : undefined;
          // const isPageChange = previousPageRef.current !== undefined && previousPageRef.current !== currentPage;

          // if (isPageChange) {
          //   // Reset tracking state when page changes
          //   resetImpressionTracking();
          //   previousPageRef.current = currentPage;
          // } else if (previousPageRef.current === undefined) {
          //   // Initialize on first load
          //   previousPageRef.current = currentPage;
          // }
          // Note: Re-observation is now handled by useEffect watching items changes
          // This ensures DOM is ready when we try to observe elements
        },
        subscribe() {
          console.log('subscribe');
          initializeImpressionTracking(trackProductImpression);
          initializeHitClickTracking(trackProductClick);
        },
        unsubscribe() {
          console.log('unsubscribe');
          cleanupTrackingImpression();
        },
      };
    };
    if (addMiddlewares) {
      const remove = addMiddlewares(mw);
      return () => remove();
    }
  }, [addMiddlewares, dispatch]); // Simplified dependency array - removed items, categoryData, dataPage

  return null;
}
