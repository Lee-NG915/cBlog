'use client';

// import { Product } from '@castlery/modules-product-domain';
import { Loading, Pagination, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { GlobalReview, ReviewImageItem, selectProduct } from '@castlery/modules-product-domain';
import { SortBy, type SortOption } from '@castlery/shared-components';
import { CountryCode, CountryName } from '@castlery/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ProductReviewsItem } from './components/product-reviews-items/product-reviews-item';
import { OrderItems, useGlobalReviews } from './hooks/useGlobalReviews';
import { EVENT_PDP_REVIEW_SECTION } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { ReviewRating } from './components/review-rating/review-rating';
import { ImageInfiniteList } from './components/image-infinite-list/image-infinite-list';
import { QuickFilter } from './components/quick-filter/quick-filter';
import { ReviewImageGallery } from './components/review-image-gallery/review-image-gallery';
// interface ProductReviewsClientProps {
//   // productData: Product;
// }

export function ProductReviewsClient() {
  // const { productData } = props;
  const productData = useSelector(selectProduct);
  const {
    orderItems,
    setOrderItems,
    currentCountry,
    setCurrentCountry,
    setCurrentTag,
    pageNumber,
    setPageNumber,
    reviewsLoading,
    reviews,
    averageRating,
    totalCount,
    availableTags,
    setAvailableTags,
    totalPages,
    fixedImageGallery,
    fixedImageGalleryLoading,
    handleFixedImageGalleryLoadMore,
    setClickedImageKey,
    reviewImages,
    reviewImagesLoading,
    reviewImagesLoadLocking,
    handleReviewImagesLocatedLoadMore,
    handleReviewImagesLocatedLoadPrev,
    clickedImageKey,
    clickedImagePosition,
  } = useGlobalReviews(productData);
  const { desktop, tablet, mobile } = useBreakpoints();
  const dispatch = useAppDispatch();

  const sortOptions: SortOption[] = [
    { value: 'recommended', label: 'RECOMMENDED', dataLabel: 'Recommended' },
    { value: 'most_recent', label: 'MOST RECENT', dataLabel: 'Most Recent' },
    { value: 'rating_high_to_low', label: 'RATING: HIGH TO LOW', dataLabel: 'Rating - High to Low' },
    { value: 'rating_low_to_high', label: 'RATING: LOW TO HIGH', dataLabel: 'Rating - Low to High' },
    { value: 'with_image', label: 'WITH PICTURES', dataLabel: 'With Pictures' },
    { value: 'product_self', label: 'VIEW PRODUCT ITSELF', dataLabel: 'View Product Itself' },
  ];

  const locationOptions: SortOption[] = Object.keys(CountryCode).map((country) => ({
    value: country,
    label: CountryName[country as CountryCode],
  }));

  const [showLoading, setShowLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryReview, setGalleryReview] = useState<ReviewImageItem | null>(null);
  const reviewFiltersRef = useRef<HTMLDivElement | null>(null);

  const sortDisplay = useMemo(() => {
    return 'SORT BY';
  }, [desktop]);

  const locationDisplay = useMemo(() => {
    return 'LOCATION';
  }, [desktop]);

  const reviewColumns = useMemo(() => {
    if (!reviews) return [[], []] as GlobalReview[][];

    return reviews.reduce<GlobalReview[][]>(
      (columns, review, index) => {
        columns[index % 2].push(review);
        return columns;
      },
      [[], []]
    );
  }, [reviews]);

  useEffect(() => {
    if (reviews !== undefined) {
      setShowLoading(false);
    }
  }, [reviews]);

  const handleTrack = useCallback(
    async (action: string, label: string) => {
      await dispatch(EVENT_PDP_REVIEW_SECTION({ action, label }));
    },
    [dispatch]
  );

  const handleSortChange = (value: string) => {
    setPageNumber(1);
    setOrderItems(value as OrderItems);
    const target = sortOptions.find((option) => option.value === value);
    if (target) {
      handleTrack('review_dropdown', target.dataLabel);
    }
  };

  const handleQuickFilterSelect = (key: string) => {
    const isCurrentlySelected = availableTags.find((option) => option.key === key)?.selected;

    if (isCurrentlySelected) {
      setCurrentTag(undefined);
      setAvailableTags((prevOptions) => prevOptions.map((option) => ({ ...option, selected: false })));
    } else {
      setCurrentTag(key);
      setAvailableTags((prevOptions) => prevOptions.map((option) => ({ ...option, selected: option.key === key })));
    }
    setPageNumber(1);
  };

  const handleLocationChange = (value: string) => {
    setPageNumber(1);
    setCurrentCountry(value as CountryCode);
  };

  const handleReviewImageClick = useCallback((review: GlobalReview, imageUrl: string, imageKey: string) => {
    setGalleryReview({
      url: imageUrl,
      key: imageKey,
      review_id: review.id,
      title: review.title,
      content: review.content,
      review_date: review.created_at,
      rating: review.rating,
      is_featured: review.is_featured,
    });
    setGalleryOpen(true);
    setClickedImageKey(imageKey);
  }, []);

  const handleReviewImageInGalleryClick = useCallback((review: ReviewImageItem) => {
    setGalleryReview(review);
    setGalleryOpen(true);
    setClickedImageKey(review.key);
  }, []);

  const handleReviewImageGalleryClose = useCallback(() => {
    setGalleryOpen(false);
  }, []);

  const scrollToReviewFiltersTop = useCallback(() => {
    if (!reviewFiltersRef.current) return;

    const top = reviewFiltersRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <>
      <Stack
        sx={(theme) => ({
          padding: `${theme.spacing(15)} ${theme.spacing(8)} ${theme.spacing(10)} ${theme.spacing(8)}`,
          ...(mobile && {
            padding: `${theme.spacing(8)} ${theme.spacing(4)}`,
          }),
          ...(tablet && {
            padding: `${theme.spacing(8)} ${theme.spacing(6)}`,
          }),
        })}
        id="reviews-container"
        data-section="product-reviews"
      >
        <Stack
          gap={(theme) => (desktop ? theme.spacing(6) : theme.spacing(4))}
          alignItems={'flex-start'}
          mb={(theme) => theme.spacing(6)}
        >
          <Typography level="h2">What our customers are saying</Typography>
          <Stack
            sx={(theme) => ({
              flexDirection: !mobile ? 'row' : 'column',
              width: '100%',
              mb: desktop ? 0 : theme.spacing(2),
            })}
            gap={(theme) => (mobile ? theme.spacing(6) : 0)}
          >
            <ReviewRating averageRating={averageRating} totalCount={totalCount} />
            <ImageInfiniteList
              fixedImageGallery={fixedImageGallery}
              fixedImageGalleryLoading={fixedImageGalleryLoading}
              handleFixedImageGalleryLoadMore={handleFixedImageGalleryLoadMore}
              onImageClick={(image) => {
                handleReviewImageInGalleryClick(image);
                dispatch(
                  EVENT_PDP_REVIEW_SECTION({
                    action: 'click',
                    label: 'top_image',
                    tag: 'image_id',
                    tagValue: image.key,
                  })
                );
              }}
            />
          </Stack>
          {availableTags.length > 0 && (
            <QuickFilter
              options={availableTags}
              onSelect={(key) => {
                handleQuickFilterSelect(key);
                dispatch(
                  EVENT_PDP_REVIEW_SECTION({
                    action: 'click',
                    label: 'quick_filter',
                    tag: 'selected_tag',
                    tagValue: key,
                  })
                );
              }}
            />
          )}
        </Stack>
        <Stack
          ref={reviewFiltersRef}
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          sx={(theme) => ({ ...(!desktop && { mb: theme.spacing(4) }) })}
        >
          <SortBy
            value={orderItems}
            options={sortOptions}
            onChange={handleSortChange}
            label={sortDisplay}
            labelProps={{
              sx: {
                color: 'var(--fortress-palette-brand-terracotta-500)',
              },
            }}
          />
          <SortBy
            value={currentCountry}
            options={locationOptions}
            onChange={handleLocationChange}
            label={locationDisplay}
            labelProps={{
              sx: {
                color: 'var(--fortress-palette-brand-terracotta-500)',
              },
            }}
          />
        </Stack>
        {showLoading ? (
          <Stack justifyContent={'center'} alignItems={'center'} mt={desktop ? 7 : mobile ? 8 : 5}>
            <Loading theme="dark" />
          </Stack>
        ) : (
          <>
            {desktop ? (
              <Stack
                sx={{
                  flexDirection: 'row',
                  gap: 6,
                  alignItems: 'flex-start',
                  width: '100%',
                }}
              >
                {reviewColumns.map((columnReviews, columnIndex) => (
                  <Stack
                    key={`review-column-${columnIndex}`}
                    sx={(theme) => ({
                      flex: `0 0 calc((100% - ${theme.spacing(6)}) / 2)`,
                      minWidth: 0,
                      gap: 6,
                    })}
                  >
                    {columnReviews.map((review) => (
                      <Stack key={review.id} sx={{ width: '100%', height: 'fit-content', minWidth: 0 }}>
                        <ProductReviewsItem review={review} onReviewImageClick={handleReviewImageClick} />
                      </Stack>
                    ))}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Stack
                sx={{
                  gap: 4,
                }}
              >
                {reviews?.map((review) => (
                  <Stack key={review.id} sx={{ width: '100%', height: 'fit-content' }}>
                    <ProductReviewsItem review={review} onReviewImageClick={handleReviewImageClick} />
                  </Stack>
                ))}
              </Stack>
            )}
            {reviews?.length === 0 && !reviewsLoading && (
              <Stack>
                <Typography level="body1" mt={desktop ? 7 : mobile ? 8 : 5} sx={{ width: '100%' }}>
                  There are currently no reviews available.
                </Typography>
              </Stack>
            )}
            <Pagination
              sx={(theme: any) => ({
                marginTop: desktop ? theme.spacing(7) : mobile ? theme.spacing(8) : theme.spacing(5),
              })}
              count={totalPages}
              page={pageNumber}
              siblingCount={mobile ? 0 : 1}
              onChange={(event: React.ChangeEvent<unknown> | null, page: number) => {
                setPageNumber(page);
                handleTrack('select_review_page', `${page}`);
                scrollToReviewFiltersTop();
              }}
            />
          </>
        )}
      </Stack>
      {!!galleryReview?.url && (
        <ReviewImageGallery
          open={galleryOpen}
          onClose={handleReviewImageGalleryClose}
          review={galleryReview}
          reviewImages={reviewImages}
          reviewImagesLoading={reviewImagesLoading}
          reviewImagesLoadLocking={reviewImagesLoadLocking}
          onLoadMoreReviewImages={handleReviewImagesLocatedLoadMore}
          onLoadPrevReviewImages={handleReviewImagesLocatedLoadPrev}
          clickedImageKey={clickedImageKey}
          clickedImagePosition={clickedImagePosition}
        />
      )}
    </>
  );
}
