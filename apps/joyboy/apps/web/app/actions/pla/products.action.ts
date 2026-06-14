import { formatSearchToQueryString } from '@castlery/utils';
import { makeStore } from '@castlery/shared-redux-store';
import { getPlaProduct } from '@castlery/modules-product-domain';
import { captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const getProductData = async (searchParams: URLSearchParams, spuSlug: string) => {
  try {
    const queryString = formatSearchToQueryString(searchParams);
    const filterSlug = spuSlug.replace(/[\u200B-\u200D\uFEFF]/g, '');
    const compositionQuerySlug = queryString ? `${filterSlug}?${queryString}` : filterSlug;
    const res = await getPlaProduct(makeStore, compositionQuerySlug);
    return res;
  } catch (e) {
    captureStructuredError(e, { domain: BUSINESS_DOMAIN.PRODUCT });
    throw e;
  }
};
