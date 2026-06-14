import { createAsyncThunk } from '@reduxjs/toolkit';
import { type RootState } from '@castlery/shared-redux-store';
import { selectVariantCode, selectBundleVariants, getReviewsByVariant, getVariantReviewSummary, selectReviewsSummaryCacheMapping } from '@castlery/modules-product-domain';

export const getReviewsByVariantService = createAsyncThunk(
  'reviews/getReviewsByVariantService',
  async (orderBy: string, { getState, dispatch, rejectWithValue }) => {
    const rootState = getState() as RootState;
    const variantCode = selectVariantCode(rootState) || '';
    if (!variantCode) {
      return rejectWithValue('Variant code is required');
    }
    const bundleVariants = selectBundleVariants(rootState);
    const bundleVariantCodes = Array.isArray(bundleVariants) ? bundleVariants.map((item) => item.sku)?.join(',') : '';
    const res = await dispatch(getReviewsByVariant.initiate({ variantCode, bundleVariantCodes, orderBy }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const getVariantReviewSummaryService = createAsyncThunk(
  'reviews/getVariantReviewSummaryService',
  async (sku: string, { getState, dispatch, rejectWithValue,fulfillWithValue }) => {
    const rootState = getState() as RootState;
    const reviewsSummaryCacheMapping = selectReviewsSummaryCacheMapping(rootState);

    if (reviewsSummaryCacheMapping[sku]) {
      return fulfillWithValue(reviewsSummaryCacheMapping[sku]);
    }
    const res = await dispatch(getVariantReviewSummary.initiate(sku));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);
