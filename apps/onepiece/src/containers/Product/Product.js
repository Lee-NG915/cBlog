import React, { useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import Helmet from 'components/Helmet';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { EVENT_PDP_DETAILS, EVENT_PDP_PRODUCT_DETAILS } from 'utils/track/constants';
import { useDispatch, useSelector } from 'react-redux';
import { animate } from 'utils/animate';
import { selectedDiscontinued, selectedCurrentProductStockState, STOCK_STATE } from 'redux/modules/productOptions';
import { Container, Stack, useBreakpoints } from '@castlery/fortress';
import { GlobalReview } from 'fortress/GlobalReview/GlobalReview';
import { getProductContext } from 'utils/dy';
import Breadcrumbs from './components/ProductBreadcrumbs';
import ProductHead from './components/ProductHead';
import ProductGallery from './components/ProductGallery';
import ProductConfig from './components/ProductConfig';
import ProductBundleConfig from './components/ProductBundleConfig';
import ProductAddToCart from './components/ProductAddToCart';
// import ProductBundleSale from './components/ProductBundleSale';
import ProductShipping from './components/ProductShipping';
import ProductInfo from './components/ProductInfo';
import ProductCrossSell from './components/ProductCrossSell';
import ProductSocialWidget from './components/ProductSocialWidget';
import MulberryInlinePicker from './components/MulberryInlinePicker';
import ProductShopTheLook from './components/ProductShopTheLook';
import {
  useCurrentProduct,
  useCurrentVariant,
  useAncestorCrumbs,
  useCurrentSelectedVariants,
  useHelmet,
  useScrollTo,
  useUpdateUrl,
  useViewedProduct,
} from './hooks/product';

import style from './style.scss';
import { usePrice } from './hooks/price';
// import ProductReview from './components/ProductReview';

export const ReviewsSectionPlaceolderId = 'reviews-container';

const Product = ({ inViewFooter, product, ancestorCrumbs }) => {
  const [refTop, inViewTop] = useInView({
    initialInView: true,
  });
  const [ref, scrollToRef] = useScrollTo();
  const [reviewsRef, setReviewsRef] = useState(ref.current);
  const galleryRef = useRef();
  const productDimensionRef = useRef();
  const [dimensionExpand, setDimensionExpand] = useState(false);
  const { desktop } = useBreakpoints();
  const dispatch = useDispatch();

  const dyApiCampaigns = useSelector((state) => state.dyApiData.campaign);
  const isEmbedShopTheLook =
    dyApiCampaigns?.['PDP Shop The Look']?.data.embed && product?.slug === 'adams-chaise-sectional-sofa';
  const handleScrollToRef = useCallback(() => {
    scrollToRef();

    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'x_reviews',
        label: 'click',
      },
    });
  }, [dispatch, scrollToRef]);

  const getTop = useCallback((target) => {
    let offset = target.offsetTop;
    if (target.offsetParent != null) offset += getTop(target.offsetParent);
    return offset;
  }, []);

  useEffect(() => {
    dispatch({
      type: EVENT_PDP_PRODUCT_DETAILS,
      result: {
        detailAction: 'pdp_view',
      },
    });
  }, [dispatch]);

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
      if (isActive) {
        onDimensionScroll();
      }
    },
    [onDimensionScroll]
  );

  // for discontined product
  const variant = useCurrentVariant();
  const bundleVariant = useCurrentSelectedVariants();
  const { singlePrice } = usePrice();
  const discontinued = useSelector(selectedDiscontinued);
  const reviewsSummary = useCurrentProduct().reviews;
  const [currentWarranty, setCurrentWarranty] = useState({
    isSelected: false,
    warranty_offer_id: null,
    hasOffers: false,
  });

  // auto scroll to reviews
  useEffect(() => {
    if (reviewsSummary?.total_count > 0) {
      setTimeout(() => {
        if (window.location.hash === '#reviews') {
          if (reviewsRef) {
            scrollToRef();
          } else {
            //  查找上一个section的底部，然后滚动到底部
            const target = document.querySelector(`#${ReviewsSectionPlaceolderId}`);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }, 1000);
    }
  }, [reviewsSummary, scrollToRef, reviewsRef]);
  return (
    <>
      {!desktop ? (
        <Container disableGutters>
          <div ref={refTop}>
            <Breadcrumbs ancestorCrumbs={ancestorCrumbs} />
            <ProductHead
              scrollToReview={handleScrollToRef}
              discontinued={discontinued}
              reviewsSummary={reviewsSummary}
            />
            <ProductGallery />
            {product.product_type !== 'bundle' ? <ProductConfig /> : <ProductBundleConfig />}
          </div>
          {!discontinued && __MULBERRY_PUBLIC_TOKEN__ !== '' && (
            <MulberryInlinePicker
              variant={variant}
              bundleVariant={bundleVariant}
              product={product}
              listPrice={singlePrice} // 修改了逻辑，在比如 pair 类产品也只传入单个 product 的价格
              setCurrentWarranty={setCurrentWarranty}
            />
          )}
          <ProductAddToCart
            showSticky={!inViewTop && !inViewFooter}
            discontinued={discontinued}
            warrantyInfo={currentWarranty}
          />
          {/* <ProductBundleSale /> */}
          {/* {!discontinued && <ProductShipping />} */}
          <ProductShipping />
          <ProductInfo warrantyInfo={currentWarranty} />
          {reviewsSummary?.total_count > 0 && (
            <Stack id={ReviewsSectionPlaceolderId}>
              <GlobalReview forwardRef={ref} />
            </Stack>
          )}
          <ProductShopTheLook product={product} />
          <ProductSocialWidget showDyCampaign={!isEmbedShopTheLook} />
          <ProductCrossSell />
        </Container>
      ) : (
        <>
          <Container
            className={`${style.productIntro}`}
            sx={{
              position: 'relative',
              display: 'grid',
              marginBottom: '120px',
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
            }}
          >
            <Breadcrumbs ancestorCrumbs={ancestorCrumbs} />
            <ProductGallery forwardRef={galleryRef} scrollToDimension={handleScrollToDimension} />
            <div className={`${style.productIntro}__place`} />
            <div className={`${style.productIntro}__right`}>
              <ProductHead
                scrollToReview={handleScrollToRef}
                discontinued={discontinued}
                reviewsSummary={reviewsSummary}
              />
              {product.product_type !== 'bundle' ? <ProductConfig /> : <ProductBundleConfig />}
              {!discontinued && __MULBERRY_PUBLIC_TOKEN__ !== '' && (
                <MulberryInlinePicker
                  variant={variant}
                  bundleVariant={bundleVariant}
                  product={product}
                  listPrice={singlePrice}
                  setCurrentWarranty={setCurrentWarranty}
                />
              )}
              <ProductAddToCart discontinued={discontinued} warrantyInfo={currentWarranty} />
              {/* <ProductBundleSale /> */}
              {/* {!discontinued && <ProductShipping />} */}
              <ProductShipping />
              <ProductInfo
                warrantyInfo={currentWarranty}
                dimensionExpand={dimensionExpand}
                forwardRef={productDimensionRef}
              />
            </div>
          </Container>
          {/* <ProductReview forwardRef={ref} scrollToRef={scrollToRef} /> */}
          {reviewsSummary?.total_count > 0 && (
            <Stack id={ReviewsSectionPlaceolderId}>
              <GlobalReview forwardRef={ref} />
            </Stack>
          )}
          <ProductShopTheLook product={product} />
          <ProductSocialWidget showDyCampaign={!isEmbedShopTheLook} />
          <ProductCrossSell />
        </>
      )}
    </>
  );
};

Product.propTypes = {
  inViewFooter: PropTypes.bool,
  product: PropTypes.object,
  ancestorCrumbs: PropTypes.array,
};

const ProductWrapper = ({ location }) => {
  const variant = useCurrentVariant();
  const { price } = usePrice();
  const product = useCurrentProduct();
  const [refFooter, inViewFooter] = useInView();
  const stockState = useSelector(selectedCurrentProductStockState);
  const isOutOfStock = stockState === STOCK_STATE.OUT_OF_STOCK;

  const notIndexed = false;
  // product is enabled but every variant is disabled
  // if (product.product_type !== 'bundle') {
  //   notIndexed = product.customizations.every((v) => v.discontinued);
  // } else {
  //   notIndexed = product.bundle_options.every((option) => option.variants.every((v) => v.discontinued));
  // }
  // // product is disabled
  // if (product.discontinued) {
  //   notIndexed = true;
  // }

  /* Get breadcrumb urls */
  /* Get product collection for social widget */
  const { ancestorCrumbs } = useAncestorCrumbs();

  // track page view
  useViewedProduct();

  useEffect(() => {
    // 针对于通过search进入的页面，需要更新 window.DY.recommendationContext
    // 因为third party script是在componentDidMount之后执行的，所以需要在这里更新
    // 处理third party script在componentDidMount之前执行的情况？

    if (variant.id !== undefined) {
      const context = getProductContext(variant) || {};
      window.DY.recommendationContext = {
        ...context,
      };
    }
  }, [variant]);

  // auto change url
  const originUrl = useUpdateUrl();

  const { ratingString, threeReviews, keyWords } = useHelmet();

  return (
    <div className={style.wrapper}>
      <Helmet
        largeImagePreview
        jsonLd={
          variant.id !== undefined
            ? [
                `{"@context": "http://schema.org",` +
                  `"@type": "BreadcrumbList",` +
                  `"itemListElement": [${ancestorCrumbs
                    .map(
                      (p, index) =>
                        `{"@type": "ListItem",` +
                        `"position": ${index + 1},` +
                        `"item": {` +
                        `"@id": "${p.url}",` +
                        `"name": "${p.name}"}}`
                    )
                    .join(',')}]}`,
                `{"@context": "http://schema.org",` +
                  `"@type": "Product",` +
                  `"sku": "${variant.sku || ''}",` +
                  `"image": "${variant.images && variant.images.length > 0 ? variant.images[0].links.large : ''}",` +
                  `"name": ${JSON.stringify(product.name)},` +
                  `"description": ${JSON.stringify(product.description)},` +
                  `"color": "${
                    (variant.id &&
                      (variant.variant_option_values.find((v) => v.option_type_name === 'material') || {})
                        .presentation) ||
                    ''
                  }",` +
                  `"itemCondition": "http://schema.org/NewCondition", ` +
                  `"brand": {` +
                  `"@type": "Brand",` +
                  `"name": "Castlery",` +
                  `"url": "${__BASE_URL__}"},` +
                  `${ratingString}` +
                  `${threeReviews}` +
                  `"offers": {` +
                  `"@type": "Offer",` +
                  `"sku": "${variant.sku || ''}",` +
                  `"priceCurrency": "${__CURRENCY__}",` +
                  `"price": "${price || ''}",` +
                  `"url": "${originUrl || '/'}",` +
                  `"availability": "http://schema.org/${isOutOfStock ? 'OutOfStock' : 'InStock'}"}}`,
              ]
            : null
        }
        path={location.pathname}
        page={{
          title: product.meta_title || `${product.name}`,
          description: product.meta_description || product.description,
          keywords: product.meta_keywords || keyWords,
          image: variant.images && variant.images.length > 0 ? variant.images[0].links.large : '',
          notIndexed,
        }}
      />
      <Header />
      <Product product={product} inViewFooter={inViewFooter} ancestorCrumbs={ancestorCrumbs} />
      <Footer forwardRef={refFooter} />
    </div>
  );
};

export default ProductWrapper;
