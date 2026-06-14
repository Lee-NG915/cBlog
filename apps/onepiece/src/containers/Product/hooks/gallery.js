import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { privateVideoCloudinaryRoot, videoCloudinaryRoot, cloudinaryRoot, privateCloudinaryRoot } from 'config';
import { animate } from 'utils/animate';
import { useDispatch } from 'react-redux';
import { EVENT_PDP_IMAGE_DURATION } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import {
  useCurrentProduct,
  useCurrentVariant,
  useCurrentSelectedVariants,
  useMobileFrame,
  useProductOptions,
} from './product';
import { useSupportAR, useSupportThreeD } from './compatibility';

const videosOptionTypes = ['master_video', 'video', 'short_video'];

const handleImagesSort = (images) => {
  try {
    const first = images[0];
    if (videosOptionTypes.includes(first?.type)) {
      const notVideoFirstItemIndex = images.findIndex((item) => !videosOptionTypes.includes(item.type));
      images.unshift(images.splice(notVideoFirstItemIndex, 1)[0]);
    }
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: 'Error sorting images in gallery',
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        null,
        2
      )
    );
  }
  return images;
};
const useImgModal = () => {
  const { frame } = useMobileFrame();
  return useCallback(
    (images, index, handleResetTime) => {
      if (!Array.isArray(images)) {
        frame.openModal('image', {
          images: [images],
          initialIndex: index,
          handleResetTime,
        });
      } else {
        frame.openModal('image', {
          images,
          initialIndex: index,
          handleResetTime,
        });
      }
    },
    [frame]
  );
};

const useGallery = () => {
  const open = useImgModal();
  const product = useCurrentProduct();
  const variant = useCurrentVariant();
  const selectedVariants = useCurrentSelectedVariants();
  const { init, realCustomisable } = useProductOptions();
  const timerRef = useRef(null);
  const dispatch = useDispatch();

  const handleResetTime = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(
    () => () => {
      handleResetTime();
    },
    []
  );

  const gallery = useMemo(() => {
    if (init && product.product_type) {
      // new picture;
      const assets = variant.assets || [];
      const old = variant.images || [];
      const uid = variant?.sketchfab_3d_model_id?.trim();
      const threedImages = variant.threed_images && !uid ? { type: '3d', ...variant.threed_images[0] } : null;

      const sortedImages = [...sortBy([...assets, ...old], 'position')];
      if (threedImages) {
        const baseIndex = sortedImages.findIndex((item) => item.type === 'base' || item.type === 'base_old');
        if (baseIndex !== -1) {
          sortedImages.splice(baseIndex, 1, sortedImages[baseIndex], threedImages);
        } else {
          sortedImages.splice(1, 0, threedImages);
        }
      }

      const formattedImages = sortedImages
        .map((image) => {
          const { type } = image;
          if (videosOptionTypes.includes(type)) {
            const { path } = image;
            const isPrivateCloudinaryVideo = path.startsWith(privateVideoCloudinaryRoot);
            const isCloudinaryVideo = path.startsWith(videoCloudinaryRoot);
            if (isPrivateCloudinaryVideo || isCloudinaryVideo) {
              const videoRoot = isPrivateCloudinaryVideo ? privateVideoCloudinaryRoot : videoCloudinaryRoot;
              const [, url] = path.split(videoRoot);
              const i = url.lastIndexOf('.');
              let id = url.slice(0, i);
              id = id.startsWith('/') ? id.slice(1) : id;
              const thumbnail = `${videoRoot}/w_120,ar_1,c_fill,g_center,so_0,q_auto,f_auto/${id}.jpg`;
              const transformId = `so_0,q_auto,f_auto/${id}`;
              return {
                id,
                type,
                thumbnail,
                transformId,
                videoRoot,
              };
            }
            return null;
          }
          if (type === '3d') {
            return { type, variant, links: image.links };
          }
          const { large, large_gray } = image.links;
          const links = {
            large: large_gray,
            imageModal: large,
          };
          const overlay = [];
          const imageModalOverlays = [];
          let thumbnail = '';
          if ((type === 'base' || type === 'base_old') && product.product_type === 'bundle') {
            // obtain the overlay
            product.bundle_options.forEach((option) => {
              if (option.bundle_option_type !== 'simple' && selectedVariants[option.id]) {
                const imgs = selectedVariants[option.id].overlay;
                if (imgs) {
                  const _links = imgs.links;
                  overlay.push({
                    mini: _links.mini_overlay,
                    mini_x2: _links.mini_x2_overlay,
                    small: _links.small_overlay,
                    small_x2: _links.small_x2_overlay,
                    medium: _links.medium_overlay,
                    medium_x2: _links.medium_x2_overlay,
                    large: _links.large_overlay,
                    large_x2: _links.large_x2_overlay,
                  });
                  imageModalOverlays.push(_links.large_x2_overlay);
                }
              }
            });
          }
          if (type === 'lifestyle_other') {
            const isPrivateCloudinaryImage = large?.startsWith(privateCloudinaryRoot);
            const isCloudinaryImage = large?.startsWith(cloudinaryRoot);
            if (isPrivateCloudinaryImage || isCloudinaryImage) {
              const imageRoot = isPrivateCloudinaryImage ? privateCloudinaryRoot : cloudinaryRoot;
              const [, url] = large?.split(`${imageRoot}/`);
              const pureUrl = url.slice(url.indexOf('/'));
              thumbnail = `${imageRoot}/w_120,ar_1,c_fill,g_center,f_auto,q_auto/${pureUrl}`;
            }
          }
          return {
            type: type || 'base',
            links,
            overlay,
            thumbnail,
            imageModalOverlays,
          };
        })
        .filter(Boolean);

      const masterVideo = formattedImages.find(({ type }) => type === 'master_video') || null;

      const imageModalImages = formattedImages.map(
        ({ links, type, id, transformId, imageModalOverlays = [], variant, videoRoot }) => {
          if (imageModalOverlays.length) {
            return [...imageModalOverlays.reverse(), links.imageModal];
          }
          if (videosOptionTypes.includes(type)) {
            return { type, id, transformId, videoRoot };
          }

          if (type === '3d') {
            return { type, variant };
          }

          return { type, imageUrl: links.imageModal };
        }
      );

      const images = formattedImages.map((image, index) => {
        const openModal = () => {
          timerRef.current = setTimeout(() => {
            dispatch({
              type: EVENT_PDP_IMAGE_DURATION,
              result: {
                assetPosition: index + 1,
                assetType: image?.type,
              },
            });
          }, 5000);
          open(imageModalImages, index, handleResetTime);
        };
        return { ...image, openModal };
      });
      return { images: handleImagesSort(images), masterVideo };
    }
    return [];
  }, [variant, selectedVariants, product, open, realCustomisable, init]);

  return {
    gallery,
    product,
    variant,
  };
};

const useSlick = (images, product, customPagingFactory, dimensionGrayImage) => {
  const dragging = useRef(false);
  const slickRef = useRef();
  const galleryRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { desktop } = useBreakpoints();

  const handleSlickBeforeChange = useCallback((oldIndex, newIndex) => {
    if (oldIndex !== newIndex) {
      dragging.current = true;
    }
  }, []);

  const handleSlickAfterChange = useCallback((newIndex) => {
    dragging.current = false;
    setCurrentIndex(Math.floor(newIndex));
  }, []);

  const customPaging = useMemo(
    () => customPagingFactory(images, product, dimensionGrayImage),
    [images, product, customPagingFactory, dimensionGrayImage]
  );

  const settings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      ref: slickRef,
      speed: 500,
      autoplay: false,
      swipeToSlide: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: desktop && !!(images && images.length > 1),
      customPaging,
      beforeChange: handleSlickBeforeChange,
      afterChange: handleSlickAfterChange,
    }),

    [customPaging, handleSlickAfterChange, handleSlickBeforeChange, images]
  );

  const handleOnPictureClick = (cb) => {
    if (!dragging.current) {
      cb();
    }
  };

  return {
    settings,
    handleOnPictureClick,
    galleryRef,
    dragging,
    slickRef,
    currentIndex,
  };
};

const useSlickAutoHover = (galleryRef) => {
  const slideListRef = useRef();
  useEffect(() => {
    slideListRef.current = galleryRef.current?.querySelector('.slick-list');
    return () => {
      slideListRef.current = null;
    };
  }, [galleryRef]);

  useEffect(() => {
    if (!slideListRef.current) return;
    const element = slideListRef.current;

    const handleHover = () => galleryRef.current?.classList.add('active');
    const handleLeave = () => galleryRef.current?.classList.remove('active');
    element.addEventListener('mouseenter', handleHover);
    element.addEventListener('mouseleave', handleLeave);
    return () => {
      element.removeEventListener('mouseenter', handleHover);
      element.removeEventListener('mouseleave', handleLeave);
    };
  }, [galleryRef]);
};

const useSlickAutoScroll = (slickRef, images, dragging) => {
  const baseIndexRef = useRef();
  const changeRef = useRef(false);
  const firstLoad = useRef(true);
  const product = useCurrentProduct();
  const { variantId } = useProductOptions();
  const selectedVariants = useCurrentSelectedVariants();
  const targetBaseIndex = useMemo(() => {
    const baseIndex = images.findIndex((item) => item.type === 'base');
    const baseOldIndex = images.findIndex((item) => item.type === 'base_old');
    return Math.min(...[baseIndex, baseOldIndex].filter((it) => it !== -1));
  }, [images]);

  baseIndexRef.current = targetBaseIndex;

  useEffect(() => {
    if (!firstLoad.current) {
      changeRef.current = true;
    }
  }, [product]);

  useEffect(() => {
    const timmer = setTimeout(() => {
      if (firstLoad.current) {
        firstLoad.current = false;
      } else if (!firstLoad.current && slickRef.current) {
        if (product.product_type === 'bundle') {
          if (changeRef.current) {
            slickRef.current.slickGoTo(0);
            changeRef.current = false;
          } else {
            slickRef.current.slickGoTo(baseIndexRef.current || 0);
          }
          setTimeout(() => {
            dragging.current = false;
          }, 0);
        } else {
          slickRef.current.slickGoTo(baseIndexRef?.current || 0);
          setTimeout(() => {
            dragging.current = false;
          }, 0);
        }
      }
    }, 1000);
    return () => clearTimeout(timmer);
  }, [product, slickRef, variantId, selectedVariants, dragging]);
};

const useSlickAutoScrollDot = (galleryRef, index) => {
  const slickDots = useRef();
  const firstLoad = useRef(true);
  const { desktop } = useBreakpoints();

  useEffect(() => {
    slickDots.current = galleryRef.current?.querySelector('.slick-dots');
  }, [galleryRef]);

  useEffect(() => {
    if (desktop) {
      if (firstLoad.current) {
        firstLoad.current = false;
      } else if (slickDots.current) {
        try {
          const containerHeight = slickDots.current.offsetHeight;
          const item = slickDots.current.children[index];
          const itemHeight = item.offsetHeight;
          const length = parseInt(containerHeight / itemHeight);
          const scrollTop = (index + 1 - length / 2) * (itemHeight + 10);
          animate({
            from: slickDots.current.scrollTop,
            to: scrollTop,
            duration: 300,
            func: 'easeInOutQuad',
            callback: (d) => (slickDots.current.scrollTop = d),
          });
        } catch (error) {
          console.log('🚀 ~ file: gallery.js:375 ~ useEffect ~ error:', error);
        }
      }
    }
  }, [index]);

  useEffect(() => {
    if (!desktop) {
      if (firstLoad.current) {
        firstLoad.current = false;
      } else if (slickDots.current) {
        try {
          const containerWidth = slickDots.current.offsetWidth;
          const item = slickDots.current.children[index];
          const itemWidth = item.offsetWidth;
          const length = parseInt(containerWidth / itemWidth);
          const scrollLeft = (index + 1 - length / 2) * (itemWidth + 5);
          animate({
            from: slickDots.current.scrollLeft,
            to: scrollLeft,
            duration: 300,
            func: 'easeInOutQuad',
            callback: (d) => (slickDots.current.scrollLeft = d),
          });
        } catch (error) {
          console.log('🚀 ~ file: gallery.js:400 ~ useEffect ~ error:', error);
        }
      }
    }
  }, [index]);
};

const useThreeDOrAR = () => {
  const { variant } = useGallery();
  const isSupportThreeD = useSupportThreeD();
  const isSupportAR = useSupportAR();
  const uid = variant?.sketchfab_3d_model_id?.trim();
  return [
    {
      uid,
      isSupportThreeD,
      isSupportAR,
    },
  ];
};

export {
  useGallery,
  useImgModal,
  useSlick,
  useSlickAutoHover,
  useSlickAutoScroll,
  useSlickAutoScrollDot,
  useThreeDOrAR,
};
