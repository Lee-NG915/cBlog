'use client';

import { Container, Loading, Pagination, Stack, useBreakpoints } from '@castlery/fortress';
import { getReviewListByPage } from '@castlery/modules-others-domain';
import { GeneralBreadcrumbs } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReviewOverAll } from './components/ReviewOverAll/ReviewOverAll';
import { SingleReview } from './components/SingleReview/SingleReview';
import { HeadBanner } from '../HeadBanner';

type ReviewContainerProps = {
  result: {
    average_rating: string;
    count: number;
    current_page: number;
    results: {
      user_name: string;
      rating: number;
      title: string;
      content: string;
      attachments: {
        url: string;
      }[];
      replies: {
        content: string;
        replied_by: string;
      }[];
      variant: {
        is_available: boolean;
        images: {
          links: {
            feed: string;
          };
        }[];
        product_name: string;
        product_slug: string;
        variant_option_values: {
          option_type_presentation: string;
          presentation: string;
        }[];
      };
    }[];
  };
};

const ReviewContainer = ({ result }: ReviewContainerProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviewList, setReviewList] = useState<ReviewContainerProps['result']>(result);
  const initializedRef = useRef(false);

  const getReviewPage = async (currentPage: number) => {
    setLoading(true);
    const result = await getReviewListByPage({ page: currentPage, per_page: 10 });
    setLoading(false);
    if (result.error) {
      throw new Error(result.error);
    }
    setReviewList(result);
  };

  const updatePageInUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === 1) {
      params.delete('p');
    } else {
      params.set('p', newPage.toString());
    }
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };
  const renderDescription = useMemo(() => {
    if (result.count > 15000) {
      return 'Over 15,000 happy customers. See why fellow shoppers trust and love our products.';
    } else if (result.count < 10000) {
      return '';
    } else {
      {
        return `Over 20000 happy customers. See why fellow shoppers trust and love our products.`;
      }
    }
  }, [result]);
  const { desktop } = useBreakpoints();
  useEffect(() => {
    if (!initializedRef.current) {
      setReviewList(result);
      // 从 URL 参数中读取页面值，如果没有则使用 result.current_page
      const urlPage = searchParams.get('p');
      const initialPage = urlPage ? parseInt(urlPage, 10) : result.current_page;
      setPage(initialPage);
      initializedRef.current = true;
    }
  }, [result, searchParams]);
  return (
    <Container
      disableGutters
      sx={(theme) => ({
        pb: theme.spacing(10),
      })}
    >
      <GeneralBreadcrumbs
        breadcrumbs={[
          {
            label: 'Reviews',
            link: '/reviews',
          },
        ]}
      />
      <HeadBanner
        header="Real customers. Genuine feedback."
        description={renderDescription}
        image={{
          desktop_url:
            'https://res.cloudinary.com/castlery/image/upload/v1755154245/hardcode%20pages/reviews_banner.jpg',
          tablet_url:
            'https://res.cloudinary.com/castlery/image/upload/v1755244327/hardcode%20pages/reviews_banner_mobile.jpg',
          mobile_url:
            'https://res.cloudinary.com/castlery/image/upload/v1755246293/hardcode%20pages/reviews__banner_mobile.jpg',
          alt: 'Reviews Banner',
        }}
      />
      <ReviewOverAll rating={Number(reviewList.average_rating)} reviewNum={reviewList.count} />
      <Stack
        sx={(theme) => ({
          position: 'relative',
          mb: {
            sx: theme.spacing(12.5),
            md: theme.spacing(10),
          },
        })}
      >
        {reviewList.results.map((review) => (
          <SingleReview
            title={review.title}
            content={review.content}
            attachments={review.attachments}
            replies={review.replies}
            user_name={review.user_name}
            rating={review.rating}
            variant={review.variant}
          />
        ))}
        {loading && (
          <Stack
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <Loading color="warning" sx={{ transform: 'scale(2)' }} />
          </Stack>
        )}
      </Stack>
      <Pagination
        count={Math.ceil(reviewList.count / 10)}
        page={page}
        siblingCount={desktop ? 1 : 0}
        onChange={(_event: any, value: number) => {
          setPage(value);
          getReviewPage(value);
          updatePageInUrl(value);
        }}
      />
    </Container>
  );
};

export { ReviewContainer };
