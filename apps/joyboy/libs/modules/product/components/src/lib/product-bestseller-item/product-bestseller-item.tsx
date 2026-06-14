'use client';
import { useMemo } from 'react';
import { Typography, useBreakpoints, Card, CardCover, CardContent, Button } from '@castlery/fortress';
import { FortressImage, useProductBreadcrumbs } from '@castlery/shared-components';
import { useParams } from 'next/navigation';
import { EcEnv } from '@castlery/config';
import { useTrackingTags } from '@castlery/modules-tracking-components';

interface ProductBestsellerItemProps {
  sku: string;
  slotId: string;
  productData: {
    collection: string;
    image_url: string;
    product_breadcrumbs: string;
  };
  outerModuleName?: string;
}
export function ProductBestsellerItem({ productData, outerModuleName = '' }: ProductBestsellerItemProps) {
  const { desktop } = useBreakpoints();
  const { region } = useParams();

  const breadcrumbArr =
    typeof productData?.product_breadcrumbs === 'string' ? JSON.parse(productData?.product_breadcrumbs) : [];
  const productBreadcrumbs = breadcrumbArr?.filter((item) => item.level === 1 || item.level === 2) || [];
  const breadcrumbs = useProductBreadcrumbs(productBreadcrumbs);

  const image = useMemo(() => {
    const img = productData?.lifestyle_image;
    if (img) {
      return img;
    }
    const additionalImgs =
      typeof productData?.additional_image_link === 'string'
        ? JSON.parse(productData?.additional_image_link)
        : productData?.image_url;
    if (Array.isArray(additionalImgs)) {
      return additionalImgs[0];
    }
    return typeof additionalImgs === 'string' ? additionalImgs : '';
  }, [productData]);

  const toLink = useMemo(() => {
    // category[0]=sofas%2Fsectional-sofas&q=Owen%20Collection
    const category = Array.isArray(breadcrumbs) && breadcrumbs.length > 0 ? breadcrumbs.pop()?.permalink : '';
    const collection = productData?.collection?.replaceAll(' ', '+');
    return `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${region}/search?category[0]=${encodeURIComponent(
      category || ''
    )}&q=${encodeURIComponent(collection)}`;
  }, [productData, region, breadcrumbs]);

  const trackingTags = useTrackingTags({
    moduleName: outerModuleName,
    elementName: productData?.collection,
  });

  return (
    <Card
      sx={{
        p: 0,
        m: 0,
        border: 'none',
        borderRadius: '10px',
        overflow: 'hidden',

        ...(desktop
          ? {
              width: '24.31vw',
              height: '24.31vw',
              maxWidth: 420,
              maxHeight: 420,
            }
          : {
              width: 292,
              height: 292,
            }),
      }}
    >
      <CardCover>
        <FortressImage src={image} ratio={1} alt={productData?.collection} />
      </CardCover>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(182deg, rgba(0, 0, 0, 0.56) 18.63%, rgba(52, 52, 52, 0.42) 36.38%, rgba(196, 196, 196, 0.21) 50%)',
        }}
      >
        <Typography
          sx={{
            width: desktop ? 250 : 150,
            textAlign: 'center',
            color: 'white',
            mt: desktop ? '40px' : 4,
            mx: 'auto',
            fontFamily: `var(--fortress-fontFamily-display)`,
            fontSize: desktop ? 41 : 28,
            lineHeight: 1.5,
          }}
        >
          {productData?.collection}
        </Typography>
        <Button
          {...trackingTags}
          variant="secondary"
          component={'a'}
          href={toLink}
          sx={{
            justifyContent: 'center',
            mx: `auto`,
            mb: desktop ? 4 : 3,
            background: 'rgba(255, 255, 255, 0.85)',
            ...(desktop
              ? {
                  width: 166,
                  height: 52,
                }
              : {
                  width: 150,
                  height: 44,
                }),
          }}
        >
          Explore
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductBestsellerItem;
