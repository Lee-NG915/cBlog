'use client';
import { Button } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useAsyncFn } from 'react-use';
import { posRoutes } from '@castlery/config';
import { initCheckoutCommand } from '@castlery/modules-cart-services';
import { selectCheckoutDisabled, selectCheckoutLoading } from '@castlery/modules-cart-domain';
import { useRouter } from 'nextjs-toploader/app';
import { enterApp, selectedCustomerId } from '@castlery/modules-user-domain';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { useHasPosUmsPermission } from '@castlery/shared-components';

/**
 * @description:  POS 结算按钮
 * @note: 2025/08/28 @abby
 * 1. 检查是否存在 blocked items
 * 2. 初始化 checkout
 * 3. 跳转至 checkout 页面
 * @returns
 */
export const PosCheckoutButton = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const checkoutDisabled = useAppSelector(selectCheckoutDisabled);
  const checkoutLoading = useAppSelector(selectCheckoutLoading);
  const customerId = useAppSelector(selectedCustomerId);
  const hasCheckoutPermission = useHasPosUmsPermission(POS_UMS_PERMISSIONS.posTransactionAccess);

  const [_, handleCheckout] = useAsyncFn(async () => {
    // 1. check blocked items
    if (checkoutDisabled) {
      return;
    }
    // 2. init checkout
    const res = await dispatch(initCheckoutCommand());
    if ('error' in res) {
      return false;
    }
    // 3. go to checkout page
    dispatch(
      enterApp({
        page: 'POS_CHECKOUT',
      })
    );
    router.push(posRoutes.checkout);
  }, [dispatch, checkoutDisabled]);

  return (
    <Button
      fullWidth
      onClick={handleCheckout}
      loading={checkoutLoading}
      disabled={checkoutDisabled || !customerId || !hasCheckoutPermission}
    >
      Checkout
    </Button>
  );
};

export default PosCheckoutButton;
