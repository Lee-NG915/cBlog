/* eslint-disable @typescript-eslint/no-unused-vars */
import { EcEnv, WEB_CHANNEL } from '@castlery/config';
import {
  GlobalReview,
  changeProduct,
  getProductReviewByVariant,
  productReviewsUpdatedEvent,
  setReviews,
  setReviewsLoading,
  setReviewsTotalCount,
  setReviewsTotalPages,
  setTruncatedReviews,
} from '@castlery/modules-product-domain';
import type { AppStartListening } from '@castlery/shared-redux-store';
import { Unsubscribe } from '@reduxjs/toolkit';

/**
 * Subscribes counter listeners and returns a `teardown` function.
 * @example
 * ```ts
 * useEffect(() => {
 *   const unsubscribe = setupCounterListeners();
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function setupReviewsListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    startListening({
      actionCreator: changeProduct,
      effect: async (action, { dispatch, getState }) => {},
    }),
    ...((EcEnv.NEXT_PUBLIC_CHANNEL?.toLowerCase() === WEB_CHANNEL && [
      startListening({
        matcher: productReviewsUpdatedEvent,
        effect: async (action, { dispatch, getState }) => {
          const payload = action.payload;
          const reviews = payload.results;
          let finalReviews: GlobalReview[] = [];
          finalReviews =
            reviews?.filter((item: { attachments: string | any[] }) => item.attachments?.length > 0).slice(0, 5) || [];
          if (finalReviews.length < 5) {
            finalReviews =
              reviews?.filter((item: { attachments: string | any[] }) => item?.attachments?.length <= 0)?.slice(0, 5) ||
              [];
          }
          if (finalReviews.length < 5) {
            finalReviews = [];
          }
          finalReviews?.sort((a: { rating: number }, b: { rating: number }) => b.rating - a.rating);
          dispatch(setTruncatedReviews(finalReviews));
          dispatch(setReviews(reviews));
          dispatch(setReviewsTotalCount(payload.count));
          dispatch(setReviewsTotalPages(payload.total_pages));
          dispatch(setReviewsLoading(false));
        },
      }),
      startListening({
        matcher: getProductReviewByVariant.matchPending,
        effect: async (action, { dispatch, getState }) => {
          dispatch(setReviewsLoading(true));
        },
      }),
      startListening({
        matcher: getProductReviewByVariant.matchRejected,
        effect: async (action, { dispatch, getState }) => {
          dispatch(setReviewsLoading(false));
          dispatch(setReviewsTotalCount(0));
          dispatch(setReviewsTotalPages(1));
          dispatch(setTruncatedReviews([]));
          dispatch(setReviews([]));
        },
      }),
    ]) ||
      []),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
