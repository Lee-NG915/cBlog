'use client';
import { useMemo } from 'react';
import { Box, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { ProductTitle } from './product-title/product-title';
import { ProductSpecification } from './product-specification/product-specification';
import { ProductImage } from './product-image/product-image';
import { ProductBundleImage } from './product-bundle-image/product-bundle-image';
import { ProductBundleSpecification } from './product-bundle-specification/product-bundle-specification';
import { WarrantyOptionPresentation } from './warranty-option/warranty-option-presentation';
import { ProductPriceQtyRaw } from './product-price-qty-raw/product-price-qty-raw';
import { OrderHistoryItem } from '@castlery/modules-order-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { toPrice } from '@castlery/utils';
import { EcEnv, basePageConfig } from '@castlery/config';
import { useLineItemLink } from '../../hooks/useLineItemLink';

interface ProductLineItemInfoProps {
  item: OrderHistoryItem;
  showClearance?: boolean;
  showCustomized?: boolean;
  showWarranty?: boolean;
}
export function ProductLineItemInfo({
  item,
  showClearance = true,
  showCustomized = true,
  showWarranty = true,
}: ProductLineItemInfoProps) {
  const { desktop } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_PRODUCT, {
    keyPrefix: 'productLineItemInfo',
  });
  const isBundleItem = Array.isArray(item.bundleLineItems) && item.bundleLineItems.length > 0;

  const customizedUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['sales-and-refunds']}`;
  const productUrl = useLineItemLink(item);

  const price = useMemo(() => {
    return item.isGift
      ? toPrice(0, true)
      : toPrice((+item.amount + (+item.manual_discount_total || 0)) / item.quantity, true);
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
        <Stack component="a" href={productUrl} target="_blank">
          <ProductImage src={item.variant.images[0]?.links?.feed} alt={item.variant.name} />
        </Stack>
        <Stack gap={2}>
          <ProductTitle item={item} />
          <ProductSpecification variantOptionValues={item.variant.variantOptionValues} />
          {!desktop && <ProductPriceQtyRaw price={price as string} qty={item.quantity} />}
          {!isBundleItem && !!item.warrantyItems && (
            <WarrantyOptionPresentation
              warrantyOfferPrice={item.warrantyItems.warrantyOfferPrice}
              durationMonths={item.warrantyItems.durationMonths}
            />
          )}
        </Stack>
      </Stack>
      {isBundleItem &&
        item.bundleLineItems.map((bundleItem) => (
          <Stack direction="row" gap={6}>
            <Stack>
              <ProductBundleImage src={bundleItem.variant?.images[0]?.links?.feed} alt={bundleItem.variant?.name} />
            </Stack>
            <Stack>
              <ProductBundleSpecification
                quantity={bundleItem.quantity}
                bundleVariantName={bundleItem.variant?.productName}
                variantOptionValues={bundleItem.variant?.variantOptionValues}
              />
              {showWarranty && !!item.warrantyItems && (
                <WarrantyOptionPresentation
                  warrantyOfferPrice={item.warrantyItems.warrantyOfferPrice}
                  durationMonths={item.warrantyItems.durationMonths}
                />
              )}
            </Stack>
          </Stack>
        ))}
      {((showClearance && item.variant.isClearance) || (showCustomized && item.variant.isCustomized)) && (
        <Box mt={4}>
          {showClearance && item.variant.isClearance && <Typography level="caption2">{t('clearanceTip')}</Typography>}
          {showCustomized && item.variant.isCustomized && (
            <Typography level="caption2">
              {t('customizedTip')}
              <Link href={customizedUrl} target="_blank" level="caption2" rel="noopener" endDecorator={<ArrowRight />}>
                {t('customizedCTA')}
              </Link>
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
