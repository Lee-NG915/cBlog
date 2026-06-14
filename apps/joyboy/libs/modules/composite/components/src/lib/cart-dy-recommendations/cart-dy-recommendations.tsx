'use client';
import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import { Box, Divider } from '@castlery/fortress';
import { cartProductRecommendationImpressionEvent } from '@castlery/modules-cart-domain';
import { DyCampaignSelectorNames } from '@castlery/modules-dy-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';

const CartRecommendationsDynamic = dynamic(
  () => import('@castlery/shared-components').then((mod) => mod.DYRecommendationCarousel),
  {
    ssr: false, // 如果不需要 SEO
  }
);
export const CartDYRecommendations = ({ miniCart = false }: { miniCart?: boolean }) => {
  const dispatch = useAppDispatch();
  const trackedSelectorsRef = useRef(new Set<string>());
  const position = miniCart ? 'miniCart' : 'fullCart';

  const handleRenderSuccess = useCallback(
    (selectorName: string, label: string) => {
      if (trackedSelectorsRef.current.has(selectorName)) return;
      trackedSelectorsRef.current.add(selectorName);
      dispatch(cartProductRecommendationImpressionEvent({ label, position }));
    },
    [dispatch, position]
  );

  return (
    <Box>
      <CartRecommendationsDynamic
        selector_name={DyCampaignSelectorNames.Cart_Recommendation}
        onRenderSuccess={(label) => handleRenderSuccess(DyCampaignSelectorNames.Cart_Recommendation, label)}
      />
      {!miniCart && (
        <>
          <Divider />
          <CartRecommendationsDynamic
            selector_name={DyCampaignSelectorNames.Cart_Recommendation_2}
            onRenderSuccess={(label) => handleRenderSuccess(DyCampaignSelectorNames.Cart_Recommendation_2, label)}
          />
          <Divider />
          <CartRecommendationsDynamic
            selector_name={DyCampaignSelectorNames.Cart_Recommendation_3}
            onRenderSuccess={(label) => handleRenderSuccess(DyCampaignSelectorNames.Cart_Recommendation_3, label)}
          />
        </>
      )}
    </Box>
  );
};
