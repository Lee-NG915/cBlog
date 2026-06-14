'use client';

import { Box, useBreakpoints } from '@castlery/fortress';
import { ImageGallery } from '../image-gallery/image-gallery';
import { Product, Variant } from '@castlery/modules-product-domain';
/* eslint-disable-next-line */
export interface WebGalleryProps {
  variant: Variant | undefined;
  productData: Product | undefined;
}

export function WebGallery(props: WebGalleryProps) {
  const { variant, productData } = props;
  const { desktop, xl } = useBreakpoints();
  const renderImageGallery = () => {
    if (variant?.images.length === 0 && productData?.variants[0].images.length === 0) {
      return (
        <ImageGallery
          images={[
            {
              position: 1,
              links: {
                feed: 'https://res.cloudinary.com/castlery/image/upload/w_720/v1477990685/static/default.png',
                large: 'https://res.cloudinary.com/castlery/image/upload/w_720/v1477990685/static/default.png',
                large_gray: 'https://res.cloudinary.com/castlery/image/upload/w_720/v1477990685/static/default.png',
              },
              type: 'image',
            },
          ]}
          product={productData?.product_type === 'configurable' ? variant : productData?.variants[0]}
          bundleOptions={[]}
          assets={[]}
        />
      );
    }
    if (productData?.product_type === 'configurable') {
      if (variant?.images) {
        return (
          <ImageGallery
            images={variant.images}
            product={variant}
            bundleOptions={productData?.bundle_options || []}
            assets={variant?.assets || []}
          />
        );
      }
      if (productData?.variants[0].images) {
        return (
          <ImageGallery
            images={productData.variants[0].images}
            product={productData.variants[0]}
            bundleOptions={productData?.bundle_options || []}
            assets={productData.variants[0]?.assets || []}
          />
        );
      }
    }
    // 后续修改增加 Image 类型，考虑迁移到 redux 中
    if (productData?.product_type === 'bundle') {
      if (productData?.variants[0].images) {
        return (
          <ImageGallery
            images={productData.variants[0].images}
            product={productData.variants[0]}
            bundleOptions={productData?.bundle_options || []}
            assets={productData.variants[0]?.assets || []}
          />
        );
      }
      if (variant?.images) {
        return (
          <ImageGallery
            images={variant.images}
            product={variant}
            bundleOptions={productData?.bundle_options || []}
            assets={variant?.assets || []}
          />
        );
      }
    }
    return null;
  };
  return !desktop ? (
    <Box
      sx={{
        margin: '-20px 0',
        display: 'flow-root',
      }}
    >
      {renderImageGallery()}
      {/* {status && (
        <Sheet>
          <Sheet
            sx={{
              ml: '10px',
              mb: '23px',
            }}
            data-campaign="SSC PDP Recommendation Widget #1b"
          />
        </Sheet>
      )} */}
    </Box>
  ) : (
    <Box
      sx={{
        gridArea: 'left',
        alignSelf: 'start',
        // flex: '1 1 auto',
        minWidth: '480px',
        position: 'sticky',
        top: '1rem',
        marginRight: xl ? '40px' : '30px',
        // '.slick-slider': {
        //   margin: '0 30px 0 100px',
        //   ...(xl && {
        //     margin: '0 40px 0 100px',
        //   }),
        // },
      }}
    >
      {renderImageGallery()}
    </Box>
  );
}

export default WebGallery;
