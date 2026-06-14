import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GlobalReview } from '../entity/reviews.entity';
import { getVariantReviewSummary } from '../api/review.api';

type ReviewSummary = {
  average_rating: number;
  total_count: number;
  reviews: { rating: number; review_count: number }[];
};

const initialStateReviews: {
  reviews: GlobalReview[] | undefined;
  truncatedReviews: GlobalReview[];
  reviewsSummaryCacheMapping: Record<string, ReviewSummary>;
  reviewsLoading: boolean;
  reviewsTotalCount: number;
  reviewsTotalPages: number;
} = {
  reviewsLoading: false,
  reviews: undefined,
  reviewsTotalCount: 0,
  reviewsTotalPages: 1,
  truncatedReviews: [],
  reviewsSummaryCacheMapping: {},
};

export const reviewsSlice = createSliceWithThunks({
  name: 'reviews',
  initialState: initialStateReviews,
  reducers: (create) => {
    return {
      setReviews: create.reducer((state, { payload }: PayloadAction<GlobalReview[]>) => {
        state.reviews = payload;
      }),
      setTruncatedReviews: create.reducer((state, { payload }: PayloadAction<GlobalReview[]>) => {
        state.truncatedReviews = payload;
      }),
      setReviewsLoading: create.reducer((state, { payload }: PayloadAction<boolean>) => {
        state.reviewsLoading = payload;
      }),
      setReviewsTotalCount: create.reducer((state, { payload }: PayloadAction<number>) => {
        state.reviewsTotalCount = payload;
      }),
      setReviewsTotalPages: create.reducer((state, { payload }: PayloadAction<number>) => {
        state.reviewsTotalPages = payload;
      }),
    };
  },
  selectors: {
    selectReviews: (state) => state.reviews,
    selectTruncatedReviews: (state) => state.truncatedReviews,
    selectReviewsLength: (state) => state.reviews?.length,
    selectReviewsSummaryCacheMapping: (state) => state.reviewsSummaryCacheMapping,
    selectTruncatedReviewsLength: (state) => state.truncatedReviews?.length,
    selectReviewsLoading: (state) => state.reviewsLoading,
    selectReviewsTotalCount: (state) => state.reviewsTotalCount,
    selectReviewsTotalPages: (state) => state.reviewsTotalPages,
  },
  extraReducers: (builder) => {
    builder.addMatcher(getVariantReviewSummary.matchFulfilled, (state, { payload, meta }) => {
      state.reviewsSummaryCacheMapping[meta.arg.originalArgs] = payload;
    });
  },
});

export const reviewsReducer = reviewsSlice.reducer;
export const { setReviews, setTruncatedReviews, setReviewsLoading, setReviewsTotalCount, setReviewsTotalPages } =
  reviewsSlice.actions;
export const {
  selectReviews,
  selectReviewsLength,
  selectReviewsSummaryCacheMapping,
  selectTruncatedReviews,
  selectTruncatedReviewsLength,
  selectReviewsLoading,
  selectReviewsTotalCount,
  selectReviewsTotalPages,
} = reviewsSlice.selectors;
