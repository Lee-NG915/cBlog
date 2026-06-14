'use client';
import { Box, RadioGroup, RadioIcon, Stack, Tag, Typography } from '@castlery/fortress';
import { useBreakpoints } from '@castlery/fortress/hooks';
import { Dimension } from '@castlery/fortress/Icons';
import { Image, Product, Variant } from '@castlery/modules-product-domain';
import { FortressImage, FortressVideo } from '@castlery/shared-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { default as ReactPlayerType } from 'react-player';
import { BaseOverlayImage } from './base-overlay-image';
import ThreeSixtyViewImage from './three-sixty-view-image';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { videosOptionTypes } from '@castlery/modules-product-services';

const GDA_LOGO_URL = 'https://res.cloudinary.com/castlery/image/upload/v1779940354/hardcode%20pages/GDA2025LOGO.png';
const IF_LOGO_URL = 'https://res.cloudinary.com/castlery/image/upload/v1779940371/hardcode%20pages/IF2026LOGO.png';

const ONE_LOGO_SIZES = {
  desktop: { width: '17.3%', height: '8.9%' },
  tablet: { width: '17.1%', height: '8.8%' },
  mobile: { width: '25.6%', height: '9.8%' },
};

const TWO_LOGO_SIZES = {
  desktop: { width: '36.4%', height: '8.9%' },
  tablet: { width: '36.1%', height: '8.8%' },
  mobile: { width: '54.4%', height: '9.8%' },
};

export interface MediaItemProps {
  media: Image;
  variant: Variant;
  isCurrent: boolean;
  product: Product;
  index: number;
  videoRefs?: React.MutableRefObject<Map<number, ReactPlayerType & { handleClickPreview?: () => void }>>;
  onDimensionToggle?: (isActive: boolean, index: number) => void;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
  galleryContainer?: Element | null;
  renderContext?: 'pdp-desktop-preview' | 'pdp-carousel' | 'enlarged-desktop' | 'enlarged-mobile';
}

export const MediaItem: React.FC<MediaItemProps> = ({
  media,
  variant,
  isCurrent: _isCurrent,
  product,
  index,
  videoRefs,
  onDimensionToggle,
  onVideoPlay,
  onVideoPause,
  galleryContainer,
  renderContext = 'pdp-carousel',
  // popShowMasterVideoStatus,
}) => {
  const dispatch = useAppDispatch();
  const [isDimensionActive, setIsDimensionActive] = useState<boolean | undefined>(false);
  const [showDimension, setShowDimension] = useState<boolean>(false);
  const { desktop, mobile } = useBreakpoints();
  const shouldHideDimensionToggle = renderContext === 'pdp-desktop-preview';
  const shouldHideBadges = renderContext === 'enlarged-mobile';
  const videoObjectFit = renderContext === 'pdp-desktop-preview' ? 'cover' : 'contain';
  // 仅 mobile/tablet 的 pdp-carousel 用 galleryContainer 做 IO root（Swiper 切换语义）；
  // pdp-desktop-preview（5 张垂直）和 enlarged-* (modal portal) 都用 viewport (null)。
  const effectiveRootContainer = renderContext === 'pdp-carousel' ? galleryContainer : null;

  const targetLinks = useMemo(() => {
    return variant?.dimension_image?.links || product?.dimension_image?.links;
  }, [variant?.dimension_image?.links, product?.dimension_image?.links]);

  const { dimensionImage, dimensionGrayImage } = useMemo(() => {
    return {
      dimensionImage: targetLinks?.feed,
      dimensionGrayImage: targetLinks?.large_gray,
    };
  }, [targetLinks]);

  // useEffect(() => {
  //   if (popShowMasterVideoStatus) {
  //     popShowMasterVideoStatus(showMasterVideo);
  //   }
  // }, [showMasterVideo, popShowMasterVideoStatus]);
  const isBaseImage = useMemo(() => media.type === 'base' || media.type === 'base_old', [media.type]);

  const needDisplayGDA = useMemo(() => {
    if (
      product &&
      index === 0 &&
      product.taxons?.some((taxon) => taxon.ancestors?.[0] === 'Category' && taxon.permalink === 'accessories')
    ) {
      return false;
    }
    return (
      product &&
      index === 0 &&
      product.taxons.some((taxon) => taxon.ancestors?.[0] === 'Collections' && taxon.permalink === 'hugg-collection')
    );
  }, [product, index]);

  const needDisplayIF = useMemo(() => {
    if (
      product &&
      index === 0 &&
      product.taxons?.some((taxon) => taxon.ancestors?.[0] === 'Category' && taxon.permalink === 'accessories')
    ) {
      return false;
    }
    if (product.name.includes('Lira') && index === 0) {
      return true;
    }
    if (
      product &&
      index === 0 &&
      product.taxons.some((taxon) => taxon.ancestors?.[0] === 'Collections' && taxon.permalink === 'hugg-collection')
    ) {
      return true;
    }
    if (
      product &&
      index === 0 &&
      product.taxons.some((taxon) => taxon.ancestors?.[0] === 'Collections' && taxon.permalink === 'mori-collection')
    ) {
      return true;
    }
    return false;
  }, [product, index]);

  const needDisplayLogo = useMemo(() => {
    if (needDisplayGDA && needDisplayIF) {
      return TWO_LOGO_SIZES;
    }
    if (needDisplayGDA) {
      return ONE_LOGO_SIZES;
    }
    if (needDisplayIF) {
      return ONE_LOGO_SIZES;
    }
    return null;
  }, [needDisplayGDA, needDisplayIF]);

  useEffect(() => {
    if (isBaseImage && dimensionImage) {
      setShowDimension(true);
    } else {
      setShowDimension(false);
    }
  }, [isBaseImage, dimensionImage]);

  const handleTrackPDPDetails = useCallback(
    async ({ action }: { action: string }) => {
      await dispatch(
        EVENT_PDP_DETAILS({
          action,
        })
      );
    },
    [dispatch]
  );

  const handleViewDimension = useCallback(
    (e: React.MouseEvent, isActive: boolean) => {
      setIsDimensionActive(isActive);
      if (onDimensionToggle) {
        onDimensionToggle(isActive, index);
      }
      if (isActive) {
        handleTrackPDPDetails({ action: 'dimension_click' });
      }
    },
    [onDimensionToggle, index, handleTrackPDPDetails]
  );
  if (media.type === 'short_video') {
    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <FortressVideo
          ref={(ref) => {
            if (videoRefs && ref) {
              videoRefs.current.set(index, ref);
            }
          }}
          src={media?.path || ''}
          autoPlay
          loop
          muted
          onPlay={onVideoPlay}
          onPause={onVideoPause}
          rootContainer={effectiveRootContainer}
          lazyLoad={true}
          threshold={0.6}
          autoPauseOnVisible={true}
          autoPlayOnVisible={true}
          videoConfig={{
            ac: true,
          }}
          containerConfig={{
            objectFit: videoObjectFit,
          }}
          controls={false}
          sx={{
            height: '100%',
            pb: 0,
          }}
        />
      </Box>
    );
  }

  if (videosOptionTypes.includes(media.type)) {
    const enableVideoControls = renderContext === 'enlarged-desktop' || renderContext === 'enlarged-mobile';

    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <FortressVideo
          ref={(ref) => {
            if (videoRefs && ref) {
              videoRefs.current.set(index, ref);
            }
          }}
          src={media?.path || ''}
          onPlay={onVideoPlay}
          onPause={onVideoPause}
          rootContainer={effectiveRootContainer}
          muted
          lazyLoad={true}
          threshold={0.6}
          autoPauseOnVisible={true}
          autoPlayOnVisible={true}
          thumbnailConfig={{
            // thumbnailWidth: desktop ? 1500 : 600,
            thumbnailQuality: 'best',
          }}
          containerConfig={{
            objectFit: videoObjectFit,
          }}
          controls={enableVideoControls}
          sx={{
            height: '100%',
            pb: 0,
          }}
        />
      </Box>
    );
  }

  // 360度视图处理
  if (media.type === '3d') {
    return <ThreeSixtyViewImage variant={variant} position={index} />;
  }

  if (media?.links) {
    return (
      <Stack
        direction={'row'}
        alignItems={'center'}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {(needDisplayGDA || needDisplayIF) && (
          <Box
            sx={(theme) => ({
              position: 'absolute',
              display: 'flex',
              flexDirection: 'row',
              gap: theme.spacing(4),
              top: mobile ? theme.spacing(5) : theme.spacing(22),
              right: mobile ? theme.spacing(5) : theme.spacing(6),
              width: desktop
                ? needDisplayLogo?.desktop.width
                : mobile
                ? needDisplayLogo?.mobile.width
                : needDisplayLogo?.tablet.width,
              height: desktop
                ? needDisplayLogo?.desktop.height
                : mobile
                ? needDisplayLogo?.mobile.height
                : needDisplayLogo?.tablet.height,
              zIndex: 2,
              ...(!desktop && {
                gap: theme.spacing(3),
              }),
            })}
          >
            {needDisplayIF && (
              <FortressImage
                src={IF_LOGO_URL}
                alt="IF Design Awards"
                ratio={152 / 78}
                objectFit="contain"
                sx={{
                  width: '100%',
                  '--AspectRatio-paddingBottom': '0px',
                }}
              />
            )}
            {needDisplayGDA && (
              <FortressImage
                src={GDA_LOGO_URL}
                alt="Great Design Awards"
                ratio={152 / 78}
                objectFit="contain"
                sx={{
                  width: '100%',
                  '--AspectRatio-paddingBottom': '0px',
                }}
              />
            )}
          </Box>
        )}
        {isBaseImage ? (
          <BaseOverlayImage
            src={isDimensionActive ? dimensionImage || dimensionGrayImage : media.links?.feed || ''}
            alt={`${product.name} ${index}`}
            bundleOptions={product?.bundle_options}
            overlayImageSizes={['0.7-md', '1-sm', '1-xs']}
            lazy={index >= 1}
            baseImageSxProps={{
              height: '100%',
              '--AspectRatio-paddingBottom': 0,
            }}
            overlayImageSxProps={{
              height: '100%',
              '--AspectRatio-paddingBottom': 0,
            }}
            {...{
              sizes: ['0.7-md', '1-sm', '1-xs'],
            }}
          />
        ) : (
          <FortressImage
            src={isDimensionActive ? dimensionImage || dimensionGrayImage : media.links?.feed || ''}
            alt={`${product.name} ${index}`}
            lazy={index >= 1}
            // objectFit={mobile ? 'cover' : 'contain'}
            objectFit="cover"
            sx={{
              height: '100%',
              '--AspectRatio-paddingBottom': 0,
            }}
            sizes={['0.7-md', '1-sm', '1-xs']}
          />
        )}
        {!shouldHideBadges && variant?.badges?.[0] && mobile && index === 0 && (
          <Tag
            variant="solid"
            sx={{
              position: 'absolute',
              top: (theme: any) => theme.spacing(6),
              left: (theme: any) => theme.spacing(6),
            }}
          >
            <Typography level="caption2">{variant?.badges[0]}</Typography>
          </Tag>
        )}
        {showDimension && !shouldHideDimensionToggle && (
          <RadioGroup
            value={isDimensionActive ? 'showDimensionImage' : ''}
            name="product-dimension"
            orientation="horizontal"
            aria-label="Show product dimensions"
            title="Show product dimensions"
            sx={(theme) => ({
              position: 'absolute',
              top: theme.spacing(8),
              right: theme.spacing(8),
              '.Mui-checked': {
                svg: {
                  path: {
                    fill: 'var(--fortress-palette-brand-warmLinen-500) !important',
                  },
                },
              },
              svg: {
                width: mobile ? '24px' : '44px',
                height: mobile ? '24px' : '44px',
              },
              '.MuiRadio-root': {
                '--Radio-size': mobile ? '40px' : '60px',
              },
            })}
            onClick={(e: React.MouseEvent) => handleViewDimension(e, !isDimensionActive)}
          >
            <RadioIcon
              data-show-dimension-icon={showDimension}
              value="showDimensionImage"
              variant="outlined"
              overlay
              uncheckedIcon={<Dimension />}
              checkedIcon={<Dimension />}
              slotProps={{
                input: {
                  'aria-label': 'Toggle product dimensions',
                  title: 'Toggle product dimensions',
                },
              }}
            />
          </RadioGroup>
        )}
      </Stack>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <FortressImage
        src={''}
        alt={`${product.name} ${index}`}
        ratio={1}
        objectFit={mobile ? 'cover' : 'contain'}
        sx={{
          height: '100%',
          '--AspectRatio-paddingBottom': 0,
        }}
        sizes={['0.7-md', '1-sm', '1-xs']}
      />
    </Box>
  );
};
