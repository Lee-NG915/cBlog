import type { CheckoutPageContext } from './use-checkout-page-context';
import type { CheckoutPermissionState } from './use-checkout-permission-state';
import type { CheckoutPaths } from './paths';

/**
 * 纯函数：根据页面上下文 + 权限状态 + 路径，决策是否需要 redirect。
 * 返回 null 表示放行；返回路径字符串表示需要跳转。
 */
export const resolveCheckoutRedirect = (
  context: CheckoutPageContext,
  state: CheckoutPermissionState,
  paths: CheckoutPaths
): string | null => {
  const { isOnPaymentCallbackPage, isOnPaymentPage, isOnAddressPage, finalOrderId } = context;
  const {
    hasCheckoutPermission,
    hasLoggedIn,
    hasShippingMethodConfirmed,
    hasPaymentPageNonZeroVisited,
    checkoutRoot,
    isZeroOrder,
  } = state;

  // payment callback 页：完全放行
  if (isOnPaymentCallbackPage) return null;

  if (isOnPaymentPage) {
    if (finalOrderId) {
      // 携带 orderId：已存在订单（如支付结果页），只校验登录
      if (!hasLoggedIn) return paths.cart;
      return null;
    }

    // 未携带 orderId：正常结算流程，依次校验登录、checkout session、method 步骤
    if (!hasLoggedIn || !hasCheckoutPermission) return paths.cart;
    if (!hasShippingMethodConfirmed) return paths.method;
    // 0 元订单不允许通过 link 直接访问 payment 页
    // 例外：用户正常进入 payment 后应用 coupon 变 0 元（paymentPageNonZeroVisited 标志已写入）
    if (isZeroOrder && !hasPaymentPageNonZeroVisited) return paths.method;
    return null;
  }

  // 非 payment 页（address / method 等）
  if (!hasCheckoutPermission || !hasLoggedIn) return paths.cart;
  // address 步骤校验：依赖 checkoutRoot（API 数据），加载后才执行
  if (checkoutRoot && !isOnAddressPage && !checkoutRoot.addressInfo?.id) return paths.address;
  return null;
};
