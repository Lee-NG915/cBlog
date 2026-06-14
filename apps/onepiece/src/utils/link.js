import { getUrl } from 'pages';

export function getProductLink(slug) {
  return `${getUrl('product')}/${slug}`;
}

// return the link for a variant object
export function getVariantLink(variant, productSlug) {
  let link = getProductLink(productSlug || variant.product_slug);
  if (!link) {
    return null;
  }

  if (variant.variant_option_values !== undefined) {
    const variantQueryArr = variant.variant_option_values.map((option) => `${option.option_type_name}=${option.name}`);

    const query = variantQueryArr.join('&');

    if (query) {
      link += `?${query}`;
    }
  }

  return link;
}

export function getLineItemLink(item) {
  // get the hyperlink based on taxon
  let link = getVariantLink(item.variant);

  if (link && item.product_type === 'bundle') {
    const queryArr = item.bundle_line_items
      .filter((i) => i.variant)
      .map((i) => `${i.bundle_option.name}=${i.variant.id}`);

    const query = queryArr.join('&');

    link = `${link}?${query}`;
  }

  return link;
}

export function getVariantLinkObj(variant, productSlug) {
  const pathname = getProductLink(productSlug || variant.product_slug);
  const linkObj = {};
  if (!pathname) {
    return null;
  }
  linkObj.pathname = pathname;

  if (variant.variant_option_values !== undefined) {
    const variantQueryArr = variant.variant_option_values.map((option) => `${option.option_type_name}=${option.name}`);

    const query = variantQueryArr.join('&');

    if (query) {
      linkObj.search = `?${query}`;
    }
  }

  return linkObj;
}

export function getLinkWithQuery(baseUrl, query) {
  const queries = Object.keys(query).reduce(
    (acc, curr, index) => `${acc}${index ? '&' : ''}${curr}=${query[curr]}`,
    ''
  );

  if (getUrl(baseUrl)) {
    if (typeof query !== 'object') {
      return getUrl(baseUrl);
    }
    return `${getUrl(baseUrl)}?${queries}`;
  }

  if (baseUrl.includes('/')) {
    return `${baseUrl}?${queries}`;
  }
}
