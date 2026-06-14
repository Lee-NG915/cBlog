import React from 'react';
import { Hit as ESHit } from 'instantsearch.js';
import { EcEnv } from '@castlery/config';
import { ProductCard, ProductData, ProductVariant, ProductOption } from '@castlery/shared-components';

// ElasticSearch/Algolia 搜索结果类型
type SearchOptionValue = {
  value: string;
  presentation: string;
  image_src?: string;
};

type SearchProduct = {
  id: number;
  sku: string;
  name: string;
  price: string;
  list_price?: string;
  badges?: string[];
  tags?: string[];
  taxons?: { name: string; permalink: string; level: number; ancestors?: string[] }[];
  images?: Array<{ large: string }>;
  life_style_image?: { large: string };
  option_values?: {
    material?: SearchOptionValue;
    color_option?: SearchOptionValue;
    wood?: SearchOptionValue;
    leg_color?: SearchOptionValue;
    frame?: SearchOptionValue;
    length?: SearchOptionValue;
  };
  color?: string;
  product_short_description?: string;
  available_quantity?: number;
  lead_time?: number;
  lead_time_presentation?: string;
};

export type WebProductHit = ESHit<{
  id: number;
  name: string;
  slug: string;
  product_type?: string;
  variants: SearchProduct[];
  colorVariantsLength?: number;
  lengthVariantsLength?: number;
  colorOptionLimit?: number;
  taxons?: { name: string; permalink: string; level: number; ancestors?: string[] }[];
}>;

// 数据转换函数
const convertSearchOptionToProductOption = (searchOption?: SearchOptionValue): ProductOption | undefined => {
  if (!searchOption) return undefined;
  return {
    value: searchOption.value,
    presentation: searchOption.presentation,
    image_src: searchOption.image_src,
  };
};

const convertSearchProductToProductVariant = (searchProduct: SearchProduct): ProductVariant => {
  return {
    id: searchProduct.id,
    sku: searchProduct.sku,
    name: searchProduct.name,
    price: searchProduct.price,
    list_price: searchProduct.list_price,
    color: searchProduct.color,
    lead_time: searchProduct.lead_time,
    lead_time_presentation: searchProduct.lead_time_presentation,
    product_short_description: searchProduct.product_short_description,
    available_quantity: searchProduct.available_quantity,
    badges: searchProduct.badges,
    tags: searchProduct.tags,
    images: searchProduct.images,
    life_style_image: searchProduct.life_style_image,
    option_values: searchProduct.option_values,
  };
};

const convertSearchHitToProductData = (hit: WebProductHit): ProductData => {
  return {
    id: hit.id,
    name: hit.name,
    slug: hit.slug,
    product_type: hit.product_type,
    taxons: hit.taxons,
    variants: hit.variants?.map(convertSearchProductToProductVariant) || [],
    colorVariantsLength: hit.colorVariantsLength,
    lengthVariantsLength: hit.lengthVariantsLength,
    colorOptionLimit: hit.colorOptionLimit,
  };
};

// 搜索专用的链接生成函数
const getSearchProductLink = (slug: string, variant?: ProductVariant) => {
  const baseLink = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/products/${slug}`;
  if (!variant?.option_values) return baseLink;

  const options = variant.option_values;
  const queryParams = Object.keys(options)
    .map((key) => {
      const optionValue = options[key as keyof typeof options];
      return optionValue?.value ? `${key}=${optionValue.value}` : null;
    })
    .filter(Boolean) // 过滤掉 null 和空字符串
    .join('&');

  return queryParams ? `${baseLink}?${queryParams}` : baseLink;
};

// 搜索专用的价格格式化函数
const formatSearchPrice = (price: string, includeSymbol = false) => {
  if (!price) return '';
  const numPrice = parseFloat(price);
  return numPrice % 1 === 0 ? `${numPrice}.0` : numPrice.toString();
};

export interface CustomHitProps {
  /** 搜索结果数据 */
  hit: WebProductHit;
  /** 强制显示 hover 状态（用于 Storybook 展示） */
  forceHover?: boolean;
  /** 点击产品时的回调 */
  onProductClick?: (product: ProductData, variant: ProductVariant) => void;
  /** 点击变体选项时的回调 */
  onVariantSelect?: (variantIndex: number) => void;
  /** 点击收藏按钮时的回调 */
  onFavoriteClick?: (product: ProductData, variant: ProductVariant) => void;
}

/**
 * 搜索结果产品卡片组件 - CustomHit 作为适配器
 *
 * 这个组件是 ProductCard 的搜索专用适配器，负责：
 * 1. 将搜索结果数据转换为通用的产品数据格式
 * 2. 提供搜索专用的链接生成和价格格式化
 * 3. 保持与搜索系统的兼容性
 *
 * 设计理念：
 * - 解耦搜索逻辑和展示逻辑
 * - 使 ProductCard 可以被其他数据源复用
 * - 保持向后兼容性
 */
export function CustomHit({
  hit,
  forceHover = false,
  onProductClick,
  onVariantSelect,
  onFavoriteClick,
}: CustomHitProps) {
  // 将搜索结果转换为通用产品数据
  const productData = convertSearchHitToProductData(hit);

  return (
    <ProductCard
      product={productData}
      forceHover={forceHover}
      onProductClick={onProductClick}
      onVariantSelect={onVariantSelect}
      onFavoriteClick={onFavoriteClick}
      isShowWishlistBtn={EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB'}
      hitIndex={hit.__position}
    />
  );
}
