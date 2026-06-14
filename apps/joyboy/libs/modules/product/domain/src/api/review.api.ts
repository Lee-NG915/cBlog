import { api } from '@castlery/shared-redux-services';
import { EcEnv, WEB_CHANNEL, X_CHANNEL } from '@castlery/config';
import type { GlobalReviewResponse } from '../entity/reviews.entity';
import { get } from '@castlery/utils';

export interface ReviewImageItem {
  url: string;
  key: string;
  review_id: number;
  title: string;
  content: string;
  review_date: string;
  rating: number;
  is_featured: boolean;
}

export interface ReviewsByVariantImagesResponse {
  current_page: number;
  total_pages: number;
  count: number;
  per_page: number;
  results: ReviewImageItem[];
}

export const createReviewsByVariantApiPayload = ({
  variantCode,
  orderBy = 'recommended',
  country,
  pageNumber = 1,
  perPage = 15,
  bundleVariantCodes = '',
  tag,
}: {
  variantCode: string;
  orderBy?: string;
  country?: string;
  pageNumber?: number;
  perPage?: number;
  bundleVariantCodes?: string;
  tag?: string;
}) => {
  return {
    url: '/gw/reviews/by_variant',
    params: {
      variant_code: variantCode,
      country: country || EcEnv.NEXT_PUBLIC_COUNTRY,
      order_by: orderBy,
      page: pageNumber,
      per_page: perPage,
      bundle_variant_codes: bundleVariantCodes,
      ...(tag ? { tag } : {}),
    },
    headers: {
      [X_CHANNEL]: WEB_CHANNEL,
    },
  };
};

export const createReviewsByVariantImagesApiPayload = ({
  variantCode,
  orderBy = 'recommended',
  country,
  pageNumber = 1,
  perPage = 15,
  bundleVariantCodes = '',
}: {
  variantCode: string;
  orderBy?: string;
  country?: string;
  pageNumber?: number;
  perPage?: number;
  bundleVariantCodes?: string;
}) => {
  return {
    url: '/gw/reviews/by_variant_images',
    params: {
      variant_code: variantCode,
      country: country || EcEnv.NEXT_PUBLIC_COUNTRY,
      order_by: orderBy,
      page: pageNumber,
      per_page: perPage,
      bundle_variant_codes: bundleVariantCodes,
    },
    headers: {
      [X_CHANNEL]: WEB_CHANNEL,
    },
  };
};

export const createReviewsLocateVariantImageApiPayload = ({
  variantCode,
  key,
  country,
  perPage,
  bundleVariantCodes = '',
}: {
  variantCode: string;
  key: string;
  country?: string;
  perPage: number;
  bundleVariantCodes?: string;
}) => {
  return {
    url: '/gw/reviews/locate_variant_image',
    params: {
      variant_code: variantCode,
      key,
      per_page: perPage,
      country: country || EcEnv.NEXT_PUBLIC_COUNTRY,
      bundle_variant_codes: bundleVariantCodes,
    },
    headers: {
      [X_CHANNEL]: WEB_CHANNEL,
    },
  };
};

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      getReviewsByVariant: builder.query<
        GlobalReviewResponse,
        {
          variantCode: string;
          orderBy: string;
          pageNumber?: number;
          bundleVariantCodes?: string;
        }
      >({
        query: ({ variantCode, orderBy, pageNumber = 1, bundleVariantCodes = '' }) => {
          return {
            ...createReviewsByVariantApiPayload({
              variantCode,
              orderBy,
              pageNumber,
              bundleVariantCodes,
            }),
          };
        },
      }),
      getReviewsByVariantImages: builder.query<
        ReviewsByVariantImagesResponse,
        {
          variantCode: string;
          orderBy?: string;
          country?: string;
          pageNumber?: number;
          perPage?: number;
          bundleVariantCodes?: string;
        }
      >({
        query: ({ variantCode, orderBy, country, pageNumber = 1, perPage = 15, bundleVariantCodes = '' }) => {
          return {
            ...createReviewsByVariantImagesApiPayload({
              variantCode,
              orderBy,
              country,
              pageNumber,
              perPage,
              bundleVariantCodes,
            }),
          };
        },
      }),
      getReviewsLocateVariantImage: builder.query<
        ReviewsByVariantImagesResponse,
        {
          variantCode: string;
          key: string;
          country?: string;
          perPage: number;
          bundleVariantCodes?: string;
        }
      >({
        query: ({ variantCode, key, country, perPage, bundleVariantCodes = '' }) => {
          return {
            ...createReviewsLocateVariantImageApiPayload({
              variantCode,
              key,
              country,
              perPage,
              bundleVariantCodes,
            }),
          };
        },
      }),
      getReviewSummary: builder.query<{ review_rating: number; review_count: number }, void>({
        query: () => 'product_reviews',
      }),
      getVariantReviewSummary: builder.query<
        { average_rating: number; total_count: number; reviews: { rating: number; review_count: number }[] },
        string
      >({
        query: (sku) => `/gw/reviews/summary?variant_code=${sku}`,
      }),
    };
  },
});

export const {
  useGetReviewsByVariantQuery,
  useGetReviewsByVariantImagesQuery,
  useGetReviewsLocateVariantImageQuery,
  useGetReviewSummaryQuery,
  useGetVariantReviewSummaryQuery,
} = reviewsApi;
export const {
  getReviewsByVariant,
  getReviewsByVariantImages,
  getReviewsLocateVariantImage,
  getReviewSummary,
  getVariantReviewSummary,
} = reviewsApi.endpoints;

export const getReviewsByVariantServer = async ({
  variantCode,
  orderBy,
  pageNumber = 1,
}: {
  variantCode: string;
  orderBy: string;
  pageNumber?: number;
}): Promise<GlobalReviewResponse['results']> => {
  const { url, ...rest } = createReviewsByVariantApiPayload({
    variantCode,
    orderBy,
    pageNumber,
  });
  const queryStr = Object.entries(rest.params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  // const res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}${url}?${queryStr}`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     [X_CHANNEL]: WEB_CHANNEL,
  //   },
  // });
  // if (!res.ok) {
  //   throw new Error('Failed to fetch reviews');
  // }
  // const result = await res.json();
  // return result.results;
  try {
    const result = await get(
      `${EcEnv.NEXT_PUBLIC_API_HOST}${url}?${queryStr}`,
      {
        nextOption: {
          tags: [`web-reviews-${queryStr}`],
          revalidate: EcEnv.NEXT_PUBLIC_KNIGHT_API_REVALIDATE_TIME,
        },
      },
      undefined,
      1
    );
    return result.results;
  } catch (e) {
    throw new Error('Failed to fetch reviews');
  }
};

export const getReviewsByVariantImagesServer = async ({
  variantCode,
  orderBy,
  country,
  pageNumber = 1,
  perPage = 15,
  bundleVariantCodes = '',
}: {
  variantCode: string;
  orderBy?: string;
  country?: string;
  pageNumber?: number;
  perPage?: number;
  bundleVariantCodes?: string;
}): Promise<ReviewsByVariantImagesResponse['results']> => {
  const { url, ...rest } = createReviewsByVariantImagesApiPayload({
    variantCode,
    orderBy,
    country,
    pageNumber,
    perPage,
    bundleVariantCodes,
  });
  const queryStr = Object.entries(rest.params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  try {
    const result = await get(
      `${EcEnv.NEXT_PUBLIC_API_HOST}${url}?${queryStr}`,
      {
        nextOption: {
          tags: [`web-review-images-${queryStr}`],
          revalidate: EcEnv.NEXT_PUBLIC_KNIGHT_API_REVALIDATE_TIME,
        },
      },
      undefined,
      1
    );
    return result.results;
  } catch (e) {
    throw new Error('Failed to fetch review images');
  }
};
