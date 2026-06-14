import { Box, Stack, useBreakpoints } from '@castlery/fortress';
import { PlayWhite, Dimension, ThreeSixty } from '@castlery/fortress/Icons';
import { FortressImage } from '@castlery/shared-components';
import { Image, Product } from '@castlery/modules-product-domain';
import { generateVideoThumbnail } from '@castlery/utils';
import { BaseOverlayImage } from './base-overlay-image';

interface ThumbnailImageProps {
  media: Image;
  index: number;
  product: Product;
  isActive: boolean;
  dimensionGrayImage?: string;
  renderContext?: 'pdp-desktop-preview' | 'pdp-carousel' | 'enlarged-desktop' | 'enlarged-mobile';
}

export function ThumbnailImage({
  media,
  index,
  product,
  isActive,
  dimensionGrayImage,
  renderContext = 'pdp-carousel',
}: ThumbnailImageProps) {
  const { type, thumbnail, links = {}, path } = media || {};
  const { desktop, tablet, mobile } = useBreakpoints();
  const thumbnailSizes = desktop ? '78px' : tablet ? '100px' : '64px';
  const videoObjectFit = renderContext === 'pdp-desktop-preview' ? 'cover' : 'contain';
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        border: isActive && !desktop ? `3px solid ${theme.vars.palette.brand.terracotta[500]}` : 'transparent',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...(desktop && {
          ...(isActive && {
            outline: `3px solid ${theme.vars.palette.brand.burntOrange[500]}`,
            outlineOffset: 1,
          }),
          '&:hover': {
            outline: `3px solid ${theme.vars.palette.brand.burntOrange[500]}`,
            outlineOffset: 1,
          },
        }),
      })}
    >
      {/* 普通图片缩略图 */}
      {!['video', 'master_video', 'short_video'].includes(type) &&
        (type === 'base' || type === 'base_old' ? (
          <BaseOverlayImage
            src={thumbnail || (links as any)?.feed || ''}
            alt={`${product.name} ${index}`}
            bundleOptions={product?.bundle_options}
            baseImageSxProps={{
              height: '100%',
              '--AspectRatio-paddingBottom': 0,
            }}
            overlayImageSxProps={{
              height: '100%',
              '--AspectRatio-paddingBottom': 0,
            }}
            overlayImageSizes={thumbnailSizes}
          />
        ) : (
          <FortressImage
            src={thumbnail || (links as any)?.feed || ''}
            alt={`${product.name} ${index}`}
            ratio={1}
            objectFit="cover"
            sx={{
              height: '100%',
              '--AspectRatio-paddingBottom': 0,
            }}
            sizes={thumbnailSizes}
          />
        ))}

      {/* 视频缩略图 */}
      {['video', 'master_video', 'short_video'].includes(type) && (
        <>
          <FortressImage
            src={
              path
                ? generateVideoThumbnail(path, {
                    thumbnailStartOffset: 0,
                  })
                : thumbnail || (links as any)?.feed || ''
            }
            alt={`${product.name} ${index}`}
            ratio={1}
            objectFit={videoObjectFit}
            sx={{
              height: '100%',
              '--AspectRatio-paddingBottom': 0,
            }}
            sizes={thumbnailSizes}
          />
          <Stack
            justifyContent={'center'}
            alignItems={'center'}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <PlayWhite sx={{ width: '50px', height: '50px' }} />
          </Stack>
        </>
      )}

      {/* 尺寸图标 */}
      {(type === 'base_old' || type === 'base') && dimensionGrayImage && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, .7)',
            }}
          >
            <Dimension />
          </Box>
        </Box>
      )}

      {/* 360度视图标识 */}
      {type === '3d' && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, .7)',
            }}
          >
            <ThreeSixty />
          </Box>
        </Box>
      )}
    </Box>
  );
}
