'use client';
import { type LineItem_V2, type Variant_V2 } from '@castlery/types';
import { ProductTypeMapping, basePageConfig } from '@castlery/config';
import { useParams } from 'next/navigation';

export function getProductLink(slug: string) {
  return `${basePageConfig.product}/${slug}`;
}

export function getVariantLink(variant: Variant_V2) {
  let link = getProductLink(variant.productSlug);
  if (!link) {
    return null;
  }

  if (variant.variantOptionValues !== undefined) {
    const variantQueryArr = variant.variantOptionValues.map((option) => `${option.optionTypeName}=${option.name}`);

    const query = variantQueryArr.join('&');

    if (query) {
      link += `?${query}`;
    }
  }

  return link;
}

export function useLineItemLink(item: LineItem_V2) {
  const { region } = useParams();
  let link = getVariantLink(item.variant);

  if (link && item.productType === ProductTypeMapping.BUNDLE) {
    const queryArr = item.bundleLineItems
      ?.filter((i) => i.variant)
      .map((i) => `${i.bundleOption.bundleOptionName ?? ''}=${i.variant.id}`);
    const query = queryArr?.join('&');
    link = `${link}?${query}`;
  }

  return `/${region}${link}`;
}
