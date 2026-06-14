'use client';

import { DYRecommendationCarousel } from '@castlery/shared-components';
import { DtStack } from '@castlery/modules-tracking-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
import LazyLoad from 'react-lazyload';
interface RecommendationCarouselProps {
  blok: {
    _uid: string;
    selector_name: string;
  };
}

const RecommendationCarousel = ({ blok }: RecommendationCarouselProps) => {
  const { _uid, selector_name } = blok;

  const dispatch = useAppDispatch();

  const handleLinkClick = (header: string) => {
    dispatch(
      EVENT_STORYBLOK({ action: 'recommendation_carousel_click', label: header, method: document?.title || '' })
    );
  };

  return (
    <DtStack uid={_uid} componentName="RecommendationCarousel" useImpression>
      <LazyLoad offset={300} once>
        <DYRecommendationCarousel selector_name={selector_name.trim()} onClick={handleLinkClick} />
      </LazyLoad>
    </DtStack>
  );
};

export { RecommendationCarousel };
