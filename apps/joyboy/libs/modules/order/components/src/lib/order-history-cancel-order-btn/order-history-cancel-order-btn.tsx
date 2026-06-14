'use client';
import { Button } from '@castlery/fortress';
import { useCancelOrderV1Mutation, orderHistoryCancelOrderClickedEvent } from '@castlery/modules-order-domain';
import { OrderDataV1 } from '@castlery/types';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { accessInPos } from '@castlery/config';

interface OrderHistoryCancelOrderBtnProps {
  order: OrderDataV1;
  /**
   * 取消成功后的回调函数
   * 可选，用于处理取消成功后的额外逻辑（如返回列表页）
   */
  onSuccess?: () => void;
  /**
   * 取消失败后的回调函数
   * 可选，用于处理取消失败的情况
   */
  onError?: (error: unknown) => void;
  /**
   * 按钮文本
   */
  children?: React.ReactNode;
}

/**
 * Cancel Order 按钮组件
 *
 * 用于取消订单，包含完整的 API 调用逻辑和加载状态
 *
 * @example
 * ```tsx
 * // 在订单列表中使用
 * <OrderHistoryCancelOrderBtn order={order} />
 *
 * // 在详情页中使用，取消成功后返回列表页
 * <OrderHistoryCancelOrderBtn
 *   order={order}
 *   onSuccess={() => router.back()}
 * />
 * ```
 */
export function OrderHistoryCancelOrderBtn({
  order,
  onSuccess,
  onError,
  children = 'Cancel Order',
}: OrderHistoryCancelOrderBtnProps) {
  // 取消订单 mutation
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderV1Mutation();
  const dispatch = useAppDispatch();

  // 处理取消订单
  const handleCancelOrder = async () => {
    if (!order?.id) {
      console.warn('⚠️ 订单号不存在，无法取消订单');
      return;
    }

    if (accessInPos) {
      dispatch(orderHistoryCancelOrderClickedEvent());
    }

    try {
      console.log('🚫 取消订单 - 订单号:', order.id);
      await cancelOrder({ id: order.id }).unwrap();
      console.log('✅ 订单已成功取消');
      // 调用成功回调
      onSuccess?.();
    } catch (error) {
      console.error('❌ 取消订单失败:', error);

      // 调用失败回调
      onError?.(error);
    }
  };

  return (
    <Button
      variant="outlined"
      color="neutral"
      loading={isCancelling}
      disabled={isCancelling}
      onClick={handleCancelOrder}
    >
      {children}
    </Button>
  );
}

export default OrderHistoryCancelOrderBtn;
