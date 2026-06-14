import { EcEnv } from '@castlery/config';
import { Product } from '@castlery/modules-product-domain';
import { getBundleVariantLink, getVariantLink } from '@castlery/modules-product-services';
import { logger } from '@castlery/observability';
import { Thing, WithContext } from '@castlery/seo';
import { generateRatingObject, generateReviewsArray } from '@castlery/seo';

export interface ProductBreadcrumb {
  name: string;
  url?: string;
}

export interface GenerateProductSchemaParams {
  product: Product;
  variant: any;
  bundleVariant?: any;
  numberVariantPrice: number;
  productBreadcrumbs: ProductBreadcrumb[];
  isOutOfStock: boolean;
  originUrl: string;
}

/**
 * 计算产品价格（纯函数，可在 server 和 client 中使用）
 */
export function calculateProductPrice(product: Product, variant: any, bundleVariant?: any): number {
  const minSaleQty = product?.min_sale_qty || 0;

  if (product?.product_type !== 'bundle') {
    return Number(variant?.price || 0) * minSaleQty;
  } else {
    if (product?.bundle_options && bundleVariant) {
      const { bundle_options } = bundleVariant;
      let tempPrice = Number(variant?.price) || 0;
      bundle_options?.forEach((item: any) => {
        product?.bundle_options?.forEach((option: any) => {
          if (item?.bundle_option_id === `${option.id}`) {
            option?.variants?.forEach((subVariant: any) => {
              if (subVariant?.id === item?.bundle_option_variant_id) {
                tempPrice += Number(subVariant.price_modifier || 0) * option?.default_quantity;
              }
            });
          }
        });
      });
      return tempPrice;
    }
    return 0;
  }
}

/**
 * 生成产品面包屑（纯函数，可在 server 和 client 中使用）
 */
export function generateProductBreadcrumbs(product: Product): ProductBreadcrumb[] {
  const productBreadcrumbs = product?.breadcrumbs?.filter((item) => item.level === 1 || item.level === 2);
  if (!productBreadcrumbs || productBreadcrumbs.length === 0) {
    return [];
  }
  return productBreadcrumbs.map((crumb) => ({
    name: crumb.name,
    url: crumb.permalink ? `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${crumb.permalink}` : undefined,
  }));
}

/**
 * 生成产品 URL（纯函数，可在 server 和 client 中使用）
 */
export function generateProductUrl(product: Product, variant: any, bundleVariant?: any): string {
  const origin = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}`;
  let path: string | undefined = '';
  if (product?.product_type === 'bundle') {
    path = getBundleVariantLink(variant, bundleVariant, product.bundle_options, product?.slug);
  } else {
    path = getVariantLink(variant, product?.slug);
  }
  return path ? `${origin}${path}` : origin;
}

/**
 * 生成产品 JSON-LD Schema（纯函数，可在 server 和 client 中使用）
 */
export function generateProductSchema(params: GenerateProductSchemaParams): WithContext<Thing>[] | null {
  const { product, variant, numberVariantPrice, productBreadcrumbs, isOutOfStock, originUrl } = params;

  if (!variant?.id || !product) {
    return null;
  }

  const breadcrumbSchema: WithContext<Thing> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement:
      productBreadcrumbs?.map((crumb: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@id': crumb.url || '',
          name: crumb.name,
        },
      })) || [],
  };

  const additionalPropertyName = [
    'general_dimensions',
    'seatable_width',
    'seating_depth',
    'seating_height',
    'frame',
    'cover_type',
  ];

  try {
    const image = variant?.images && variant.images.length > 0 ? variant.images[0]?.links?.large : '';

    const color =
      variant?.variant_option_values?.find((v: any) => v.option_type_name === 'material')?.presentation || '';

    let category = undefined;

    if (product.taxons && product.taxons.length > 0) {
      let haveSecondCategory = false;
      product.taxons.forEach((taxon) => {
        if (taxon.level === 1 && taxon.ancestors.includes('Category') && !haveSecondCategory) {
          category = taxon.name;
        }
        if (taxon.level === 2 && taxon.ancestors.includes('Category')) {
          category = taxon.name;
          haveSecondCategory = true;
        }
      });
    }

    let material = undefined;
    if (variant?.variant_option_values?.find((v: any) => v.option_type_name === 'material')) {
      material = variant?.variant_option_values?.find((v: any) => v.option_type_name === 'material')?.presentation;
    }

    let additionalProperty = undefined;
    if (product.product_properties) {
      additionalProperty = [];
      Object.entries(product.product_properties).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v: any) => {
            if (additionalPropertyName.includes(v.name)) {
              additionalProperty.push({
                '@type': 'PropertyValue',
                name: v.presentation,
                value: v.value,
              });
            }
          });
        }
      });
    }

    const productSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${
        product.slug
      }`,
      sku: variant.sku || '',
      name: product.name || '',
      productGroupID: product.id || '',
      description: product.description || '',
      itemCondition: 'https://schema.org/NewCondition',
      brand: {
        '@type': 'Brand',
        name: 'Castlery',
        url: `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
      },
      category: category,
      material: material,
      offers: {
        '@type': 'Offer',
        sku: variant.sku || '',
        priceCurrency: EcEnv.NEXT_PUBLIC_CURRENCY,
        price: numberVariantPrice || 0,
        url: originUrl || '/',
        availability: `https://schema.org/${isOutOfStock ? 'OutOfStock' : 'InStock'}`,
      },
      additionalProperty: additionalProperty,
    };

    const hasVariant =
      product.variant_summaries
        ?.map((variantSummary) => {
          const imageUrl = variantSummary.image_url || variantSummary.image;
          if (!variantSummary.sku || !imageUrl) {
            return null;
          }

          return {
            '@type': 'Product',
            sku: variantSummary.sku,
            image: imageUrl,
          };
        })
        .filter(Boolean) || [];

    if (hasVariant.length > 0) {
      productSchema.hasVariant = hasVariant;
    }

    if (image) {
      productSchema.image = image;
    }

    if (color) {
      productSchema.color = color;
    }

    const ratingObject = generateRatingObject(product);
    if (ratingObject) {
      productSchema.aggregateRating = ratingObject;
    }

    const reviewsArray = generateReviewsArray(product);
    if (reviewsArray) {
      productSchema.review = reviewsArray;
    }

    return [breadcrumbSchema, productSchema];
  } catch (error) {
    logger.error('Failed to generate product schema', {
      error,
      variantSku: variant?.sku,
      productSlug: product?.slug,
    });
    return [breadcrumbSchema];
  }
}
