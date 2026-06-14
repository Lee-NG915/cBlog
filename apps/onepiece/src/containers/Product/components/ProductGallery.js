import React, { useCallback, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import Video from 'components/Video';
import View360 from 'components/View360';
import ReactSVG from 'components/ReactSVG';
import { Dimension, PlayArrowFilled } from '@castlery/fortress/Icons';
import ReactPicture from 'components/ReactPicture';
import { NextBtn, PrevBtn } from 'components/DesktopSlideButton';
import { EVENT_PDP_IMAGE_IMPRESSION, EVENT_PDP_DETAILS, EVENT_PDP_IMAGE_DURATION } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { toPrice } from 'utils/number';
import { useInView } from 'react-intersection-observer';
import { useLocation } from 'react-use';
import { Box, Typography } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { isSafari, isMobile, isChrome } from 'react-device-detect';
import { loadImagesInIdleTime } from 'utils/loadImagesInIdleTime.js';
import { processSrcset } from 'components/ReactPicture/utils';
import { setImageQuality } from 'redux/modules/productOptions.js';
import {
  useGallery,
  useSlick,
  useSlickAutoHover,
  useSlickAutoScroll,
  useSlickAutoScrollDot,
  useImgModal,
  useThreeDOrAR,
} from '../hooks/gallery';
import Viewer from './SketchfabViewer';

import style from './style.scss';

const customPagingFactory = (images, product, dimensionGrayImage) =>
  function pagingInstance(i) {
    const { type, thumbnail, overlay = [], links = {} } = images[i] || {};
    return (
      <div className={`${style.gallery}__Dot`}>
        <ReactPicture
          srcset={thumbnail || [links, ...overlay]}
          alt={`${product.name} ${i}`}
          loader={{
            ratio: 1,
            widths: [100, 150, 200],
            sizes: '75px',
            objectFit: ['base', 'base_old', '3d'].includes(type) ? 'contain' : '',
          }}
          lazy={i >= 7}
        />
        {['video', 'master_video', 'short_video'].includes(type) && (
          <div className={`${style.gallery}__Dot-video-playBtn`} />
        )}
        {(type === 'base_old' || type === 'base') && dimensionGrayImage && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, .7)',
              }}
            >
              <Dimension fontSize="xl2" />
            </Box>
          </Box>
        )}
        {type === '3d' ? (
          <div className={`${style.gallery}__Dot-3d`}>
            <ReactSVG name="360_view_new" />
            <span>360º</span>
          </div>
        ) : null}
      </div>
    );
  };

const MainItem = ({
  links,
  overlay,
  type,
  id,
  videoRoot,
  transformId,
  variant,
  isCurrent,
  allowSwipe,
  stopSwipe,
  product,
  index,
  masterVideo,
  openModal,
  handleOnPictureClick,
  scrollToDimension,
  popShowMasterVideoStatus,
}) => {
  const load = useRef();
  const open = useImgModal();

  let element = null;
  const dispatch = useDispatch();
  const [showMasterVideo, setShowMasterVideo] = useState(false);
  const [isDimensionActive, setIsDimensionActive] = useState(undefined);
  const targetLinks = variant.dimension_image?.links || product.dimension_image?.links;
  const dimensionImage = targetLinks?.large;
  const dimensionGrayImage = targetLinks?.large_gray;
  const timerRef = useRef(null);
  const { desktop } = useBreakpoints();
  const handleResetTime = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  useEffect(
    () => () => {
      handleResetTime();
      dispatch(setImageQuality({}));
    },
    []
  );

  useEffect(() => {
    popShowMasterVideoStatus(showMasterVideo);
  }, [showMasterVideo]);

  useEffect(() => {
    if (isCurrent && index === 0) {
      return () => {
        setShowMasterVideo(false);
      };
    }
    if (!isCurrent) {
      handleResetTime();
    }
    if (!isCurrent && isDimensionActive !== undefined) {
      // setIsDimensionActive(false);
      if (desktop) {
        scrollToDimension(false);
      }
    }
  }, [isCurrent, index, variant, scrollToDimension, isDimensionActive, desktop]);

  const trackDuration = useCallback(
    (position, label) => {
      timerRef.current = setTimeout(() => {
        dispatch({
          type: EVENT_PDP_IMAGE_DURATION,
          result: {
            assetPosition: position,
            assetType: label,
          },
        });
      }, 5000);
    },
    [dispatch]
  );

  const handleViewDimension = useCallback(
    (e, isActive) => {
      e.stopPropagation();
      setIsDimensionActive(isActive);

      if (isActive) {
        dispatch({
          type: EVENT_PDP_DETAILS,
          result: {
            detailAction: 'dimension_click',
            label: null,
          },
        });
      }

      if (desktop) {
        scrollToDimension(isActive);
      }
    },
    [dispatch, scrollToDimension, desktop]
  );

  if (index === 0 && masterVideo) {
    element = (
      <div className={`${style.gallery}__masterContainer`}>
        {showMasterVideo ? (
          <Video
            id={masterVideo.id}
            ratios={1}
            videoRoot={masterVideo.videoRoot}
            controls
            forTrack={{
              sku: variant?.sku,
            }}
            needPause={!isCurrent}
            onCloseMasterVideo={() => {
              setShowMasterVideo(false);
              handleResetTime();
            }}
          />
        ) : (
          <>
            <ReactPicture
              className={`${style.gallery}__picture  ${style.gallery}__picture--${type}`}
              srcset={links}
              alt={`${product.name} ${index}`}
              loader={{
                ratio: 1,
                widths: [500, 700, 900, 1000, 1200, 1400],
                sizes: desktop ? ['700px-xxl', '500px-xl', '0.5'] : ['0.9-md'],
                objectFit: 'contain',
              }}
              lazy={false}
              setImagePreloaderOnServer={index === 0}
              onClick={() => handleOnPictureClick(openModal)}
            />
            <div className={`${style.gallery}__masterPicOverlay`} />
          </>
        )}
        <button
          type="button"
          className={`${style.gallery}__masterContainer-playBtn ${showMasterVideo ? 'hide' : ''}`}
          onClick={() => {
            dispatch({
              type: EVENT_PDP_IMAGE_IMPRESSION,
              result: {
                assetPosition: 1,
                assetType: 'master_video',
              },
            });
            trackDuration(1, 'master_video');
            setShowMasterVideo(!showMasterVideo);
          }}
        >
          <Typography level="body2" startDecorator={<PlayArrowFilled fontSize="xl4" />}>
            <div id="master-video-btn-text">View more features</div>
          </Typography>
        </button>
      </div>
    );
  } else if (type === 'short_video') {
    element = (
      <div className={`${style.gallery}__video`}>
        <div className={`${style.gallery}__video-content`}>
          <Video id={id} ratios={1} videoRoot={videoRoot} showControls={false} loop muted />
        </div>
      </div>
    );
  } else if (['video', 'master_video'].includes(type)) {
    element = (
      <div className={`${style.gallery}__video`}>
        <div className={`${style.gallery}__video-content`}>
          <Video
            id={id}
            key={id}
            ratios={1}
            autoPlay={false}
            videoRoot={videoRoot}
            thumbnail={{
              id: transformId,
              setImagePreloaderOnServer: index === 0,
            }}
            needPause={!isCurrent}
            forTrack={{
              sku: variant?.sku,
            }}
            onPlayVideo={() => trackDuration(index + 1, type)}
          />
        </div>
      </div>
    );
  } else if (type === '3d') {
    element = (
      <div className={`${style.gallery}__3d`}>
        <div className={`${style.gallery}__3d-content`}>
          <View360 variant={variant} pointerDownHandler={stopSwipe} pointerUpHandler={allowSwipe} index={index} />
        </div>
      </div>
    );
  } else if (links) {
    let showDimension = false;
    let srcset = overlay.length > 0 ? [links, ...overlay] : links;
    if ((type === 'base_old' || type === 'base') && dimensionGrayImage) {
      showDimension = true;
      if (isDimensionActive) {
        srcset = dimensionGrayImage;
      }
    }
    element = (
      <div className={`${style.gallery}__baseContainer`}>
        <ReactPicture
          className={`${style.gallery}__picture  ${style.gallery}__picture--${type}`}
          srcset={srcset}
          alt={`${product.name} ${index}`}
          loader={{
            ratio: 1,
            widths: [500, 700, 900, 1000, 1200, 1400],
            sizes: desktop ? ['700px-xxl', '500px-xl', '0.5'] : ['0.9-md'],
            objectFit: 'contain',
          }}
          lazy={false}
          setImagePreloaderOnServer={index === 0}
          onClick={(e) => {
            if (isDimensionActive) {
              e.stopPropagation();
              open(dimensionImage, 0, handleResetTime);
              dispatch({
                type: EVENT_PDP_DETAILS,
                result: {
                  detailAction: 'product_property',
                  label: `Dimensions Image`,
                },
              });
              trackDuration('thumbnail button', 'dimension');
            }
          }}
        />

        {showDimension && (
          <div
            role="button"
            className={classNames(`${style.gallery}__baseContainer__dimension`, {
              'is-expand': isDimensionActive,
            })}
            onClick={(e) => handleViewDimension(e, !isDimensionActive)}
          >
            <ReactSVG name="dimension" />
          </div>
        )}
      </div>
    );
  }
  load.current = load.current ? load.current : isCurrent;
  return isCurrent || load.current ? element : <div style={{ paddingBottom: '100%' }} />;
};

MainItem.propTypes = {
  links: PropTypes.object,
  overlay: PropTypes.array,
  type: PropTypes.string,
  id: PropTypes.string,
  isCurrent: PropTypes.bool,
  videoRoot: PropTypes.string,
  transformId: PropTypes.string,
  allowSwipe: PropTypes.func,
  stopSwipe: PropTypes.func,
  variant: PropTypes.object,
  index: PropTypes.number,
  product: PropTypes.object,
  masterVideo: PropTypes.object,
  openModal: PropTypes.func,
  handleOnPictureClick: PropTypes.func,
  scrollToDimension: PropTypes.func,
  popShowMasterVideoStatus: PropTypes.func,
};

const ProductGallery = (
  {
    product,
    images,
    masterVideo,
    variant,
    settings,
    dragging,
    galleryRef,
    currentIndex,
    handleOnPictureClick,
    forwardRef,
    scrollToDimension,
  },
  { frame }
) => {
  const [swipe, setSwipe] = useState(true);
  const [showThreeD, setShowThreeD] = useState(false);
  const [defaultStartAR, setDefaultStartAR] = useState(false);
  const [showMasterVideo, setShowMasterVideo] = useState(false);
  const dispatch = useDispatch();
  const [{ isSupportAR, uid, isSupportThreeD }] = useThreeDOrAR();
  const location = useLocation();
  const { desktop } = useBreakpoints();
  const variantInfo = {
    checkoutTitle: variant.product_name,
    checkoutSubtitle: variant.name,
    price: toPrice(variant.price),
  };
  const stopSwipe = useCallback(() => {
    if (desktop) {
      dragging.current = true;
    }
    setSwipe(false);
  }, [dragging, desktop]);

  const allowSwipe = useCallback(() => {
    if (desktop) {
      setTimeout(() => {
        dragging.current = false;
      }, 0);
    }
    setSwipe(true);
  }, [dragging, desktop]);

  const handleStopSwipeInSafari = () => {
    try {
      const image = images[currentIndex];
      const { type } = image;
      if (['master_video'].includes(type) && (isSafari || (isMobile && isChrome))) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleAddHash = (hash) => {
    let currentUrl = window.location.href;

    if (currentUrl.indexOf('#') !== -1) {
      const parts = currentUrl.split('#');
      currentUrl = `${parts[0]}#${hash}${parts[1] ? `#${parts[1]}` : ''}`;
    } else {
      currentUrl += `#${hash}`;
    }

    window.history.pushState({}, document.title, currentUrl);
  };

  const handleThreeDView = (isShow) => {
    setShowThreeD(isShow);
    if (isShow) {
      setDefaultStartAR(false);

      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'view_click',
          label: '360_view',
        },
      });
    }
  };

  const handleARView = useCallback(() => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'view_click',
        label: 'view_with_ar',
      },
    });

    if (!desktop) {
      handleAddHash('ar-via-qr-code');
      setShowThreeD(true);
      setDefaultStartAR(true);
    } else {
      const { origin, pathname, search } = window.location || {};
      frame.openModal('arModal', {
        params: { url: `${origin + pathname + search}` },
      });
    }
  }, [frame, dispatch, desktop]);

  useEffect(() => {
    if (uid) {
      const hashVal = location?.hash?.substring(1);

      if (hashVal === 'dimensions-3d' && isSupportThreeD) {
        setShowThreeD(true);
      } else if (hashVal === 'ar-via-qr-code' && !desktop && isSupportAR) {
        setShowThreeD(true);
        setDefaultStartAR(true);
      } else if (hashVal === 'web-ar-not-supported') {
        if (!desktop) {
          frame.openModal('arErrorModal', {
            handleClose: () => {
              window.location.hash = '';
            },
          });
        }
      }
    }
  }, [uid, location?.hash, desktop]);

  const [ref, inView] = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  const [arRef, arInView] = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'view_impression',
          label: '360_view',
        },
      });
    }
  }, [inView, dispatch]);

  useEffect(() => {
    if (arInView) {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'view_impression',
          label: 'view_with_ar',
        },
      });
    }
  }, [arInView, dispatch]);

  const arBtn = isSupportThreeD && (
    <div
      className={classNames(`${style.gallery}__btn`, {
        'one-image': images.length === 1,
      })}
    >
      <a
        href="#dimensions-3d"
        onClick={() => {
          handleAddHash('dimensions-3d');
          handleThreeDView(true);
        }}
      >
        <ReactSVG name="360-view" />
        <span ref={ref}>360 View</span>
      </a>

      {isSupportAR &&
        (desktop ? (
          <button type="button" onClick={handleARView} className={`${style.gallery}__btn__ar`}>
            <ReactSVG name="view-with-AR" />
            <span ref={arRef}>View with AR</span>
          </button>
        ) : (
          <a href="#ar-via-qr-code" onClick={handleARView} className={`${style.gallery}__btn__ar`}>
            <ReactSVG name="view-with-AR" />
            <span ref={arRef}>View with AR</span>
          </a>
        ))}
    </div>
  );

  return (
    <>
      {images.length > 1 ? (
        <div ref={galleryRef} role="menuitem" className={style.gallery}>
          <div ref={forwardRef}>
            <Slider
              {...settings}
              swipe={
                handleStopSwipeInSafari() || (showMasterVideo && (isSafari || (isMobile && isChrome))) ? false : swipe
              }
              arrows={desktop}
              prevArrow={desktop && <PrevBtn isUsedInPDP />}
              nextArrow={desktop && <NextBtn isUsedInPDP />}
            >
              {images.map((image, index) => {
                const { openModal, type } = image;
                return (
                  <div
                    key={index}
                    role="button"
                    tabIndex="0"
                    onClick={() => {
                      if (image?.links) {
                        dispatch(
                          setImageQuality({
                            imageQuality: 'best',
                            imageSrc: [],
                            imageOrigin: image?.links?.large,
                          })
                        );
                      }
                      if ((index !== 0 || !masterVideo) && !['video', 'master_video'].includes(type)) {
                        handleOnPictureClick(openModal);
                      }
                    }}
                  >
                    <MainItem
                      {...image}
                      masterVideo={masterVideo}
                      product={product}
                      variant={variant}
                      index={index}
                      allowSwipe={allowSwipe}
                      stopSwipe={stopSwipe}
                      isCurrent={currentIndex === index}
                      handleOnPictureClick={handleOnPictureClick}
                      scrollToDimension={scrollToDimension}
                      popShowMasterVideoStatus={setShowMasterVideo}
                    />
                  </div>
                );
              })}
            </Slider>

            {uid && arBtn}
          </div>
        </div>
      ) : (
        <div className={style.galleryOnly}>
          {images.map((image, index) => {
            const { openModal, type } = image;
            return (
              <div
                role="button"
                key={index}
                ref={forwardRef}
                onClick={() => {
                  if ((index !== 0 || !masterVideo) && !['video', 'master_video'].includes(type)) {
                    handleOnPictureClick(openModal);
                  }
                }}
              >
                <MainItem
                  {...image}
                  product={product}
                  variant={variant}
                  index={index}
                  allowSwipe={allowSwipe}
                  stopSwipe={stopSwipe}
                  isCurrent
                  scrollToDimension={scrollToDimension}
                  popShowMasterVideoStatus={setShowMasterVideo}
                />
              </div>
            );
          })}

          {uid && arBtn}
        </div>
      )}

      {showThreeD && (
        <Viewer
          uid={uid}
          variantInfo={variantInfo}
          handleThreeDView={handleThreeDView}
          defaultStartAR={defaultStartAR}
        />
      )}
    </>
  );
};

ProductGallery.propTypes = {
  images: PropTypes.array,
  product: PropTypes.object,
  variant: PropTypes.object,
  settings: PropTypes.object,
  dragging: PropTypes.object,
  galleryRef: PropTypes.object,
  currentIndex: PropTypes.number,
  handleOnPictureClick: PropTypes.func,
  masterVideo: PropTypes.object || null,
  forwardRef: PropTypes.object,
  scrollToDimension: PropTypes.func,
};
ProductGallery.contextTypes = {
  frame: PropTypes.object,
};
const ProductGalleryWrapper = ({ forwardRef, scrollToDimension }) => {
  const galleryRef = useRef();
  const { gallery, product, variant } = useGallery();
  const targetLinks = variant.dimension_image?.links || product.dimension_image?.links;
  const dimensionGrayImage = targetLinks?.large_gray;
  const { images, masterVideo } = gallery;
  const { settings, dragging, slickRef, currentIndex, handleOnPictureClick } = useSlick(
    images,
    product,
    customPagingFactory,
    dimensionGrayImage
  );
  useSlickAutoHover(galleryRef);

  useSlickAutoScroll(slickRef, images, dragging);

  useSlickAutoScrollDot(galleryRef, currentIndex);

  const dispatch = useDispatch();

  const mounted = useRef(false);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    const imageArr = [];
    images.forEach((image) => {
      if (image?.links?.large) {
        imageArr.push(processSrcset(image?.links?.large, null, true));
      }
    });
    // 利用浏览器空闲时间加载大图
    loadImagesInIdleTime(imageArr);
  }, [dispatch, images]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    } else if (images.length > 0 && currentIndex !== currentIndexRef.current) {
      currentIndexRef.current = currentIndex;
      dispatch({
        type: EVENT_PDP_IMAGE_IMPRESSION,
        result: {
          assetPosition: currentIndex + 1,
          assetType: images[currentIndex]?.type,
        },
      });
    }
  }, [currentIndex, dispatch, images]);
  return (
    <ProductGallery
      images={images}
      masterVideo={masterVideo}
      product={product}
      variant={variant}
      settings={settings}
      dragging={dragging}
      galleryRef={galleryRef}
      currentIndex={currentIndex}
      handleOnPictureClick={handleOnPictureClick}
      forwardRef={forwardRef}
      scrollToDimension={scrollToDimension}
    />
  );
};
ProductGalleryWrapper.propTypes = {
  forwardRef: PropTypes.object,
  scrollToDimension: PropTypes.func,
};

export default ProductGalleryWrapper;
