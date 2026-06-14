import { useSortBy, UseSortByProps } from 'react-instantsearch';
import { SortBy } from '@castlery/shared-components';

export function CustomSortBy(props: UseSortByProps) {
  const { currentRefinement, options, refine } = useSortBy(props);

  return (
    <SortBy
      value={currentRefinement}
      options={options}
      onChange={refine}
      label="Sort By"
      labelProps={{
        'aria-label': 'Sort products by different criteria',
        py: 3,
      }}
    />
  );
}
