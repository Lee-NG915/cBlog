import { LineItemSchema } from '@castlery/types';

export function checkEnabledQtyAction(item: LineItemSchema): boolean {
  const { isActive, status } = item;
  return isActive && status === 'enabled';
}

export function isItemOutdated(item: LineItemSchema): boolean {
  if (!item) return false;
  const { isPriceOutdated, isRegionOutdated } = item;
  return isPriceOutdated || isRegionOutdated;
}
