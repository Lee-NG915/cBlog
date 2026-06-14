import { SearchViewServerWrapper } from '../search-view/search-view-server-wrapper';

export function DiscoverPagePOS() {
  return (
    <SearchViewServerWrapper
      indexName="pos_product"
      useInfiniteHits={true}
      hitsPerPage={24}
      defaultShowFilters={true}
    />
  );
}
