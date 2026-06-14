'use client';
import { getWebProductReviewsCommand } from '@castlery/modules-product-services';
import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect } from 'react';
import { trackPLAExperiment, trackProductPageView } from '@castlery/modules-tracking-services';
import { useParams } from 'next/navigation';

export const PlaLayoutClient = () => {
  const dispatch = useAppDispatch();
  const { variationSlug } = useParams();
  useEffect(() => {
    dispatch(
      enterApp({
        page: 'PLA',
      })
    );
    dispatch(
      getWebProductReviewsCommand({
        pageNumber: 1,
        perPage: 5,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (dispatch && typeof variationSlug === 'string') {
      const trackEvents = async () => {
        await dispatch(trackProductPageView({ variantion: variationSlug }));
        await dispatch(trackPLAExperiment({ variantion: variationSlug }));
      };
      trackEvents();
    }
  }, [dispatch, variationSlug]);
  return <></>;
};
