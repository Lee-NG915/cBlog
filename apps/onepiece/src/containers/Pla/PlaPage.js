/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'components/Helmet';
import Header from 'components/Header';
import Footer from 'components/Footer';

import {
  useScrollTo,
  useAncestorCrumbs,
  useCurrentProduct,
  useLocation,
  useViewedProduct,
  useCurrentVariant,
} from 'containers/Product/hooks/product';
import { useSelector, useDispatch } from 'react-redux';
import { selectedCurrentProductStockState, STOCK_STATE } from 'redux/modules/productOptions';

import PlaBreadcrumbs from 'containers/Product/components/ProductBreadcrumbs';
import PlaShipping from 'containers/Product/components/ProductShipping';
import PlaSocialWidget from 'containers/Product/components/ProductSocialWidget';
import PlaHead from 'containers/Product/components/ProductHead';
import PlaAddToCart from 'containers/Product/components/ProductAddToCart';
import PlaInfo from 'containers/Product/components/ProductInfo';
import { animate } from 'utils/animate';
import HullaSection from 'containers/Product/components/HullaSection';
import { useBundle } from 'containers/Product/hooks/bundle';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import { usePrice } from 'containers/Product/hooks/price';
import { GlobalReview } from 'fortress/GlobalReview/GlobalReview';
import { phPLAExperiment, phPLAExperimentVariant } from 'utils/posthog';
import { EVENT_DY_AB_TEST, EVENT_PLA_EXPERIMENT } from 'utils/track/constants';
import { globalFeatureInAU } from 'config';
import PlaSearch from './components/PlaSearch';
import PlaGallery from './components/PlaGallery';
import PlaConfig from './components/PlaConfig';
import PlaCategory from './components/PlaCategory';
import PlaDetail from './components/PlaDetail';
import style from './style.scss';

const PlaPage = ({ variationType }) => {
  const plaSelector = 'PLA A/B Test';
  const location = useLocation();
  const product = useCurrentProduct();
  const variant = useCurrentVariant();
  const { price } = usePrice();

  const { ancestorCrumbs } = useAncestorCrumbs();
  const [ref, scrollToRef] = useScrollTo();
  const bundles = useBundle();
  const reviewsSummary = product.reviews;
  const { version } = useSelector((state) => state.dyApiData.campaign[plaSelector]) || {};
  const { desktop } = useBreakpoints();
  const dispatch = useDispatch();

  useEffect(() => {
    if (globalFeatureInAU && version) {
      dispatch({
        type: EVENT_DY_AB_TEST,
        result: {
          campaignName: plaSelector,
          variation: version,
        },
      });
    }
  }, [dispatch, version]);

  useEffect(() => {
    if (typeof phPLAExperiment === 'function') {
      phPLAExperiment();
    }
    if (typeof phPLAExperimentVariant === 'function') {
      phPLAExperimentVariant();
    }

    dispatch({
      type: EVENT_PLA_EXPERIMENT,
    });
  }, [dispatch]);

  const galleryRef = useRef();
  const productDimensionRef = useRef();
  const [dimensionExpand, setDimensionExpand] = useState(false);

  const stockState = useSelector(selectedCurrentProductStockState);
  const isOutOfStock = stockState === STOCK_STATE.OUT_OF_STOCK;

  let variantIdForHulla = variant.id;
  if (product.product_type === 'bundle') {
    variantIdForHulla = bundles?.[0]?.variant?.id;
  }

  // track page view
  useViewedProduct();

  const getTop = useCallback((target) => {
    let offset = target.offsetTop;
    if (target.offsetParent != null) offset += getTop(target.offsetParent);
    return offset;
  }, []);

  const onDimensionScroll = useCallback(() => {
    setTimeout(() => {
      if (productDimensionRef.current?.clientHeight && galleryRef.current) {
        const galleryStickyTop = parseInt(getComputedStyle(galleryRef.current?.parentNode)?.getPropertyValue?.('top'));
        const gap = Number.isNaN(galleryStickyTop) ? 0 : galleryStickyTop;

        const target = document.scrollingElement;

        const viewHeight = window?.innerHeight || document.documentElement?.clientHeight;
        const galleryHeight = galleryRef.current?.clientHeight;
        let balanceHeight = viewHeight > galleryHeight ? 0 : galleryHeight - viewHeight;

        const rightTotalHeight = getTop(productDimensionRef.current) + productDimensionRef.current.clientHeight;

        let subtractedHeight = galleryRef.current?.clientHeight || 0;
        if (productDimensionRef.current?.clientHeight > galleryHeight) {
          balanceHeight = 0;
          // eslint-disable-next-line no-unsafe-optional-chaining
          subtractedHeight += productDimensionRef.current?.clientHeight - galleryHeight;
        }

        subtractedHeight += gap;

        animate({
          from: target.scrollTop,
          to: rightTotalHeight + balanceHeight - subtractedHeight,
          duration: 500,
          func: 'easeInOutQuad',
          callback: (d) => (target.scrollTop = d),
        });
      }
    }, 600);
  }, [getTop]);

  const handleScrollToDimension = useCallback(
    (isActive) => {
      setDimensionExpand(isActive);
      if (isActive && variationType === 'B') {
        onDimensionScroll();
      }
    },
    [onDimensionScroll, variationType]
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: variant.images && variant.images.length > 0 ? variant.images[0].links.large : '',
    description: product.description,
    sku: variant.sku,
    brand: {
      '@type': 'Brand',
      name: 'Castlery',
      url: __BASE_URL__,
    },
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      priceCurrency: __CURRENCY__,
      price,
      sku: variant.sku,
      availability: `https://schema.org/${isOutOfStock ? 'OutOfStock' : 'InStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
  const canonicalHref = location?.pathname && location?.pathname.replace('/pla/', '/products/');
  return (
    <>
      <Helmet path={location.pathname} page={{ title: product.meta_title || `${product.name}`, canonicalHref }}>
        <meta name="robots" content="noindex" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Header needSearchBar={desktop} border={!desktop} borderColor="#f3f3f3" />
      {!desktop ? (
        <Container disableGutters>
          <PlaSearch />
          <PlaBreadcrumbs ancestorCrumbs={ancestorCrumbs} />
          <PlaHead scrollToReview={scrollToRef} reviewsSummary={reviewsSummary} />
          <PlaGallery />
          {variationType === 'origin' && <PlaConfig styleName="plaConfig" />}
          {variationType === 'B' && (
            <PlaConfig styleName={!version || (version && version !== '3') ? 'plaConfig3' : 'plaConfig'} />
          )}
          {variationType === 'B' && (!version || (version && version !== '3')) && (
            <PlaInfo type="pla" plaCollapsed={!!(version && version === '2')} />
          )}
          {variationType === 'origin' && (
            <>
              <div className={style.addToCartBtn}>
                <PlaAddToCart />
              </div>
              <div>
                <PlaDetail styleName="plaDetail" />
              </div>
            </>
          )}
          {variationType === 'B' && (
            <>
              <div className={style.addToCartBtn}>
                <PlaAddToCart />
              </div>
              <div>
                <PlaDetail styleName={!version || (version && version !== '3') ? 'plaDetail3' : 'plaDetail'} />
              </div>
            </>
          )}
          <PlaShipping />
          {variantIdForHulla && (
            <div className={`${style.plaIntro}__hulla`}>
              <HullaSection productId={variantIdForHulla?.toString()} />
            </div>
          )}
          {reviewsSummary?.total_count > 0 && <GlobalReview forwardRef={ref} />}
          <PlaCategory />
          <PlaSocialWidget campaign="SSC PDP Recommendation Widget #2" />
        </Container>
      ) : (
        <>
          <Container
            className={`${style.plaIntro}`}
            sx={{
              position: 'relative',
              display: 'grid',
              gridTemplateAreas: `
                'head head'
                'left right'
                'place right'
            `,
              gridTemplateRows: 'auto auto',
              gridTemplateColumns: {
                md: 'auto 400px',
                lg: 'auto 480px',
                xl: 'auto 560px',
              },
              marginBottom: '120px',
            }}
          >
            <PlaBreadcrumbs ancestorCrumbs={ancestorCrumbs} />
            <PlaGallery handleScrollToDimension={handleScrollToDimension} forwardRef={galleryRef} />
            <div className={`${style.plaIntro}__place`} />
            <div className={`${style.plaIntro}__right`}>
              <PlaHead scrollToReview={scrollToRef} reviewsSummary={reviewsSummary} />
              {variationType === 'origin' && <PlaConfig styleName="plaConfig" />}
              {variationType === 'B' && (
                <PlaConfig styleName={!version || (version && version !== '3') ? 'plaConfig3' : 'plaConfig'} />
              )}
              {variationType === 'B' && (!version || (version && version !== '3')) && (
                <PlaInfo
                  type="pla"
                  dimensionExpand={dimensionExpand}
                  forwardRef={productDimensionRef}
                  plaCollapsed={!!(version && version === '2')}
                />
              )}
              {variationType === 'origin' && (
                <>
                  <div>
                    <PlaAddToCart />
                  </div>
                  <div>
                    <PlaDetail styleName="plaDetail" />
                  </div>
                </>
              )}

              {variationType === 'B' && (
                <>
                  <div className={style.addToCartBtn}>
                    <PlaAddToCart />
                  </div>
                  <div>
                    <PlaDetail styleName={version && version !== '3' ? 'plaDetail3' : 'plaDetail'} />
                  </div>
                </>
              )}
              <PlaShipping />
              {variantIdForHulla && (
                <div className={`${style.plaIntro}__hulla`}>
                  <HullaSection productId={variantIdForHulla?.toString()} />
                </div>
              )}
            </div>
          </Container>
          {reviewsSummary?.total_count > 0 && <GlobalReview forwardRef={ref} />}
          <PlaCategory />
          <PlaSocialWidget campaign="SSC PDP Recommendation Widget #2" />
        </>
      )}
      <Footer />
    </>
  );
};

PlaPage.propTypes = {
  variationType: PropTypes.string,
};

export default PlaPage;
