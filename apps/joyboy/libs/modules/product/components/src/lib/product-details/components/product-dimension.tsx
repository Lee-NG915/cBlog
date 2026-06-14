'use client';

import { Box, IconButton, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import { Image, Product, Variant } from '@castlery/modules-product-domain';
import { FortressImage } from '@castlery/shared-components';
import { useCallback, useMemo, useState } from 'react';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { ProductEnlargedGalleryViewer } from '../../product-enlarged-gallery-viewer/product-enlarged-gallery-viewer';

interface ProductDimensionProps {
  product?: Product;
  variant?: Variant;
}

export const ProductDimension = (props: ProductDimensionProps) => {
  const { product, variant } = props;
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [openEnlarged, setOpenEnlarged] = useState(false);
  const targetLinks = useMemo(() => {
    return variant?.dimension_image?.links || product?.dimension_image?.links;
  }, [product, variant]);

  const dimensionGalleryList = useMemo<Image[]>(() => {
    if (!targetLinks) return [];
    return [
      {
        position: 0,
        type: 'base',
        links: {
          feed: targetLinks.feed || targetLinks.feed,
          large: targetLinks.large_gray || targetLinks.feed,
          large_gray: targetLinks.large_gray,
        },
      },
    ];
  }, [targetLinks]);

  const renderDimensionItem = useCallback(
    (media: Image) => (
      <FortressImage
        src={media.links?.feed || media.links?.large || ''}
        alt={`dimension of ${product?.name}`}
        sx={{ height: '100%', '--AspectRatio-paddingBottom': 0 }}
      />
    ),
    [product?.name]
  );

  const handleTrackPDPDetails = useCallback(async () => {
    await dispatch(
      EVENT_PDP_DETAILS({
        action: 'product_property',
        label: `Dimensions Image`,
      })
    );
  }, [dispatch]);

  const handleDimensionImageClick = useCallback(() => {
    setOpenEnlarged(true);
    handleTrackPDPDetails();
  }, [handleTrackPDPDetails]);

  return (
    <>
      <Stack>
        {targetLinks && (
          <Box
            position="relative"
            onClick={handleDimensionImageClick}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                '& .overlay': {
                  opacity: 1,
                },
              },
            }}
          >
            <FortressImage
              src={targetLinks?.feed}
              alt={`dimension of ${product?.name}`}
              ratio={1.5}
              sizes={['0.4-md', '1-sm', '1-xs']}
            />
            {desktop && (
              <Box
                className="overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.25)',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                }}
              >
                <Stack justifyContent="center" alignItems="center" spacing={2}>
                  <IconButton
                    variant="image"
                    sx={{
                      width: '40px',
                      height: '40px',
                      '& svg': {
                        color: 'var(--fortress-palette-brand-mono-900)',
                      },
                    }}
                    onClick={handleDimensionImageClick}
                  >
                    <Search />
                  </IconButton>
                  <Typography
                    level="body1"
                    sx={{
                      color: 'var(--fortress-palette-brand-warmLinen-200)',
                    }}
                  >
                    Click to expand
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Stack>
      {product && (
        <ProductEnlargedGalleryViewer
          open={openEnlarged}
          onClose={() => setOpenEnlarged(false)}
          galleryList={dimensionGalleryList}
          initialIndex={0}
          product={product}
          renderMediaItem={renderDimensionItem}
          getTrackingPayload={() => ({
            assetPosition: 'product dimension',
            assetType: 'dimension',
          })}
        />
      )}
    </>
  );
};
