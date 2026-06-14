'use client';

import {
  BundleVariants,
  GlobalReview,
  Product,
  ReviewImageItem,
  selectBundleVariants,
  selectVariant,
  Variant,
} from '@castlery/modules-product-domain';
import {
  getWebProductReviewsImagesCommand,
  getWebProductReviewsCommand,
  getWebProductReviewsLocateVariantImageCommand,
} from '@castlery/modules-product-services';
import { useAppDispatch, useSelector } from '@castlery/shared-redux-store';
import { CountryCode } from '@castlery/utils';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@castlery/observability/client';
import { useBreakpoints } from '@castlery/fortress';

export enum OrderItems {
  recommended = 'recommended',
  mostRecent = 'most_recent',
  ratingHighToLow = 'rating_high_to_low',
  ratingLowToHigh = 'rating_low_to_high',
  withImage = 'with_image',
  productSelf = 'product_self',
}

export function useGlobalReviews(productData: Product | undefined) {
  const dispatch = useAppDispatch();
  const { desktop } = useBreakpoints();
  const [orderItems, setOrderItemsState] = useState<OrderItems>(OrderItems.recommended);
  const [currentCountry, setCurrentCountryState] = useState<CountryCode>(CountryCode.ALL);
  const [currentTag, setCurrentTag] = useState<string | undefined>(undefined);
  const [availableTags, setAvailableTags] = useState<{ key: string; label: string; selected: boolean }[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(6);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const variant = useSelector(selectVariant);
  const bundleVariant = useSelector(selectBundleVariants);
  const [reviews, setReviews] = useState<GlobalReview[]>([]);
  const [reviewImages, setReviewImages] = useState<ReviewImageItem[]>([]);
  const [reviewImagesLoading, setReviewImagesLoading] = useState(false);
  const [reviewImagesLoadLocking, setReviewImagesLoadLocking] = useState(false);
  const [reviewImagesNextPageNumber, setReviewImagesNextPageNumber] = useState(1);
  const [reviewImagesPrevPageNumber, setReviewImagesPrevPageNumber] = useState(0);
  const [reviewImagesForbidLoadNext, setReviewImagesForbidLoadNext] = useState<boolean>(false);
  const [reviewImagesForbidLoadPrev, setReviewImagesForbidLoadPrev] = useState<boolean>(false);
  const [fixedImageGallery, setFixedImageGallery] = useState<ReviewImageItem[]>([]);
  const [fixedImageGalleryLoading, setFixedImageGalleryLoading] = useState(false);
  const [fixedImageGalleryPageNumber, setFixedImageGalleryPageNumber] = useState(1);
  const [fixedImageGalleryForbidLoadMore, setFixedImageGalleryForbidLoadMore] = useState<boolean>(false);
  const [clickedImageKey, setClickedImageKey] = useState<string | undefined>(undefined);
  const [clickedImagePosition, setClickedImagePosition] = useState<{
    currentPage: number;
    totalCount: number;
  } | null>(null);
  const initFixedImageGalleryRef = useRef(false);
  const reviewImagesRequestIdRef = useRef(0);
  const reviewImagesLoadLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [averageRating, totalCount] = useMemo(() => {
    let averageRating = 0;
    let totalCount = 0;
    if (productData?.reviews && 'average_rating' in productData.reviews) {
      averageRating = productData.reviews.average_rating;
    }
    if (productData?.reviews && 'total_count' in productData.reviews) {
      totalCount = productData.reviews.total_count;
    }
    return [averageRating, totalCount];
  }, [productData]);

  const coreParams = useMemo(
    () => ({
      product: productData,
      variant,
      bundleVariant,
      country: currentCountry,
      orderBy: orderItems,
      tag: currentTag,
    }),
    [productData, variant, bundleVariant, currentCountry, orderItems, currentTag]
  );

  const prevCoreParamsRef = useRef(coreParams);
  const prevTagTriggerRef = useRef<{ country: CountryCode; orderBy: OrderItems } | null>(null);
  const isCoreParamsChanged = JSON.stringify(prevCoreParamsRef.current) !== JSON.stringify(coreParams);

  useEffect(() => {
    setPageNumber(1);
    setPerPage(6);
    prevCoreParamsRef.current = coreParams;
  }, [coreParams]);

  const setCurrentCountry: Dispatch<SetStateAction<CountryCode>> = (value) => {
    setCurrentTag(undefined);
    setCurrentCountryState(value);
  };

  const setOrderItems: Dispatch<SetStateAction<OrderItems>> = (value) => {
    setCurrentTag(undefined);
    setOrderItemsState(value);
  };

  useEffect(() => {
    if (!coreParams.product || (!coreParams.variant && !coreParams.bundleVariant)) {
      return;
    }

    if (isCoreParamsChanged && pageNumber !== 1) {
      return;
    }

    const queryParams = {
      ...coreParams,
      pageNumber,
      perPage,
    };

    const getReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await dispatch(getWebProductReviewsCommand(queryParams)).unwrap();
        setReviews(res?.results || []);
        setTotalPages(res?.total_pages || 0);
        const shouldUpdateAvailableTags =
          !prevTagTriggerRef.current ||
          prevTagTriggerRef.current.country !== coreParams.country ||
          prevTagTriggerRef.current.orderBy !== coreParams.orderBy;

        if (shouldUpdateAvailableTags) {
          const availableTags = res?.available_tags?.map((tag: string) => ({
            key: tag,
            label: tag,
            selected: false,
          }));
          setAvailableTags(availableTags || []);
          prevTagTriggerRef.current = {
            country: coreParams.country,
            orderBy: coreParams.orderBy,
          };
        }
      } catch (e) {
        logger.error('Failed to fetch product reviews', {
          error: e,
          productId: coreParams.product?.id,
          variantId: coreParams.variant?.id || coreParams.bundleVariant?.variant_id,
          country: coreParams.country,
          orderBy: coreParams.orderBy,
        });
        setReviews([]);
        setTotalPages(0);
      } finally {
        setReviewsLoading(false);
      }
    };
    getReviews();
  }, [coreParams, pageNumber, perPage, dispatch]);

  useEffect(() => {
    return () => {
      if (reviewImagesLoadLockTimeoutRef.current) {
        clearTimeout(reviewImagesLoadLockTimeoutRef.current);
      }
    };
  }, []);

  const getReviewImagesGallery = async (queryParams: {
    product?: Product;
    variant?: Variant;
    bundleVariant?: BundleVariants;
    country: CountryCode;
    orderBy: OrderItems;
    pageNumber: number;
    perPage: number;
  }) => {
    try {
      setFixedImageGalleryLoading(true);
      const res = await dispatch(getWebProductReviewsImagesCommand(queryParams)).unwrap();
      setFixedImageGallery((prev) => [...prev, ...(res?.results || [])]);
      setFixedImageGalleryForbidLoadMore((res?.results?.length || 0) < 15);
    } catch (e) {
      logger.error('Failed to fetch product review images', {
        error: e,
      });
    } finally {
      setFixedImageGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (initFixedImageGalleryRef.current) {
      return;
    }
    initFixedImageGalleryRef.current = true;
    if ((variant || bundleVariant) && productData) {
      getReviewImagesGallery({
        product: productData,
        variant,
        bundleVariant,
        country: CountryCode.ALL,
        orderBy: OrderItems.recommended,
        pageNumber: fixedImageGalleryPageNumber,
        perPage: 15,
      });
    }
  }, [productData, variant, bundleVariant, fixedImageGalleryPageNumber]);

  const handleFixedImageGalleryLoadMore = () => {
    if (fixedImageGalleryForbidLoadMore) {
      return;
    }
    const nextPageNumber = fixedImageGalleryPageNumber + 1;
    setFixedImageGalleryPageNumber(nextPageNumber);
    getReviewImagesGallery({
      product: productData,
      variant,
      bundleVariant,
      country: CountryCode.ALL,
      orderBy: OrderItems.recommended,
      pageNumber: nextPageNumber,
      perPage: 15,
    });
  };

  const getReviewImagesLocated = async (queryParams: {
    product?: Product;
    variant?: Variant;
    bundleVariant?: BundleVariants;
    perPage: number;
  }) => {
    if (!clickedImageKey) {
      return;
    }
    const requestId = ++reviewImagesRequestIdRef.current;
    try {
      if (reviewImagesLoadLockTimeoutRef.current) {
        clearTimeout(reviewImagesLoadLockTimeoutRef.current);
        reviewImagesLoadLockTimeoutRef.current = null;
      }
      setReviewImagesLoadLocking(false);
      setReviewImagesLoading(true);
      setReviewImagesForbidLoadNext(false);
      setReviewImagesForbidLoadPrev(false);
      setReviewImages([]);
      const res = await dispatch(
        getWebProductReviewsLocateVariantImageCommand({
          key: clickedImageKey,
          perPage: queryParams.perPage,
          product: queryParams.product,
          variant: queryParams.variant,
          bundleVariant: queryParams.bundleVariant,
          country: currentCountry,
        })
      ).unwrap();
      if (requestId !== reviewImagesRequestIdRef.current) {
        return;
      }
      const results = res?.results || [];
      setClickedImagePosition({
        currentPage: Math.max(1, res?.current_page || 1),
        totalCount: res?.count || 0,
      });
      const currentPage = Math.max(1, res?.current_page || 1);
      const totalPages = Math.max(currentPage, res?.total_pages || currentPage);
      setReviewImages(results);
      setReviewImagesNextPageNumber(currentPage + 1);
      setReviewImagesPrevPageNumber(Math.max(0, currentPage - 1));
      setReviewImagesForbidLoadNext(currentPage >= totalPages || results.length < queryParams.perPage);
      setReviewImagesForbidLoadPrev(currentPage <= 1);
      setReviewImagesLoadLocking(true);
      reviewImagesLoadLockTimeoutRef.current = setTimeout(() => {
        setReviewImagesLoadLocking(false);
        reviewImagesLoadLockTimeoutRef.current = null;
      }, 3000);
    } catch (e) {
      logger.error('Failed to fetch review images', {
        error: e,
      });
      if (requestId === reviewImagesRequestIdRef.current) {
        setReviewImagesLoadLocking(true);
        if (reviewImagesLoadLockTimeoutRef.current) {
          clearTimeout(reviewImagesLoadLockTimeoutRef.current);
        }
        reviewImagesLoadLockTimeoutRef.current = setTimeout(() => {
          setReviewImagesLoadLocking(false);
          reviewImagesLoadLockTimeoutRef.current = null;
        }, 3000);
      }
    } finally {
      if (requestId === reviewImagesRequestIdRef.current) {
        setReviewImagesLoading(false);
      }
    }
  };

  const getReviewImagesLocatedLoadMore = async (queryParams: {
    product?: Product;
    variant?: Variant;
    bundleVariant?: BundleVariants;
    perPage: number;
  }) => {
    if (!clickedImageKey || reviewImagesLoading || reviewImagesLoadLocking || reviewImagesForbidLoadNext) {
      return;
    }
    const targetPage = Math.max(1, reviewImagesNextPageNumber);
    const requestId = ++reviewImagesRequestIdRef.current;
    try {
      setReviewImagesLoading(true);
      const perPage = queryParams.perPage;
      const res = await dispatch(
        getWebProductReviewsImagesCommand({
          perPage,
          product: queryParams.product,
          variant: queryParams.variant,
          bundleVariant: queryParams.bundleVariant,
          country: currentCountry,
          orderBy: OrderItems.recommended,
          pageNumber: targetPage,
        })
      ).unwrap();
      if (requestId !== reviewImagesRequestIdRef.current) {
        return;
      }
      const results = res?.results || [];
      const currentPage = Math.max(1, res?.current_page || targetPage);
      const totalPages = Math.max(currentPage, res?.total_pages || currentPage);
      setReviewImages((prev) => [...prev, ...results]);
      setReviewImagesNextPageNumber(currentPage + 1);
      setReviewImagesForbidLoadNext(currentPage >= totalPages || results.length < perPage);
    } catch (e) {
      logger.error('Failed to fetch review images', {
        error: e,
      });
    } finally {
      if (requestId === reviewImagesRequestIdRef.current) {
        setReviewImagesLoading(false);
      }
    }
  };

  const getReviewImagesLocatedLoadPrev = async (queryParams: {
    product?: Product;
    variant?: Variant;
    bundleVariant?: BundleVariants;
    perPage: number;
  }) => {
    if (!clickedImageKey || reviewImagesLoading || reviewImagesLoadLocking || reviewImagesForbidLoadPrev) {
      return;
    }
    if (reviewImagesPrevPageNumber <= 0) {
      setReviewImagesForbidLoadPrev(true);
      return;
    }
    const targetPage = reviewImagesPrevPageNumber;
    const requestId = ++reviewImagesRequestIdRef.current;
    try {
      setReviewImagesLoading(true);
      const perPage = queryParams.perPage;
      const res = await dispatch(
        getWebProductReviewsImagesCommand({
          perPage,
          product: queryParams.product,
          variant: queryParams.variant,
          bundleVariant: queryParams.bundleVariant,
          country: currentCountry,
          orderBy: OrderItems.recommended,
          pageNumber: targetPage,
        })
      ).unwrap();
      if (requestId !== reviewImagesRequestIdRef.current) {
        return;
      }
      const results = res?.results || [];
      const currentPage = Math.max(1, res?.current_page || targetPage);
      setReviewImages((prev) => [...results, ...prev]);
      setReviewImagesPrevPageNumber(Math.max(0, currentPage - 1));
      setReviewImagesForbidLoadPrev(currentPage <= 1 || results.length < perPage);
    } catch (e) {
      logger.error('Failed to fetch previous review images', {
        error: e,
      });
    } finally {
      if (requestId === reviewImagesRequestIdRef.current) {
        setReviewImagesLoading(false);
      }
    }
  };

  useEffect(() => {
    if (clickedImageKey) {
      getReviewImagesLocated({
        product: productData,
        variant,
        bundleVariant,
        perPage: desktop ? 56 : 15,
      });
    }
  }, [clickedImageKey, productData, variant, bundleVariant, desktop, currentCountry]);

  const handleReviewImagesLocatedLoadMore = () => {
    getReviewImagesLocatedLoadMore({
      product: productData,
      variant,
      bundleVariant,
      perPage: desktop ? 56 : 15,
    });
  };

  const handleReviewImagesLocatedLoadPrev = () => {
    getReviewImagesLocatedLoadPrev({
      product: productData,
      variant,
      bundleVariant,
      perPage: desktop ? 56 : 15,
    });
  };

  return {
    orderItems,
    setOrderItems,
    currentCountry,
    setCurrentCountry,
    currentTag,
    setCurrentTag,
    pageNumber,
    setPageNumber,
    perPage,
    setPerPage,
    reviewsLoading,
    averageRating,
    totalCount,
    totalPages,
    reviews,
    availableTags,
    setAvailableTags,
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
  };
}
