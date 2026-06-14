'use client';
import { Box, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { ProductTitleV1 } from './product-title/product-title-v1';
import { ProductImage } from './product-image/product-image';
import { ProductBundleImage } from './product-bundle-image/product-bundle-image';
import { ProductPriceQtyRawV1 } from './product-price-qty-raw/product-price-qty-raw-v1';
import { OrderLineItemV1, LineItemBundleLineItemSchema, VariantOptionValuesV1 } from '@castlery/types';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { EcEnv, basePageConfig, accessInPos } from '@castlery/config';
import { WarrantyOptionPresentationV1 } from './warranty-option/warranty-option-presentation-v1';
import { ProductBundleSpecificationV1 } from './product-bundle-specification/product-bundle-specification-v1';
import { ProductSpecificationV1 } from './product-specification/product-specification-v1';
import { useMemo } from 'react';
import { toPrice } from '@castlery/utils';

interface ProductLineItemV1InfoProps {
  item: OrderLineItemV1;
}
export function ProductLineItemInfoV1({ item }: ProductLineItemV1InfoProps) {
  const { desktop } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_PRODUCT, {
    keyPrefix: 'productLineItemInfo',
  });
  const bundleLineItems: LineItemBundleLineItemSchema[] = item.bundleLineItems ?? [];
  const isBundleItem = bundleLineItems.length > 0;

  const customizedUrl = `https://www.castlery.com/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${
    basePageConfig['sales-and-refunds']
  }`;

  const hasWarranty = Boolean(item.warrantyItem?.warrantyOfferId);
  const isClearance = item.tags?.some((tag) => tag.name === 'clearance');
  const isSwatch = item.productType === 'swatch';

  const price = useMemo(() => {
    return item.isGift ? toPrice(0, true) : toPrice(+item.displayPrice, true);
  }, [item]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack direction="row" gap={6}>
        <Stack
          component={isSwatch || accessInPos ? 'div' : 'a'}
          href={isSwatch || accessInPos ? undefined : item?.onepieceProductPageUrl ?? '#'}
          target={isSwatch || accessInPos ? undefined : '_blank'}
        >
          <ProductImage src={item?.images?.[0]?.links?.mini ?? ''} alt={item.listName ?? ''} />
        </Stack>
        <Stack gap={2}>
          <ProductTitleV1 item={item} />
          <ProductSpecificationV1 variantOptionValues={item?.variantOptionValues} />
          {!desktop && <ProductPriceQtyRawV1 price={price as string} qty={item.quantity} />}
          {hasWarranty && <WarrantyOptionPresentationV1 warrantyItem={item.warrantyItem} />}
        </Stack>
      </Stack>
      {isBundleItem &&
        bundleLineItems.map((bundleItem, index) => {
          const bundleImage = bundleItem.variant?.images?.[0]?.links?.feed ?? '';
          const bundleName = bundleItem.variant?.name ?? '';
          const bundleVariantName = bundleItem.variant?.productName ?? bundleName;

          return (
            <Stack key={`${bundleVariantName}-${bundleItem.quantity}`} direction="row" gap={6}>
              <Stack>
                <ProductBundleImage src={bundleImage} alt={bundleName} />
              </Stack>
              <Stack>
                <ProductBundleSpecificationV1
                  quantity={bundleItem.quantity}
                  bundleVariantName={bundleVariantName}
                  variantOptionValues={bundleItem.variant?.variantOptionValues as VariantOptionValuesV1[]}
                />
                {/* {hasWarranty && index === 0 && (
                  <WarrantyOptionPresentationV1
                    warrantyOfferPrice={item.warrantyItem?.warrantyOfferPrice ?? ''}
                    durationMonths={item.warrantyItem?.durationMonths ?? ''}
                  />
                )} */}
              </Stack>
            </Stack>
          );
        })}
      {isClearance ? (
        <Typography level="caption2">{(t as any)('clearanceTip')}</Typography>
      ) : (
        <>
          {item?.isCustomized && (
            <Typography level="caption2">
              {(t as any)('customizedTip')}
              <Link href={customizedUrl} target="_blank" level="caption2" rel="noopener" endDecorator={<ArrowRight />}>
                {(t as any)('customizedCTA')}
              </Link>
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
