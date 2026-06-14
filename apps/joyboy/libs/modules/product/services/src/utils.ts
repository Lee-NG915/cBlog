import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import {
  BundleOption,
  BundleVariants,
  Image,
  Product,
  ProductProperty,
  Variant,
  VariantProperty,
} from '@castlery/modules-product-domain';

export function getVariantLink(variant: any, productSlug?: string) {
  const slug = productSlug || variant?.product_slug;
  if (!slug) {
    return undefined;
  }

  let link = `/${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/products/${slug}`;
  if (!link) {
    return undefined;
  }

  if (variant?.variant_option_values !== undefined) {
    const variantQueryArr = variant.variant_option_values.map(
      (option: any) => `${option?.option_type_name}=${option?.name}`
    );

    const query = variantQueryArr.join('&');

    if (query) {
      link += `?${query}`;
    }
  }

  return link;
}

export const getBundleVariantLink = (
  variant: any,
  bundleVariant?: BundleVariants,
  bundleOptions?: BundleOption[],
  productSlug?: string
) => {
  const slug = productSlug || variant?.product_slug;
  if (!slug) {
    return undefined;
  }

  let link = `/${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/products/${slug}`;
  if (!link) {
    return undefined;
  }
  const query = bundleOptions
    ?.map((option) => {
      const matchedVariant = bundleVariant?.bundle_options.find(
        (bundleOption) => bundleOption?.bundle_option_id === `${option.id}`
      );
      if (matchedVariant) {
        return `${option.name}=${matchedVariant.bundle_option_variant_id}`;
      }
      return '';
    })
    ?.filter((i) => i !== '')
    .join('&');

  if (query) {
    link += `?${query}`;
  }
  return link;
};

export const getVariantCodes = (
  product: Product | undefined,
  variant: Variant | undefined,
  bundleVariant: BundleVariants | undefined
) => {
  const result = {
    variantCode: '',
    bundleVariantCodes: '',
  };

  if (variant?.sku) {
    result.variantCode = variant.sku;
  }

  if (product?.product_type === 'bundle' && product?.bundle_options?.length && bundleVariant?.bundle_options?.length) {
    const bundleCodes = product.bundle_options
      .map((item) => {
        if (!item?.id || !item.variants?.length) return '';

        const currentOption = bundleVariant.bundle_options.find(
          (bundleOption) => bundleOption?.bundle_option_id === `${item.id}`
        );

        if (!currentOption?.bundle_option_variant_id) return '';

        const matchedVariant = item.variants.find((v) => v?.id === currentOption.bundle_option_variant_id);
        return matchedVariant?.sku || '';
      })
      .filter(Boolean);

    result.bundleVariantCodes = bundleCodes.join(',');
  }

  return result;
};

/**
 * 定义集合匹配规则的接口
 */
export interface CollectionRule {
  /** 集合名称 */
  collection: string;
  /** 匹配条件 */
  condition: boolean;
}

/**
 * 根据产品名称查找对应的集合名称
 * @param productName - 产品名称
 * @returns 匹配的集合名称，如果没有匹配则返回 undefined
 */
export const findCollectionFromProductName = (productName: string): string | undefined => {
  const lowerCaseName = productName?.toLowerCase();

  const collectionAction: CollectionRule[] = [
    {
      collection: 'amber',
      condition: lowerCaseName?.startsWith('amber'),
    },
    {
      collection: 'lily',
      condition: lowerCaseName?.startsWith('lily sideboard') || lowerCaseName?.startsWith('lily-sideboard'),
    },
  ];

  for (const action of collectionAction) {
    // get meet the conditions collection
    if (action.condition) return action.collection;
  }

  return undefined;
};

/**
 * 合并并排序两个数组
 * @param array1 - 第一个数组
 * @param array2 - 第二个数组
 * @returns 合并并排序后的数组
 */
export const mergeAndSortArrays = (array1: Image[], array2: Image[]) => {
  if (array1?.length === 0) return array2;
  if (array2?.length === 0) return array1;
  const mergedArray = array1.concat(array2);
  mergedArray.sort((a, b) => a.position - b.position);
  return mergedArray;
};

export const combineProperties = (
  pArr1: ProductProperty[] | VariantProperty[] | null | undefined,
  pArr2: ProductProperty[] | VariantProperty[] | null | undefined
): ProductProperty[] | VariantProperty[] => {
  if (!pArr1 || !pArr2) {
    return [];
  }

  const finalArr: ProductProperty[] | VariantProperty[] = pArr1.slice();

  pArr2.forEach((p: ProductProperty | VariantProperty) => {
    const index = finalArr.findIndex((_p) => _p.name === p.name);
    if (index > -1) {
      finalArr.splice(index, 1, p);
    } else {
      finalArr.push(p);
    }
  });

  return finalArr;
};

/**
 * 将 selected 对象转为字符串，格式如 key:id;key:id
 * @param selected 选中的属性对象
 * @returns 属性字符串
 */
export function selectedObjToStr(selected: Record<string, { id: string | number }>): string {
  return Object.entries(selected)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0])) // 数字排序
    .map(([key, { id }]) => `${key}:${id}`)
    .join(';');
}

interface GetBundleVariantParams {
  productData?: Product;
  query: Record<string, string>;
}

export const getBundleVariant = ({ productData, query }: GetBundleVariantParams): BundleVariants | undefined => {
  if (productData?.product_type !== 'bundle') {
    return undefined;
  }

  return {
    variant_id: productData.variants[0].id,
    bundle_options:
      productData?.bundle_options?.map((bundle_option) => {
        const variantId = +query[bundle_option.name];
        const matchedVariant = bundle_option?.variants?.find((v) => v?.id === variantId);
        return {
          bundle_option_id: bundle_option?.id + '',
          bundle_option_variant_id: matchedVariant ? matchedVariant?.id : bundle_option?.variants[0]?.id,
        };
      }) || [],
    sku: productData?.variants[0]?.sku,
  };
};

/**
 * 视频类型常量
 */
export const videosOptionTypes = ['video', 'master_video', 'short_video'];

/**
 * 图片排序函数，防止视频在第一个位置
 * @param images - 图片数组
 * @returns 排序后的图片数组
 */
export const handleImagesSort = (images: any[]) => {
  try {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return images || [];
    }

    const first = images[0];
    if (first?.type && videosOptionTypes.includes(first.type)) {
      const notVideoFirstItemIndex = images.findIndex((item) => item?.type && !videosOptionTypes.includes(item.type));

      if (notVideoFirstItemIndex !== -1) {
        const splicedItem = images.splice(notVideoFirstItemIndex, 1)?.[0];
        if (splicedItem) {
          images.unshift(splicedItem);
        }
      }
    }
  } catch (error) {
    logger.error('Error sorting images in gallery', { error });
  }
  return images;
};
