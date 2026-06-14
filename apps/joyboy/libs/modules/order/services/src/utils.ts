import { EcEnv } from '@castlery/config';
import { Order } from '@castlery/types';
export const format = (num: number, decimal = 0) => {
  try {
    return (+num)
      .toFixed(decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\.0+$/, '');
  } catch (error) {
    // console.error(error);
    return '0';
  }
};
export const toPrice = (num: number, zeroToFree = false) => {
  try {
    num = +num;
    if (num > 0) {
      return `$${format(num, 2)}`;
    } else if (num < 0) {
      return `-${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}${format(-num, 2)}`;
    } else {
      if (zeroToFree) {
        return 'Free';
      } else {
        return `${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}0`;
      }
    }
  } catch (error) {
    // console.error(error);
    return '';
  }
};

/**
 * 比较两个订单数据，返回最新的那个
 * @param prev 前一个订单数据
 * @param next 下一个订单数据
 * @returns 最新的订单数据
 */
export function pickLatest<T extends Order>(
  prev: T | null | undefined,
  next: T | null | undefined
): T | null | undefined {
  // 确保数据显示始终是最新的s
  if (prev?.updated_at) {
    if (next?.updated_at) {
      if (Date.parse(prev.updated_at) <= Date.parse(next.updated_at)) {
        return next;
      }
      if (prev.create_type === 'schedule_delivery') {
        return next;
      }
    }
    return prev;
  }
  return next;
}
