'use client';

import { useRef } from 'react';
import type { UIEvent } from 'react';

import { Loading, Stack, useBreakpoints } from '@castlery/fortress';
import { ReviewImageItem } from '@castlery/modules-product-domain';
import { FortressImage } from '@castlery/shared-components';

const ImageInfiniteList = ({
  fixedImageGallery,
  fixedImageGalleryLoading,
  handleFixedImageGalleryLoadMore,
  onImageClick,
}: {
  fixedImageGallery: ReviewImageItem[];
  fixedImageGalleryLoading: boolean;
  handleFixedImageGalleryLoadMore: () => void;
  onImageClick: (image: ReviewImageItem) => void;
}) => {
  const { desktop } = useBreakpoints();
  const loadedScrollWidthRef = useRef<number | null>(null);

  const handleImageListScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.currentTarget;
    const hasReachedEnd = scrollLeft + clientWidth >= scrollWidth - 8;

    if (!hasReachedEnd) {
      loadedScrollWidthRef.current = null;
      return;
    }

    if (fixedImageGalleryLoading || loadedScrollWidthRef.current === scrollWidth) {
      return;
    }

    loadedScrollWidthRef.current = scrollWidth;
    handleFixedImageGalleryLoadMore();
  };

  return (
    <Stack
      onScroll={handleImageListScroll}
      sx={{
        overflowX: 'scroll',
        flex: 1,
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
      <Stack direction={'row'} gap={(theme) => theme.spacing(2)} sx={{ width: 'fit-content' }}>
        {fixedImageGallery.map((item) => (
          <FortressImage
            key={item.key}
            src={item.url}
            alt={item.title}
            imageWidth={desktop ? 120 : 80}
            imageHeight={desktop ? 120 : 80}
            objectFit="cover"
            lazy={false}
            sx={{
              cursor: 'pointer',
            }}
            onClick={() => onImageClick(item)}
          />
        ))}
        {fixedImageGalleryLoading && (
          <Stack
            sx={{
              width: desktop ? 120 : 80,
              height: desktop ? 120 : 80,
              justifyContent: 'center',
              alignItems: 'center',
              span: {
                transform: 'scale(2.5)',
                svg: {
                  '& circle:nth-of-type(2)': {
                    stroke: '#844025',
                  },
                },
              },
            }}
          >
            <Loading />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export { ImageInfiniteList };
