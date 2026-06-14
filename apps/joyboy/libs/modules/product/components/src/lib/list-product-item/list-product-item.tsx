'use client';

import { Box, Stack, Typography } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import type { LineItemBundleLineItemSchema, LineItemSchema } from '@castlery/types';
import { removeClPicBgColor } from '@castlery/utils';
import { ProductItemName } from '../product-item-name/product-item-name';
import { ProductTypeMapping } from '@castlery/config';

export interface ListProductItemProps {
  lineItem: LineItemSchema;
}

export function ListProductItem({ lineItem }: ListProductItemProps) {
  const { variant, quantity } = lineItem;
  const variantOptionValues = variant?.variantOptionValues || [];
  const image = variant?.images[0]?.links.feed ? removeClPicBgColor(variant?.images[0]?.links.feed) : '';
  const title = variant?.productName;
  const isBundleItem = lineItem.productType === ProductTypeMapping.BUNDLE;
  const bundleLineItems = lineItem.bundleLineItems || [];
  const bundleOptionValues =
    lineItem.bundleLineItems?.map(
      (bundleItem: LineItemBundleLineItemSchema) => bundleItem.variant.variantOptionValues
    ) || [];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          columnGap: 4,
        }}
      >
        <Box sx={{ width: 160 }}>
          <Box sx={{ width: 142, mx: 'auto' }}>
            <FortressImage
              src={image}
              alt={title}
              imageWidth={142}
              imageHeight={95}
              ratio={142 / 95}
              objectFit="cover"
            />
          </Box>
        </Box>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <ProductItemName item={lineItem} />
          {variantOptionValues.map((optionValue) => (
            <Typography key={optionValue.name} level="caption1">
              {optionValue.presentation}
            </Typography>
          ))}

          <Typography level="caption2" sx={{ mt: 2 }}>
            Quantity: {quantity}
          </Typography>
        </Stack>
      </Box>
      {/* // todo: add bundle line items */}
      {isBundleItem &&
        bundleLineItems?.map((bundleItem: LineItemBundleLineItemSchema) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              columnGap: 4,
            }}
          >
            <Box sx={{ width: 160 }}>
              <Box sx={{ width: 142, mx: 'auto' }}>
                <FortressImage
                  src={bundleItem.variant.images[0]?.links.feed}
                  alt={title}
                  imageWidth={142}
                  imageHeight={95}
                  ratio={142 / 95}
                  objectFit="cover"
                />
              </Box>
            </Box>
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <Typography level="body1">
                {bundleItem.quantity}x {bundleItem.variant.productName}
              </Typography>
              <Typography level="caption1">{bundleItem.bundleOption.presentation}</Typography>
            </Stack>
          </Box>
        ))}
    </Box>
  );
}

export default ListProductItem;
