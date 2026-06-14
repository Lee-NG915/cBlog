'use client';
import { type LineItem_V2, type Variant_V2, OrderLineItemV1 } from '@castlery/types';
import { ProductTypeMapping, basePageConfig, EcEnv } from '@castlery/config';

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
  const country = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  let link = getVariantLink(item.variant);

  if (link && item.productType === ProductTypeMapping.BUNDLE) {
    const queryArr = item.bundleLineItems
      ?.filter((i) => i.variant)
      .map((i) => `${i.bundleOption.bundleOptionName ?? ''}=${i.variant.id}`);
    const query = queryArr?.join('&');
    link = `${link}?${query}`;
  }

  return `/${country}${link}`;
}

export function getV1OrderLineItemLink(orderLineItem: OrderLineItemV1) {
  let link = getProductLink(orderLineItem.productSlug);
  if (!link) {
    return null;
  }

  if (Array.isArray(orderLineItem.variantOptionValues) && orderLineItem.variantOptionValues.length > 0) {
    const variantQueryArr = orderLineItem.variantOptionValues.map(
      (option) => `${option.optionTypeName}=${option.name}`
    );

    const query = variantQueryArr.join('&');

    if (query) {
      link += `?${query}`;
    }
  }

  return link;
}

export function useOrderHistoryLineItemLink(item: OrderLineItemV1) {
  const country = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  let link = getV1OrderLineItemLink(item);

  if (link && item?.productType === ProductTypeMapping.BUNDLE) {
    const queryArr = item.bundleLineItems
      ?.filter((i) => i.variant)
      .map((i) => `${i.bundleOption.bundleOptionType ?? ''}=${i.variant.id}`);
    const query = queryArr?.join('&');
    link = `${link}?${query}`;
  }

  return `/${country}${link}`;
}
