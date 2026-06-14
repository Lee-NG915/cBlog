import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Helmet from 'components/Helmet';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { GhostArrowBtn } from 'components/Button';
import { OneDualBox } from 'components/DualBox';
import { reportClickEngagement } from 'utils/dyReporting';
import Banner from 'components/Banner';
import { load as loadBanner } from 'redux/modules/dyApiData';
import { loadIfNeeded as loadList } from 'redux/modules/variantList';
import ReviewSection from 'components/ReviewSection';
import PressSection from 'components/PressSection';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { loadIfNeeded as loadStoryblokPage } from 'redux/modules/storyblokPage';
import { useDispatch, useSelector } from 'react-redux';
import { isOutdated } from 'utils/time';
import { set } from 'helpers/Cookie';
import { useFrame, useLocation } from 'hooks/frame';
import { EVENT_DY_AB_TEST, EVENT_DY_EVENT } from 'utils/track/constants';
import Video from 'components/Video';
import { useDevice } from 'utils/hooks';
import YotpoScript from 'components/Yotpo';
import { getUrl } from 'pages';
import ShopTheLookSection from 'components/ShopTheLookSection';
import { Box, Container, Divider } from '@castlery/fortress';
import { StoryblokComponent } from '@storyblok/react';
import { startStoryblok } from 'containers/Storyblok/setup';
import { gtmPageNames } from 'utils/track/config';
import { globalFeatureInSG } from 'config';
import SocialSection from './components/SocialSection';
import CategorySection from './components/CategorySection';
import USPSection from './components/USPSection';
import RecommendSection from './components/RecommendSection';
import SeoContent from './components/SeoContent';
import style from './style.scss';

const recommendationCampaigns = ['HP Recommendation #1', 'HP Recommendation #2'];

const isValidContent = (content) => !(content.disabled || isOutdated(content.published_at, content.ended_at));

const Home = () => {
  const device = useDevice();
  const frame = useFrame();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const marketing = useSelector(
    (state) => state.marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/main-pages/new-home-page`]
  );
  const shopTheLookData = useSelector(
    (state) =>
      state.marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/shop-the-look`]
  );
  const dyHPBannerState = useSelector((state) => state.dyApiData.campaign['HP Banner']);
  const { content: shopTheLookContent } = shopTheLookData?.data?.story || {};
  let looks = [];
  if (shopTheLookContent !== undefined) {
    const pathList = ['living-room', 'dining-room', 'bedroom', 'outdoor'];
    looks = ['living_room', 'dining_room', 'bedroom', 'outdoor'].map((i, index) => ({
      ...shopTheLookContent[i]?.[0],
      path: pathList[index],
    }));
  }

  let bannerData = null;
  if (dyHPBannerState) {
    bannerData = dyHPBannerState.data;
  }

  useEffect(() => {
    window.location.href = __BASE_URL__;
  }, []);

  useEffect(() => {
    if (dispatch) {
      dispatch(
        loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/shop-the-look`)
      );
    }
  }, [dispatch]);

  useEffect(() => {
    if (dyHPBannerState) {
      dispatch({
        type: EVENT_DY_EVENT,
        result: {
          detailAction: dyHPBannerState.campaignName,
          label: dyHPBannerState.data.variation,
        },
      });
    }
  }, [dispatch, dyHPBannerState]);

  useEffect(() => {
    startStoryblok();
  }, []);

  const popupDiscount = useCallback(() => {
    // popup
    let cookieVal;
    const desc =
      "Welcome to Castlery! Enjoy $50 off your first order of $500 or more - you'll see the discount automatically applied at checkout when you've signed into your Castlery account.";
    if (pathname === '/mindscape') {
      cookieVal = pathname.substring(1, pathname.length);
    } else if (pathname === '/rich') {
      cookieVal = pathname.substring(1, pathname.length);
    } else if (pathname === '/wondery') {
      cookieVal = pathname.substring(1, pathname.length);
    } else if (pathname === '/thedollop') {
      cookieVal = pathname.substring(1, pathname.length);
    } else if (pathname === '/eventherich') {
      cookieVal = pathname.substring(1, pathname.length);
    }
    if (cookieVal) {
      frame.openModal('discount', {
        title: cookieVal === 'mindscape' ? "Sean Carroll's Mindscape" : cookieVal.toUpperCase(),
        desc,
      });
      set('castlery_podcast', cookieVal, 30);
    }
  }, [frame, pathname]);
  const getTargetData = useCallback(
    (name) => {
      const content = marketing?.data?.story?.content;
      if (!content || !content[name]) return null;
      if (Array.isArray(content[name])) {
        return content[name].filter((t) => isValidContent(t));
      }
      return content[name];
    },
    [marketing]
  );
  const getMediaQuery = useCallback(
    (breakpoint, src, ratio) => ({
      breakpoint,
      srcset: src,
      loader: { ratio },
    }),
    []
  );

  const getCategoryImgs = useCallback(() => {
    if (!marketing) return [];
    if (!getTargetData('category_rows')) return [];
    const categoryRows = getTargetData('category_rows');
    const imgList = [];
    categoryRows.forEach((categoryRow) => {
      if (categoryRow.component === 'Category Row') {
        if (categoryRow.first_category.length > 0) {
          categoryRow.first_category[0].images.forEach((img) => {
            if (img.src !== '') {
              imgList.push(img.src);
            }
            if (img.hover_src !== '') {
              imgList.push(img.hover_src);
            }
          });
        }
        if (categoryRow.second_category.length > 0) {
          if (categoryRow.second_category[0].images) {
            categoryRow.second_category[0].images.forEach((img) => {
              if (img.src !== '') {
                imgList.push(img.src);
              }
              if (img.hover_src !== '') {
                imgList.push(img.hover_src);
              }
            });
          }
        }
      }
    });
    return imgList;
  }, [marketing, getTargetData]);

  const imageBanner = useMemo(() => {
    if (!bannerData || bannerData.type !== 'image') return null;
    const mobileMediaQuery = getMediaQuery('xs', bannerData.mobile.src, bannerData.mobile.ratio);
    const tabletMediaQuery = getMediaQuery('md', bannerData.tablet.src, bannerData.tablet.ratio);
    const desktopMediaQuery = getMediaQuery('lg', bannerData.desktop.src, bannerData.desktop.ratio);
    const mediaQueries = [mobileMediaQuery, tabletMediaQuery, desktopMediaQuery].filter((query) => !!query);

    return {
      mediaQueries,
    };
  }, [bannerData, getMediaQuery]);

  const videoBanner = useMemo(() => {
    if (!bannerData || bannerData.type !== 'video') return null;
    const { thumbnail, mobile, desktop } = bannerData;
    return {
      video: device === 'desktop' ? desktop.video : mobile.video,
      thumbnail,
      ratios: {
        mobile: 1.25,
        tablet: 0.65,
        desktop: 0.52,
      },
      loader: {
        widths: device === 'desktop' ? [1280, 1440, 1920, 2880] : [700, 900, 1000, 1200, 1400],
        sizes: device === 'desktop' ? ['1440px-xxl', '1'] : ['1'],
      },
    };
  }, [bannerData, device]);

  const linkCollections = useMemo(() => getTargetData('variant_collections'), [getTargetData]);

  const bannerDataBox = () => {
    const children = (
      <>
        {imageBanner && (
          <Banner
            mediaQueries={imageBanner.mediaQueries}
            title={bannerData.alt || 'Castlery Home Banner'}
            lazy={false}
            setImagePreloaderOnServer
          />
        )}
        {videoBanner && (
          <Video
            id={videoBanner.video}
            videoRoot="https://res.cloudinary.com/castlery/video/upload"
            ratios={videoBanner.ratios}
            thumbnail={{
              alt: bannerData.alt || 'Castlery Home Banner',
              setImagePreloaderOnServer: true,
              loader: videoBanner.loader,
            }}
            objectFit="cover"
            resolution={device === 'desktop' ? '1080P' : '720P'}
            showControls={false}
            loop
            muted
            forceThumbnail
          />
        )}
      </>
    );
    if (globalFeatureInSG && bannerData?.link === getUrl('lunar-new-year-event')) {
      return (
        <a
          href={`/sg${bannerData.link}`}
          onClick={() =>
            reportClickEngagement({
              decisionId: dyHPBannerState.decisionId,
              variationId: dyHPBannerState.variationId,
            })
          }
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        to={bannerData.link}
        onClick={() =>
          reportClickEngagement({
            decisionId: dyHPBannerState.decisionId,
            variationId: dyHPBannerState.variationId,
          })
        }
      >
        {children}
      </Link>
    );
  };

  const renderBanner = useCallback(() => {
    if (bannerData) {
      return bannerDataBox();
    }
    return (
      <Link to="/all-products">
        <Banner
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1636617253/marketing/Cross-Market/home%20page%20banner/All_Homepage_NewBrand_Mobile.jpg',
              loader: { ratio: 1.25 },
            },
            {
              breakpoint: 'md',
              srcset: '/v1636617253/marketing/Cross-Market/home%20page%20banner/All_Homepage_NewBrand_Tablet.jpg',
              loader: { ratio: 0.65 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1636617253/marketing/Cross-Market/home%20page%20banner/All_Homepage_NewBrand_Desktop.jpg',
              loader: { ratio: 0.52 },
            },
          ]}
          title="Castlery Home Banner"
          lazy={false}
          setImagePreloaderOnServer
        />
      </Link>
    );
  }, [bannerData]);

  const getPreloadImages = useCallback(() => {
    if (bannerData && bannerData.type === 'image') {
      const preloadImages = [];
      if (bannerData.mobile.src) {
        preloadImages.push(bannerData.mobile.src);
      }
      if (bannerData.tablet.src) {
        preloadImages.push(bannerData.tablet.src);
      }
      if (bannerData.desktop.src) {
        preloadImages.push(bannerData.desktop.src);
      }
      return preloadImages.concat(getCategoryImgs());
    }
    if (bannerData && bannerData.type === 'video') {
      const preloadImages = [];
      if (bannerData.mobile.video) {
        preloadImages.push(
          `https://res.cloudinary.com/castlery/video/upload/so_0,c_fill${bannerData.mobile.video}.jpg`
        );
      }
      if (bannerData.tablet.video) {
        preloadImages.push(
          `https://res.cloudinary.com/castlery/video/upload/so_0,c_fill${bannerData.tablet.video}.jpg`
        );
      }
      if (bannerData.desktop.video) {
        preloadImages.push(
          `https://res.cloudinary.com/castlery/video/upload/so_0,c_fill${bannerData.desktop.video}.jpg`
        );
      }
      return preloadImages.concat(getCategoryImgs());
    }
    return getCategoryImgs();
  }, [bannerData, getCategoryImgs]);

  useEffect(() => {
    popupDiscount();
  }, [popupDiscount]);
  useEffect(() => {
    if (linkCollections) {
      dispatch(loadList(linkCollections.map((c) => c.permalink)));
    }
  }, [linkCollections, dispatch]);

  return (
    <div className={`${style.home}`}>
      <Helmet
        jsonLd={[
          `{"@context": "http://schema.org",` +
            `"@type": "WebSite",` +
            `"url": "${__BASE_URL__}/",` +
            `"name": "Castlery",` +
            `"potentialAction": {` +
            `"@type": "SearchAction",` +
            `"target": "${__BASE_URL__}/search?q={search_term_string}",` +
            `"query-input": "required name=search_term_string"}}`,
        ]}
        path={pathname}
        preloadImgs={getPreloadImages()}
        preloadVideo={videoBanner?.video ? [videoBanner.video] : []}
      />
      {__CLIENT__ && window.location?.search?.startsWith('?sref_id=') && <YotpoScript />}

      <Header />
      <Container disableGutters className={`${style.home}__banner`}>
        {renderBanner()}
      </Container>

      <Container>
        <CategorySection categoryRows={getTargetData('category_rows')} />
        <USPSection />
        <ShopTheLookSection shopTheLookData={looks} type="home" />
        {linkCollections?.map((collection, i) => (
          <RecommendSection key={i} linkCollection={collection} campaign={recommendationCampaigns[i]} />
        ))}
        <div className={`${style.home}__divider1`} />
        <SocialSection posts={getTargetData('instagram')} />
        <OneDualBox
          containerClassName={`${style.story}`}
          leftClassName={`${style.story}__bannerLeft`}
          leftComponent={
            <Banner
              className={`${style.story}__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: '/static/home/edition2/HP-bf-ourstory-mobile.jpg',
                  loader: { ratio: 0.53333 },
                },
                {
                  breakpoint: 'lg',
                  srcset: '/static/home/edition2/HP-bf-ourstory-desktop.jpg',
                  loader: { ratio: 0.54861 },
                },
              ]}
              title="Our Story"
            />
          }
          rightClassName={`${style.story}__bannerRight`}
          rightComponent={
            <div className={`${style.story}__bannerDesc`}>
              <h2>Our Story</h2>
              <div>
                <h3>
                  We wanted to enrich our lives with timeless, well-made furniture, but couldn’t find ones that didn’t
                  break the bank.
                </h3>
              </div>
              <GhostArrowBtn text="Read More" href="/our-story" />
            </div>
          }
        />
        <ReviewSection />
        {/* <div className={`${style.home}__bottom`} /> */}
        <Divider
          sx={{
            '--Divider-lineColor': (theme) => theme.palette.brand.wheat[500],
          }}
        />
        <PressSection
          sx={{
            my: { xs: 10, sm: 2 },
          }}
        />
        <SeoContent />
      </Container>
      <Footer />
    </div>
  );
};

export default asyncLoad([
  ({ store: { dispatch }, pageType }) => dispatch(loadBanner({ selectorArray: ['HP Banner'], pageType })),
  ({ store: { dispatch } }) =>
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/main-pages/new-home-page`)),
])(Home);
