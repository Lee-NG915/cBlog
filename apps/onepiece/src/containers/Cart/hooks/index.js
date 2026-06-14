import { STOCK_STATE } from 'redux/modules/productOptions';

/**
 *
 * @param {*} cart
 * @returns {Object} { detail: string, isShowErrorDetail: boolean }
 */
export const useErrorDetail = ({ cart, location }) => {
  const locationState = location?.state;

  if (!locationState) return {};

  const order = cart.data || {};
  const isMergeError = locationState.error?.errors?.[0].code === 40003;
  const hasOutOfStockItem = order?.line_items?.some((item) => item.stock_state === STOCK_STATE.OUT_OF_STOCK);

  if (isMergeError && hasOutOfStockItem) {
    return { detail: locationState.error?.errors?.[0].detail, isShowErrorDetail: true };
  }
  // meger error but no out of stock item
  // wiil use order before login as current order, so no need to show error detail
  if (isMergeError && !hasOutOfStockItem) {
    return { detail: locationState.error?.errors?.[0].detail, isShowErrorDetail: false };
  }
  return { errorDetail: locationState.error?.errors?.[0].detail, isShowErrorDetail: true };
};
