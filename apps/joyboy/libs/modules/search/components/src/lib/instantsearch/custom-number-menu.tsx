import React from 'react';
import { useNumericMenu, UseNumericMenuProps } from 'react-instantsearch';
import { FilterList, FilterListItem } from './filter-list';

export type CustomNumericMenuProps = UseNumericMenuProps;

// TODO 现在的问题是 如果选项最后的值是空的 选项还是会展示出来 未来需要自己去自定义hook来解决这个问题
export function CustomNumericMenu(props: CustomNumericMenuProps) {
  const { items, refine } = useNumericMenu(props);

  // 转换为FilterListItem格式
  const filterItems: FilterListItem[] = items.map((item) => ({
    value: item.value,
    label: item.label,
    isChecked: item.isRefined,
  }));

  return <FilterList items={filterItems} onItemToggle={refine} ariaLabel="Numeric range filters" role="radiogroup" />;
}
