import { Box, Button, Grid } from '@castlery/fortress';
import { CustomHit, WebProductHit } from './hit';
import { useHits, UseHitsProps, useInfiniteHits, UseInfiniteHitsProps, useInstantSearch } from 'react-instantsearch';
import { ProductCardSkeleton } from '../loading';
// import { Hit as ESHit } from 'instantsearch.js';
import { useRef } from 'react';

// Define types for product data
type OptionValue = {
  value: string;
  presentation: string;
  image_src?: string;
};

type FurnitureProduct = {
  id: string;
  sku: string;
  name: string;
  price: string;
  list_price?: string;
  badges?: string[];
  tags?: string[];
  images?: Array<{
    large: string;
  }>;
  life_style_image?: {
    large: string;
  };
  option_values?: {
    material?: OptionValue;
  };
  color?: string;
  product_short_description?: string;
  taxons?: any[];
};

// Define a collection of furniture products
type FurnitureProductCollection = FurnitureProduct[];

// Shared component for rendering product grid
interface ProductGridProps {
  items: any[];
}

// A customized component for Product Grid using Fortress Grid
export function CustomHits(props: UseHitsProps) {
  const {
    items,
    // sendEvent
  } = useHits(props);
  const { status } = useInstantSearch();

  // If no items, show skeleton to prevent layout shift
  // NoResultsBoundary will hide this component when truly no results
  if (status === 'stalled' || status === 'loading' || items.length === 0) {
    return (
      <Grid
        container
        m={0}
        sx={{ flexFlow: 1, width: '100%' }}
        columnSpacing={4}
        rowSpacing={{
          xs: 4,
          md: 6,
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid key={`skeleton-${index}`} xs={6} sm={4} lg={3}>
            <ProductCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid
      container
      m={0} // 删除默认的负marign
      sx={{ flexFlow: 1, width: '100%' }}
      columnSpacing={
        4 // 两个product card 间的间距
      }
      rowSpacing={{
        xs: 4,
        md: 6,
      }}
    >
      {items.map((hit) => {
        const productHit = hit as unknown as WebProductHit;
        return (
          <Grid key={productHit.objectID} xs={6} sm={4} lg={3}>
            <CustomHit hit={productHit} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export function CustomInfiniteHits(props: UseInfiniteHitsProps & { showFilters?: boolean }) {
  // skipSuspense: true on useInfiniteHits because we're using multiple hooks in this component
  // According to Algolia docs: all hooks except the last one should have skipSuspense: true
  const {
    items,
    // sendEvent,
    showMore,
    isLastPage,
  } = useInfiniteHits(props);
  const { status } = useInstantSearch();

  const isLoading = status === 'loading' || status === 'stalled';

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (!loadMoreRef.current || isLastPage || isLoading) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       const target = entries[0];
  //       if (target.isIntersecting) {
  //         showMore();
  //       }
  //     },
  //     {
  //       threshold: 0.1, // Trigger when 10% of the element is visible
  //       rootMargin: '100px', // Trigger 100px before the element comes into view
  //     }
  //   );

  //   observer.observe(loadMoreRef.current);

  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [showMore, isLastPage, isLoading]);
  const columnCount = props.showFilters ? 4 : 3;

  return (
    <Box>
      <Grid
        container
        m={0} // 删除默认的负marign
        sx={{ flexFlow: 1, width: '100%' }}
        spacing={1}
      >
        {items.map((hit) => {
          const productHit = hit as unknown as WebProductHit;
          return (
            <Grid key={productHit.objectID} xs={6} md={columnCount} lg={3}>
              <CustomHit hit={productHit} />
            </Grid>
          );
        })}
      </Grid>

      {!isLastPage && (
        <Box ref={loadMoreRef} mt={6} display="flex" justifyContent="center" minHeight="60px" alignItems="center">
          <Button onClick={showMore} variant="secondary" loading={isLoading}>
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );
}
