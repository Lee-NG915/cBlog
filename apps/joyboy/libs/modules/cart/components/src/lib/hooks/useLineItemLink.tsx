'use client';
import { type LineItemSchema, type LineItemVariantSchema } from '@castlery/types';
import { ProductTypeMapping, basePageConfig } from '@castlery/config';
import { useParams } from 'next/navigation';

export function getProductLink(slug: string) {
  return `${basePageConfig.product}/${slug}`;
}

export function getVariantLink(variant: LineItemVariantSchema) {
  if (!variant) {
    return '';
  }
  let link = getProductLink(variant.productSlug);
  if (!link) {
    return '';
  }

  if (variant.variantOptionValues !== undefined && Array.isArray(variant.variantOptionValues)) {
    const variantQueryArr = variant.variantOptionValues.map((option) => `${option.optionTypeName}=${option.name}`);

    const query = variantQueryArr.join('&');

    if (query) {
      link += `?${query}`;
    }
  }

  return link;
}

export function useLineItemLink(item: LineItemSchema) {
  const { region } = useParams();
  if (!item || !item.variant) {
    return '';
  }
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

// export function getLineItemLink(item) {
//     // get the hyperlink based on taxon
//     let link = getVariantLink(item.variant);
//     if (link && item.product_type === 'bundle') {
//       const queryArr = item.bundle_line_items
//         .filter((i) => i.variant)
//         .map((i) => `${i.bundle_option.name}=${i.variant.id}`);
//       const query = queryArr.join('&');
//       link = `${link}?${query}`;
//     }
//     return link;
//   }
