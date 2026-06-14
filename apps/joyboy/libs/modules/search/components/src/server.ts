// Use this file to export React server components

// API Routes
export * from './lib/api/search/route';

// Server Components - Templates
export * from './lib/templates/search-results-page';
export * from './lib/templates/product-listing-page';
export * from './lib/templates/category-landing-page';
export * from './lib/templates/discover-page.pos';

// Server Components - Search View Wrappers
export {
  SearchViewServerWrapper,
  type SearchViewServerWrapperProps,
} from './lib/search-view/search-view-server-wrapper';
export { SearchViewSuspenseWrapper } from './lib/search-view/search-view-suspense-wrapper';
