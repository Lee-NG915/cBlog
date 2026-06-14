'use client';

import { Box, useBreakpoints } from '@castlery/fortress';
import { WebHullaSection } from '../web-hulla-section/web-hulla-section';
import { Product, Variant } from '@castlery/modules-product-domain';
// import { WebProductInfoItem } from './components/web-product-info-item/web-product-info-item';
// import { ProductPropertyMixedGroup } from '../product-property-expand/product-property-mixed-group';

/* eslint-disable-next-line */
export interface WebInfoProps {
  variant: Variant | undefined;
  productData: Product | undefined;
  dimensionExpand?: boolean;
  type?: string;
  warrantyInfo?: Object;
}

export function WebInfo(props: WebInfoProps) {
  const {
    // variant,
    // productData,
    // dimensionExpand,
    type,
    //  warrantyInfo = { hasOffers: false }
  } = props;
  const { desktop, mobile } = useBreakpoints();
  return (
    <Box
      sx={{
        ...(type === 'pla'
          ? {
              padding: mobile ? '0 15px' : '0',
              marginBottom: '30px',
            }
          : {
              padding: mobile ? '0 15px' : '0',
              margin: desktop ? '16px 0 7px 0' : '0',
            }),
        ...(mobile && {
          marginBottom: '80px',
        }),
      }}
    >
      {type !== 'pla' && <Box>View the collection</Box>}
      {type !== 'pla' && <WebHullaSection />}
      {/* <WebProductInfoItem />
      <WebProductInfoItem />
      <WebProductInfoItem /> */}
      {/* <ProductPropertyMixedGroup
        comfort_ratings={productData?.product_properties.comfort_ratings}
        delivery_returns={productData?.product_properties.delivery_returns}
        product_details={productData?.product_properties.product_details}
        product_dimensions={productData?.product_properties.product_dimensions}
        dimension_image={variant?.dimension_image}
      /> */}
    </Box>
  );
}

export default WebInfo;
