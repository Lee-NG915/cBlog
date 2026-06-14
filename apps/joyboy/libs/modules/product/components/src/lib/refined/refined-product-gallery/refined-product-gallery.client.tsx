'use client';
import { Box, Button, IconButton, Stack, Typography, useBreakpoints, withBrandColor } from '@castlery/fortress';
import { PhotoLibrary, ThreeDRotation, ViewInAr } from '@castlery/fortress/Icons';
import {
  Image,
  Product,
  Variant,
  selectBundleVariants,
  selectProduct,
  selectVariant,
} from '@castlery/modules-product-domain';
import { mergeAndSortArrays, handleImagesSort } from '@castlery/modules-product-services';
import { useSelector } from '@castlery/shared-redux-store';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { default as ReactPlayerType } from 'react-player';
import { logger } from '@castlery/observability/client';
import type { Swiper as SwiperType } from 'swiper';
import { FreeMode, Mousewheel, Navigation, Scrollbar, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useCompatibility } from '../../../hooks/use-compatibility';
import { useHash } from '../../../hooks/use-hash';
import { useSlickAutoScroll } from '../../image-gallery/hooks/use-slick-auto-scroll';
import { ARDrawer } from '../../threed-ar/ar/ar-drawer';
import { SketchfabViewer } from '../../threed-ar/sketchfab-viewer/sketchfab-viewer';
import { MediaItem, type MediaItemProps } from './components/media-item';
import {
  DesktopGalleryImpressionTracker,
  type DesktopGalleryImpressionPayload,
} from './components/desktop-gallery-impression-tracker';
import { ThumbnailImage } from './components/thumbnail-image';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_PDP_IMAGE_IMPRESSION, EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { useFirstInView } from '@castlery/modules-tracking-components';
import { ProductEnlargedGalleryViewer } from '../../product-enlarged-gallery-viewer/product-enlarged-gallery-viewer';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/mousewheel';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import 'swiper/css/thumbs';

// 主组件
export function RefinedProductGalleryClient() {
  const [galleryEl, setGalleryEl] = useState<HTMLDivElement | null>(null);
  const mainSwiperRef = useRef<SwiperType | null>(null);
  const thumbsSwiperRef = useRef<SwiperType | null>(null);
  const videoRefs = useRef<Map<number, ReactPlayerType & { handleClickPreview?: () => void }>>(new Map());
  const mountedRef = useRef(false);
  const lastTrackedIndexRef = useRef(-1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setIsDragging] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchEndTime, setTouchEndTime] = useState(0);
  // const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const [dimensionActiveSet, setDimensionActiveSet] = useState<Set<number>>(new Set());
  const [dimensionViewerOpen, setDimensionViewerOpen] = useState(false);
  // AR/3D 相关状态
  const [showThreeD, setShowThreeD] = useState(false);
  const [showARDrawer, setShowARDrawer] = useState(false);
  const [defaultStartAR, setDefaultStartAR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const { desktop, tablet, mobile } = useBreakpoints();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const hash = useHash();
  const product = useSelector(selectProduct) as Product;
  const selectedVariant: Variant = useSelector(selectVariant) || product?.variants?.[0];
  const bundleVariants = useSelector(selectBundleVariants);
  const { supports3D, supportsAR } = useCompatibility();

  const [viewerOpen, setViewerOpen] = useState(false);

  const uid = useMemo(() => {
    return selectedVariant?.sketchfab_3d_model_id?.trim();
  }, [selectedVariant]);

  const isSupportThreeD = useMemo(() => Boolean(uid && supports3D), [uid, supports3D]);
  const isSupportAR = useMemo(() => Boolean(uid && supportsAR), [uid, supportsAR]);

  const galleryList = useMemo(() => {
    const threedImages =
      selectedVariant?.threed_images && !uid ? { type: '3d', ...selectedVariant.threed_images[0] } : null;
    const sortedImages = [...mergeAndSortArrays(selectedVariant?.images, selectedVariant?.assets || [])];
    if (threedImages) {
      const baseIndex = sortedImages.findIndex((item) => item.type === 'base' || item.type === 'base_old');
      if (baseIndex !== -1) {
        sortedImages.splice(baseIndex, 1, sortedImages[baseIndex], threedImages);
      } else {
        sortedImages.splice(1, 0, threedImages);
      }
    }
    return handleImagesSort(sortedImages);
  }, [selectedVariant?.assets, selectedVariant?.images, selectedVariant.threed_images, uid]);

  const targetLinks = useMemo(() => {
    return selectedVariant?.dimension_image?.links || product?.dimension_image?.links;
  }, [selectedVariant?.dimension_image?.links, product?.dimension_image?.links]);

  const { dimensionGrayImage } = useMemo(() => {
    return {
      dimensionGrayImage: targetLinks?.large_gray,
    };
  }, [targetLinks]);

  const dimensionGalleryList = useMemo<Image[]>(() => {
    if (!dimensionGrayImage) return [];

    return [
      {
        position: 0,
        type: 'base',
        links: {
          feed: dimensionGrayImage,
          large: dimensionGrayImage,
          large_gray: dimensionGrayImage,
        },
      },
    ];
  }, [dimensionGrayImage]);

  useSlickAutoScroll({
    swiperRef: mainSwiperRef,
    images: galleryList,
    product,
    variantId: selectedVariant?.id,
    bundleVariants,
  });
  // 图片曝光事件
  useEffect(() => {
    if (desktop) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      lastTrackedIndexRef.current = currentIndex;
      return;
    }
    const target = galleryList[currentIndex];
    if (target && currentIndex !== lastTrackedIndexRef.current) {
      lastTrackedIndexRef.current = currentIndex;
      dispatch(EVENT_PDP_IMAGE_IMPRESSION({ assetPosition: currentIndex + 1, assetType: target.type }));
    }
  }, [desktop, galleryList, currentIndex, dispatch]);

  const handleDesktopImageImpression = useCallback(
    ({ assetPosition, assetType }: DesktopGalleryImpressionPayload) => {
      dispatch(EVENT_PDP_IMAGE_IMPRESSION({ assetPosition, assetType }));
    },
    [dispatch]
  );

  // Hash 操作函数
  const handleAddHash = useCallback((hash: string) => {
    // let currentUrl = window.location.href;

    // if (currentUrl.indexOf('#') !== -1) {
    //   const parts = currentUrl.split('#');
    //   currentUrl = `${parts[0]}#${hash}${parts[1] ? `#${parts[1]}` : ''}`;
    // } else {
    //   currentUrl += `#${hash}`;
    // }
    // window.history.pushState({}, document.title, currentUrl);
    // 获取不含 hash 的基础 URL

    if (window.location.hash === `#${hash}`) {
      window.location.hash = '';
      setTimeout(() => {
        window.location.hash = hash;
      }, 0);
    } else {
      window.location.hash = hash;
    }
  }, []);

  const handleTrackPDPDetails = useCallback(
    async ({ action, label }: { action: string; label: string }) => {
      await dispatch(
        EVENT_PDP_DETAILS({
          action,
          label,
        })
      );
    },
    [dispatch]
  );

  const vrButtonsRef = useFirstInView(() => {
    // view_impression
    if (supports3D) {
      handleTrackPDPDetails({ action: 'view_impression', label: '360_view' });
    }
    if (supportsAR) {
      handleTrackPDPDetails({ action: 'view_impression', label: 'view_with_ar' });
    }
  });

  // 3D 查看处理
  const handleThreeDView = useCallback(
    (isShow: boolean) => {
      setShowThreeD(isShow);
      if (isShow) {
        setDefaultStartAR(false);
        handleTrackPDPDetails({ action: 'view_click', label: '360_view' });
      }
    },
    [handleTrackPDPDetails]
  );

  // AR 查看处理 - 参考原始 SketchfabViewer.js 的 handleAR 逻辑
  const handleARView = useCallback(() => {
    // TODO: 添加事件追踪
    handleTrackPDPDetails({ action: 'view_click', label: 'view_with_ar' });

    if (!desktop) {
      // 移动端：修改 hash 并启动 3D 查看器
      handleAddHash('ar-via-qr-code');
      setShowThreeD(true);
      setDefaultStartAR(true);
    } else {
      // 桌面端：直接打开 AR drawer 显示二维码
      setShowARDrawer(true);
    }
  }, [desktop, handleAddHash, handleTrackPDPDetails]);

  // 客户端 URL 初始化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`;
      setCurrentUrl(fullUrl);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!uid || !hash) return;

    if (hash === 'dimensions-3d' && isSupportThreeD) {
      setShowThreeD(true);
      setDefaultStartAR(false);
    } else if (hash === 'ar-via-qr-code' && !desktop && isSupportAR) {
      setShowThreeD(true);
      setDefaultStartAR(true);
    }
    // else if (hash === 'web-ar-not-supported') {
    //   if (!desktop) {
    //     console.warn('AR not supported on this device');
    //   }
    // }
    // else if (hash && (hash === 'dimensions-3d' || hash === 'ar-via-qr-code')) {
    //   window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    // }
  }, [uid, hash, isSupportThreeD, isSupportAR, desktop, setShowThreeD, setDefaultStartAR]);

  // 变体信息（用于 Sketchfab 查看器）
  const variantInfo = useMemo(() => {
    if (!selectedVariant) return undefined;

    return {
      id: String(selectedVariant.id),
      name: selectedVariant.name,
      checkoutTitle: (selectedVariant as any)?.product_name || product?.name || '',
      checkoutSubtitle: selectedVariant.name,
      price: selectedVariant.price, // 这里保持原始类型，在 SketchfabViewer 中处理格式化
    };
  }, [selectedVariant, product]);

  const checkDimensionActive = useCallback((index: number) => dimensionActiveSet.has(index), [dimensionActiveSet]);

  const handleOnPictureClick = useCallback(
    (index: number) => {
      const touchDuration = touchEndTime - touchStartTime;
      const isQuickTouch = touchDuration < 200;

      if (isQuickTouch) {
        const currentMedia = galleryList?.[index];
        const isVideo = currentMedia && currentMedia.type?.includes('video');
        if (isVideo) return;

        if (checkDimensionActive(index) && dimensionGrayImage) {
          setDimensionViewerOpen(true);
          return;
        }

        setCurrentIndex(index);
        setViewerOpen(true);
      }
    },
    [
      touchEndTime,
      touchStartTime,
      galleryList,
      checkDimensionActive,
      dimensionGrayImage,
      setDimensionViewerOpen,
      setCurrentIndex,
      setViewerOpen,
    ]
  );

  // const handleViewMoreFeatures = useCallback(() => {
  //   if (masterVideoIndex === -1) return;
  //
  //   if (desktop) {
  //     setCurrentIndex(masterVideoIndex);
  //     setViewerOpen(true);
  //     return;
  //   }
  //
  //   if (mainSwiperRef.current) {
  //     mainSwiperRef.current.slideTo(masterVideoIndex);
  //     setCurrentIndex(masterVideoIndex);
  //     setTimeout(() => {
  //       const masterVideoRef = videoRefs.current.get(masterVideoIndex);
  //       if (masterVideoRef) {
  //         masterVideoRef.handleClickPreview?.();
  //         // setPlayingVideos((prev) => new Set(prev).add(masterVideoIndex));
  //       }
  //     }, 600);
  //   }
  // }, [desktop, masterVideoIndex]);

  const scrollToDimension = useCallback(
    (isActive: boolean, index: number) => {
      if (isActive) {
        setDimensionActiveSet((prev) => new Set(prev).add(index));
      } else {
        setDimensionActiveSet((prev) => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }

      // if (!isActive || !desktop) return;
      // const dimensionAnchor = document.getElementById('dimension-property');
      // if (dimensionAnchor) {
      //   dimensionAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      //   handleAddHash('dimension-property');
      //   // // 手动触发 hashchange 事件，确保组件能立即响应
      //   // window.dispatchEvent(
      //   //   new HashChangeEvent('hashchange', {
      //   //     oldURL: window.location.href,
      //   //     newURL: `${window.location.pathname}${window.location.search}#dimension-property`,
      //   //   })
      //   // );
      // }
    },
    [setDimensionActiveSet]
  );

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newIndex = swiper.activeIndex;
      // setPlayingVideos(new Set());
      setCurrentIndex(newIndex);
      setIsDragging(false);
    },
    [setCurrentIndex, setIsDragging]
  );

  const handleVideoPlay = useCallback((_index: number) => {
    // setPlayingVideos((prev) => new Set(prev).add(index));
  }, []);

  const handleVideoPause = useCallback((_index: number) => {
    // setPlayingVideos((prev) => {
    //   const newSet = new Set(prev);
    //   newSet.delete(index);
    //   return newSet;
    // });
  }, []);

  const createVideoPlayHandler = useCallback((index: number) => () => handleVideoPlay(index), [handleVideoPlay]);
  const createVideoPauseHandler = useCallback((index: number) => () => handleVideoPause(index), [handleVideoPause]);

  const renderMediaItem = useCallback(
    (
      media: any,
      index: number,
      isCurrent: boolean,
      renderContext: NonNullable<MediaItemProps['renderContext']> = 'pdp-carousel'
    ) => (
      <MediaItem
        media={media}
        videoRefs={videoRefs}
        product={product}
        variant={selectedVariant!}
        index={index}
        isCurrent={isCurrent}
        onDimensionToggle={scrollToDimension}
        onVideoPlay={createVideoPlayHandler(index)}
        onVideoPause={createVideoPauseHandler(index)}
        galleryContainer={galleryEl}
        renderContext={renderContext}
      />
    ),
    [videoRefs, product, selectedVariant, scrollToDimension, createVideoPlayHandler, createVideoPauseHandler, galleryEl]
  );

  // AR/3D 按钮组件
  const renderARButtons = useCallback(() => {
    if (!isSupportThreeD) return null;

    return (
      <Stack
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent="center"
        sx={(theme) => ({
          position: 'absolute',
          maxWidth: '100%',
          bottom: desktop ? theme.spacing(8) : theme.spacing(6),
          left: desktop ? 'auto' : '50%',
          right: desktop ? theme.spacing(8) : 'auto',
          transform: desktop ? 'none' : 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: desktop ? theme.spacing(3) : theme.spacing(2),
        })}
        ref={vrButtonsRef as any}
      >
        {/* 3D 查看按钮 */}
        <IconButton
          aria-label="View product in 360"
          variant="image"
          onClick={() => {
            handleAddHash('dimensions-3d');
            handleThreeDView(true);
          }}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <ThreeDRotation />
        </IconButton>
        {/* AR 按钮 - 参考原始逻辑 */}
        {isSupportAR && (
          <IconButton
            aria-label="View product in AR"
            variant="image"
            onClick={handleARView}
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <ViewInAr />
          </IconButton>
        )}
      </Stack>
    );
  }, [isSupportThreeD, isSupportAR, handleARView, desktop, handleAddHash, handleThreeDView, vrButtonsRef]);

  return (
    <>
      <Box ref={setGalleryEl} sx={{ position: 'relative', width: '100%' }}>
        {desktop ? (
          <Stack justifyContent="center" alignItems="center">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 4,
                width: '100%',
              }}
            >
              {galleryList.slice(0, 5).map((media, index) => (
                <DesktopGalleryImpressionTracker
                  key={`${media.type}-${index}`}
                  index={index}
                  media={media}
                  onImpression={handleDesktopImageImpression}
                  sx={{ gridColumn: index === 0 ? '1 / -1' : undefined }}
                >
                  <Box
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      const isButton = target?.tagName === 'svg' || target?.getAttribute('type') === 'svg';
                      if (!isButton) {
                        // if (checkDimensionActive(index) && dimensionGrayImage) {
                        //   setDimensionViewerOpen(true);
                        //   return;
                        // }
                        setCurrentIndex(index);
                        setViewerOpen(true);
                      }
                    }}
                    sx={{
                      position: 'relative',
                      aspectRatio: '5/4',
                      cursor: 'pointer',
                    }}
                  >
                    {renderMediaItem(media, index, currentIndex === index, 'pdp-desktop-preview')}
                    {index === 0 && renderARButtons()}
                  </Box>
                </DesktopGalleryImpressionTracker>
              ))}
            </Box>
            {(galleryList?.length ?? 0) > 5 && (
              <Button
                variant="plain"
                startDecorator={<PhotoLibrary />}
                sx={{
                  ...withBrandColor('burntOrange', { variant: 'plain' }),
                  mt: 6,
                  mb: 4,
                  '&:hover': { backgroundColor: 'var(--fortress-palette-brand-burntOrange-50)' },
                  '&:focus': { backgroundColor: 'var(--fortress-palette-brand-burntOrange-50)' },
                  '&:active': { backgroundColor: 'var(--fortress-palette-brand-burntOrange-100)' },
                }}
                onClick={async () => {
                  await dispatch(EVENT_PDP_DETAILS({ action: 'full_gallery_view', label: 'click' }));
                  setCurrentIndex(0);
                  setViewerOpen(true);
                }}
              >
                <Typography level="subh2">View full gallery</Typography>
              </Button>
            )}
          </Stack>
        ) : galleryList?.length === 1 ? (
          <Box
            onClick={(event) => {
              const target = event.target as HTMLElement;
              const isRadioInput = target?.tagName === 'INPUT' && target?.getAttribute('type') === 'radio';
              const isButton = target?.tagName === 'BUTTON' || target?.getAttribute('type') === 'button';
              const currentMedia = galleryList[0];
              const isVideo = currentMedia && currentMedia.type?.includes('video');

              if (isRadioInput || isButton || isVideo) return;

              if (checkDimensionActive(0) && dimensionGrayImage) {
                setDimensionViewerOpen(true);
                return;
              }

              setCurrentIndex(0);
              setViewerOpen(true);
            }}
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: mobile ? 0.75 : 1,
              cursor: 'pointer',
            }}
          >
            {renderMediaItem(galleryList[0], 0, true, 'pdp-carousel')}
            {renderARButtons()}
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Swiper
              onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
              direction={'horizontal'}
              spaceBetween={0}
              slidesPerView={1}
              speed={300}
              grabCursor={true}
              touchRatio={0.8}
              longSwipesRatio={0.3}
              mousewheel={false}
              freeMode={{
                enabled: true,
                sticky: false,
                momentumRatio: 0.6,
                momentumVelocityRatio: 0.4,
                momentumBounceRatio: 0.3,
                minimumVelocity: 0.08,
              }}
              thumbs={{
                swiper: thumbsSwiperRef.current && !thumbsSwiperRef.current.destroyed ? thumbsSwiperRef.current : null,
              }}
              modules={[Navigation, Mousewheel, Thumbs, FreeMode]}
              onSlideChange={handleSlideChange}
              onSlideChangeTransitionStart={() => setIsDragging(true)}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onTouchStart={() => {
                setTouchStartTime(Date.now());
                setIsDragging(true);
              }}
              onTouchEnd={() => {
                setTouchEndTime(Date.now());
                setIsDragging(false);
              }}
              onTransitionEnd={(_swiper) => {
                setIsDragging(false);
                // handleTransitionEnd(swiper);
              }}
              onClick={(swiper, event) => {
                const clickedIndex = swiper.clickedIndex;
                if (typeof clickedIndex === 'number') {
                  const target = event?.target as HTMLElement;
                  const isRadioInput = target?.tagName === 'INPUT' && target?.getAttribute('type') === 'radio';
                  const isButton = target?.tagName === 'BUTTON' || target?.getAttribute('type') === 'button';
                  if (!isRadioInput && !isButton) {
                    handleOnPictureClick(clickedIndex);
                  }
                }
              }}
              style={{
                width: '100%',
                aspectRatio: mobile ? 0.75 : 1,
                position: 'relative',
              }}
            >
              {galleryList?.map((media, index) => (
                <SwiperSlide key={index}>
                  {renderMediaItem(media, index, currentIndex === index, 'pdp-carousel')}
                </SwiperSlide>
              ))}
              {/* AR/3D 按钮 */}
              {renderARButtons()}
            </Swiper>
            <Box
              sx={{
                width: '100%',
                mt: 2,
                '.swiper-scrollbar': {
                  '--swiper-scrollbar-bottom': 0,
                  backgroundColor: 'var(--fortress-palette-brand-mono-100)',
                  left: 0,
                  '.swiper-scrollbar-drag': {
                    '--swiper-scrollbar-drag-bg-color': 'var(--fortress-palette-brand-terracotta-500)',
                  },
                },
                pl: 2,
              }}
            >
              <Swiper
                onSwiper={(swiper) => (thumbsSwiperRef.current = swiper)}
                spaceBetween={8}
                slidesPerView="auto"
                freeMode={true}
                watchSlidesProgress={true}
                scrollbar={{
                  hide: false,
                  draggable: true,
                  dragSize: 'auto',
                }}
                modules={[Thumbs, Scrollbar]}
                slideToClickedSlide={true}
                onClick={(swiper, _event) => {
                  const clickedIndex = swiper.clickedIndex;
                  if (typeof clickedIndex === 'number' && mainSwiperRef.current) {
                    mainSwiperRef.current.slideTo(clickedIndex);
                  }
                }}
                style={{
                  paddingBottom: 12,
                }}
              >
                {galleryList?.map((media, index) => (
                  <SwiperSlide
                    key={index}
                    style={{
                      width: tablet ? '100px' : '64px',
                      height: tablet ? '100px' : '64px',
                    }}
                  >
                    <ThumbnailImage
                      media={media}
                      index={index}
                      product={product}
                      isActive={currentIndex === index}
                      dimensionGrayImage={dimensionGrayImage}
                      renderContext="pdp-carousel"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          </Box>
        )}
        {showThreeD && uid && (
          <SketchfabViewer
            uid={uid}
            variantInfo={variantInfo}
            handleThreeDView={handleThreeDView}
            defaultStartAR={defaultStartAR}
            supportsAR={isSupportAR}
            onOpenARDrawer={() => setShowARDrawer(true)}
          />
        )}

        <ARDrawer
          open={showARDrawer}
          onClose={() => setShowARDrawer(false)}
          url={currentUrl}
          uid={uid || ''}
          api={null}
          variantInfo={variantInfo}
          onStartAR={(modelId: string) => {
            console.log('AR started for model:', modelId);
          }}
          onError={(message: string) => {
            logger.error('AR error', { message });
          }}
          onBack={() => {
            setShowARDrawer(false);
            handleThreeDView(false);
          }}
        />
      </Box>
      <ProductEnlargedGalleryViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        galleryList={galleryList}
        initialIndex={currentIndex}
        product={product}
        renderMediaItem={renderMediaItem}
        dimensionGrayImage={dimensionGrayImage}
      />
      <ProductEnlargedGalleryViewer
        open={dimensionViewerOpen}
        onClose={() => setDimensionViewerOpen(false)}
        galleryList={dimensionGalleryList}
        initialIndex={0}
        product={product}
        renderMediaItem={renderMediaItem}
        dimensionGrayImage={dimensionGrayImage}
        getTrackingPayload={() => ({
          assetPosition: 'product dimension',
          assetType: 'dimension',
        })}
      />
      {/* <PinchZoomViewer
          open={dimensionPinchZoomOpen}
          setOpen={setDimensionPinchZoomOpen}
          slideImages={[
            {
              src: dimensionGrayImage,
              width: 100,
              height: 100,
              alt: 'dimension gray image',
              assetType: 'dimension',
              assetPosition: 'product dimension',
            },
          ]}
          index={0}
          enabledTrackSlider={true}
        /> */}
    </>
  );
}
