'use client';

import { Container, Loading, Stack, useBreakpoints } from '@castlery/fortress';
import { GeneralBreadcrumbs } from '@castlery/shared-components';
import { HeadBanner } from '../HeadBanner';
import { NoReview } from './components/NoReview';
import { useSearchParams } from 'next/navigation';
import { getDetailFromDeliveryReview } from '@castlery/modules-others-domain';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { DeliveryReviewDetail } from './components/DeliveryReviewDetail';
import { DetailProps } from './types';

const DeliveryReviewContainer = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get('token');
  const [detail, setDetail] = useState<DetailProps | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const getReviewDetail = async (token: string) => {
    setIsFetching(true);
    const result = await dispatch(getDetailFromDeliveryReview({ token }));
    setIsFetching(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setDetail(result.payload as DetailProps);
    }
  };
  useEffect(() => {
    if (token) {
      getReviewDetail(token);
    } else {
      setIsFetching(false);
    }
  }, [token]);
  const { desktop } = useBreakpoints();
  return (
    <>
      <GeneralBreadcrumbs
        breadcrumbs={[
          {
            label: 'Rate Your Delivery Experience',
            link: '/delivery-review',
          },
        ]}
      />
      <Container
        sx={{
          ...(!desktop && { padding: '0 !important' }),
        }}
      >
        <HeadBanner
          header="Rate Your Delivery Experience"
          image={{
            desktop_url:
              'https://res.cloudinary.com/castlery/image/upload/v1779936402/hardcode%20pages/delivery_review_desktop.jpg',
            mobile_url:
              'https://res.cloudinary.com/castlery/image/upload/v1779936436/hardcode%20pages/delivery_review_mobile.jpg',
            tablet_url:
              'https://res.cloudinary.com/castlery/image/upload/v1779936436/hardcode%20pages/delivery_review_mobile.jpg',
            alt: 'Delivery Review Banner',
          }}
        />
        {isFetching ? (
          <Stack
            sx={{
              width: '100%',
              height: 'calc(100vh - 150px)',
              justifyContent: 'center',
              alignItems: 'center',
              span: {
                transform: 'scale(2)',
              },
            }}
          >
            <Loading />
          </Stack>
        ) : detail ? (
          <DeliveryReviewDetail detail={detail} token={token} />
        ) : (
          <NoReview />
        )}
      </Container>
    </>
  );
};

export { DeliveryReviewContainer };
