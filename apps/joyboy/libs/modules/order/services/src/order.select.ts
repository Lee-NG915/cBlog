import { RootState } from '@castlery/shared-redux-store';
import { getOrderByOrderNumber, selectCurrentOrderNumber } from '@castlery/modules-order-domain';

// 1. 直接通过 RTK 的 select 获取数据
//  建议 直接从 RTK 中获取数据，而不是基于 RTK 接口成功后自己 updated 到自己的slice中
//  因为 如果 RTK 获取的时候 可以获取到缓存里的数据，在不强制发起新的接口请求的时候，是不会触发 RTK 的成功回调
//  如 (getOrderByOrderNumber.matchFulfilled)
// 2. 这个 Order 在业务上不区分POS和WEB，表示当前应用的默认 Order
// cc: @abbywang23
export const selectOrder = (state: RootState) => {
  const orderNumber = selectCurrentOrderNumber(state);
  if (!orderNumber) return;
  return getOrderByOrderNumber.select(orderNumber);
};
