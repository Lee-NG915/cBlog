import React from 'react';
import PropTypes from 'prop-types';
import ResponsiveSlick from 'components/ResponsiveSlick';
import { getBreakpoint } from 'utils/breakpoints';
import Tag from 'components/Tag';
import { toPrice } from 'utils/number';
import { useSelector } from 'react-redux';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useApiCampaigns } from 'hooks/dy';
import style from './style.scss';

const Recommendation = ({ recommendationName }) => {
  const dyState = useSelector((state) => state.dyApiData.campaign);
  const dyApiCampaigns = useApiCampaigns({ selectorArray: [recommendationName], shouldCheckIfNeedLoad: false });

  const recommendations = dyState?.[recommendationName]?.data || {};
  const title = recommendations.custom?.title;
  const products = recommendations.slots;
  const { desktop } = useBreakpoints();
  if (!products || products?.length === 0) {
    return null;
  }

  const priceDisplay = (productData) => (
    <div className={style.price}>
      {productData?.sale_price && productData?.dy_display_price ? (
        <>
          <span>{toPrice(productData?.sale_price, true)}</span>
          <span>{toPrice(productData?.dy_display_price, true)}</span>
        </>
      ) : (
        toPrice(productData?.dy_display_price || productData?.sale_price, true)
      )}
    </div>
  );

  return (
    <div className={style.recommend}>
      <Container>
        <div className={`${style.recommend}__title`}>{title}</div>

        <div className={`${style.recommend}__content`}>
          <ResponsiveSlick
            mediaQueries={
              !desktop
                ? [
                    {
                      query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                      numPerPage: 2,
                    },
                    {
                      query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                      numPerPage: 4,
                    },
                  ]
                : [
                    {
                      query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                      numPerPage: 4,
                    },
                    {
                      query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                      numPerPage: 4,
                    },
                  ]
            }
          >
            {products?.map((item, index) => {
              const tags = [];
              if (item?.productData?.badges?.length !== 0) {
                if (item?.productData?.badges.indexOf(',') > -1) {
                  item?.productData?.badges.split(',').forEach((tag) => {
                    tags.push(tag);
                  });
                }
                tags.push(item?.productData?.badges);
              }

              return (
                <div className={`${style.recommend}__item`} data-selenium={`widget_item${index}`} key={item?.sku}>
                  {tags.length > 0 && (
                    <div className={`${style.recommend}__tag`}>
                      <Tag tags={tags} />
                    </div>
                  )}

                  <a href={item?.productData?.url}>
                    <div className={`${style.recommend}__image`}>
                      <img src={item?.productData?.image_url} alt={recommendationName} />
                    </div>
                    <div className={`${style.recommend}__name`}>{item?.productData?.name}</div>
                  </a>

                  <div className={`${style.recommend}__price`}>{priceDisplay(item?.productData)}</div>
                </div>
              );
            })}
          </ResponsiveSlick>
        </div>
      </Container>
    </div>
  );
};

Recommendation.propTypes = {
  recommendationName: PropTypes.string,
};

export default Recommendation;
