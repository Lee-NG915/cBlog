import { Pagination, useBreakpoints } from '@castlery/fortress';
import { usePagination, UsePaginationProps } from 'react-instantsearch';

export function CustomPagination(props: UsePaginationProps) {
  const { currentRefinement, nbPages, refine } = usePagination(props);
  return (
    <Pagination
      count={nbPages}
      page={currentRefinement + 1}
      onChange={(_, pageNumber: any) => refine(pageNumber - 1)}
    />
  );
}
