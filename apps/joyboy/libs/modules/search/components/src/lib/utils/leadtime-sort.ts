import type { NumericMenuConnectorParamsItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

/**
 * 对 leadtime filters 进行智能排序
 *
 * 排序规则：
 * 1. 动态filters（有明确end值的）按end值升序排序 - 交付时间短的在前
 * 2. 静态filters（通常是范围filters）按start值排序
 * 3. 开放式filters（只有start没有end）放在最后
 *
 * 注意：排序应该在数据生成的源头（getLeadTimeItemsData）进行，
 * 这样后续所有使用的地方都不需要再处理排序，保证一致性和性能。
 *
 * @param items - 要排序的 leadtime filter items
 * @returns 排序后的 items 数组
 */
export function sortLeadTimeItems(items: NumericMenuConnectorParamsItem[]): NumericMenuConnectorParamsItem[] {
  return [...items].sort((a, b) => {
    // 如果都有 end 值，按 end 值升序排序（交付时间短的在前）
    if (a.end !== undefined && b.end !== undefined) {
      return a.end - b.end;
    }

    // 有 end 值的排在只有 start 值的前面（动态优先）
    if (a.end !== undefined && b.end === undefined) {
      return -1;
    }
    if (a.end === undefined && b.end !== undefined) {
      return 1;
    }

    // 都只有 start 值，按 start 值升序排序
    const aStart = a.start || 0;
    const bStart = b.start || 0;
    return aStart - bStart;
  });
}
