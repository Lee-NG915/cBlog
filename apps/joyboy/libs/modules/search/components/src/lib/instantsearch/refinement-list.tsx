import { useRefinementList, UseRefinementListProps } from 'react-instantsearch';
import { FilterList, FilterListItem } from './filter-list';

export interface CustomRefinementListProps extends UseRefinementListProps {
  hideShowMoreBtn?: boolean;
}

export function CustomRefinementList(props: CustomRefinementListProps) {
  const { hideShowMoreBtn = false, ...refinementListProps } = props;
  const { items, refine, canToggleShowMore, isShowingMore, toggleShowMore } = useRefinementList(refinementListProps);

  // 转换为FilterListItem格式
  const filterItems: FilterListItem[] = items.map((item) => ({
    value: item.value,
    label: item.label,
    isChecked: item.isRefined,
  }));

  return (
    <FilterList
      items={filterItems}
      onItemToggle={refine}
      canToggleShowMore={canToggleShowMore}
      isShowingMore={isShowingMore}
      onToggleShowMore={toggleShowMore}
      hideShowMoreBtn={hideShowMoreBtn}
      aria-label={refinementListProps.attribute}
      role="group"
    />
  );
}
