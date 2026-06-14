import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import classNames from 'classnames';
import lang from 'utils/lang';
import { getBreakpoint } from 'utils/breakpoints';
import Spinner from 'components/Spinner';
import ResponsiveSlick from 'components/ResponsiveSlick';
import SocialImage from 'components/SocialImage/v2';
import InView from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import { EVENT_SOCIAL_WIDGET } from 'utils/track/constants';
import { getCurrentSelectedUgcs, selectCurrentPageUgcs } from 'redux/modules/socialUgcs';
import { selectCurrentVariantIds } from 'redux/modules/productOptions';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import { useRenderModal, useWidgetCollection } from '../hooks/widget';
import style from './style.scss';
import ProductRecommendation from './ProductRecommendation';

const ProductSocialWidget = (props = {}) => {
  const { campaign = 'PDP Recommendation Widget #1', showDyCampaign = true } = props;

  const dispatch = useDispatch();
  const currentPageUgcs = useSelector(selectCurrentPageUgcs);
  const currentVariantIds = useSelector(selectCurrentVariantIds);
  const { xl, desktop } = useBreakpoints();
  useEffect(() => {
    dispatch(getCurrentSelectedUgcs());
  }, [dispatch, currentVariantIds]);

  const renderMobileModal = useRenderModal();

  const { collection, product } = useWidgetCollection();

  if (currentPageUgcs?.isLoading) {
    return (
      <div className={style.loading}>
        <Spinner />
      </div>
    );
  }

  if (!(currentPageUgcs?.length > 0)) return null;
  return (
    <>
      <Container
        fixed
        className={classNames({
          [style.dyPosition]: true,
        })}
      >
        {window?.location?.href?.indexOf('/products/') !== -1 && (
          <LazyLoad offset={300} once>
            <ProductRecommendation variantId={currentVariantIds} selector="PDP Rec API - Top" />
          </LazyLoad>
        )}
        <div data-campaign="PDP Rec - Top" />
        {/* {showDyCampaign && <div data-campaign={campaign} />} */}
      </Container>
      <Container
        fixed
        className={classNames({
          [style.socialWidget]: true,
        })}
      >
        <header className={`${style.socialWidget}__header`}>
          <h2>#AtHomewithCastlery</h2>
          <div>
            Be inspired by real homes
            <span className={`${style.socialWidget}__header-ig`}>
              <a
                className={`${style.socialWidget}__header-ig-link`}
                target="_blank"
                href={`https://www.instagram.com/castlery${__COUNTRY__?.toLowerCase()}/?hl=en`}
              >
                &nbsp;{lang.t('social.ig-handle')}
              </a>
            </span>
          </div>
        </header>
        <LazyLoad offset={300} once key={product.name}>
          <InView
            onChange={(inView) => {
              if (inView) {
                dispatch({
                  type: EVENT_SOCIAL_WIDGET,
                  result: {
                    socialWidgetAction: 'widget_impression',
                  },
                });
              }
            }}
            triggerOnce
            threshold={0.25}
          >
            <Container disableGutters={xl} className={`${style.socialWidget}__list`}>
              <ResponsiveSlick
                trackClick={() => {
                  dispatch({
                    type: EVENT_SOCIAL_WIDGET,
                    result: {
                      socialWidgetAction: 'arrow_click',
                    },
                  });
                }}
                mediaQueries={
                  !desktop
                    ? [
                        {
                          query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                          numPerPage: 1,
                        },
                        {
                          query: `(min-width: ${getBreakpoint('lg', 'min')}px) and (max-width: ${getBreakpoint(
                            'lg',
                            'max'
                          )}px)`,
                          numPerPage: 4,
                        },
                        {
                          query: `(min-width: ${getBreakpoint('xl', 'min')}px)`,
                          numPerPage: 4,
                        },
                      ]
                    : [
                        {
                          query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                          numPerPage: 4,
                        },
                      ]
                }
              >
                {currentPageUgcs.map((post, index) => (
                  <div
                    key={post._uid}
                    className={`${style.socialWidget}__wrapper`}
                    data-selenium={`widget_item${index}`}
                  >
                    <InView
                      onChange={(inView) => {
                        if (inView) {
                          dispatch({
                            type: EVENT_SOCIAL_WIDGET,
                            result: {
                              socialWidgetAction: 'image_impression',
                              post,
                              position: index + 1,
                            },
                          });
                        }
                      }}
                      triggerOnce
                      threshold={0.25}
                    >
                      <SocialImage
                        targetPosts={currentPageUgcs}
                        listPosition={index + 1}
                        post={post}
                        collection={collection}
                        renderModal={!desktop && renderMobileModal}
                        modalType={!desktop ? 'new' : 'old'}
                        fromNewPDP
                        maskHeight={115}
                        showSlideArrows
                      />
                    </InView>
                  </div>
                ))}
              </ResponsiveSlick>
            </Container>
          </InView>
        </LazyLoad>
      </Container>
    </>
  );
};

ProductSocialWidget.propTypes = {
  campaign: PropTypes.string,
  showDyCampaign: PropTypes.bool,
};

export default ProductSocialWidget;
