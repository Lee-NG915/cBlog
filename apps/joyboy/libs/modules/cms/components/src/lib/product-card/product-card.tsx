'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';
import { useGetProductCollectionsQuery } from '@castlery/modules-product-domain';
import { ProductCardStoryblok } from '@castlery/types';
import { ProductItem } from './product-item';

export interface Taxon {
  name: string;
  permalink: string;
  position: number;
  level: number;
  value: string;
  ancestors: string[];
}

export interface Category {
  name: string;
  permalink: string;
}

export interface Property {
  fabric_type: string;
  fabric_feature: string;
}

export interface Swatche {
  properties: Property;
}

export interface Image {
  mini: string;
  small: string;
  medium: string;
  large: string;
  mini_x2: string;
  small_x2: string;
  medium_x2: string;
  large_x2: string;
  mini_gray: string;
  small_gray: string;
  medium_gray: string;
  large_gray: string;
  mini_x2_gray: string;
  small_x2_gray: string;
  medium_x2_gray: string;
  large_x2_gray: string;
  feed: string;
  public: string;
}

export interface Life_style_image {
  mini: string;
  small: string;
  medium: string;
  large: string;
  mini_x2: string;
  small_x2: string;
  medium_x2: string;
  large_x2: string;
  mini_gray: string;
  small_gray: string;
  medium_gray: string;
  large_gray: string;
  mini_x2_gray: string;
  small_x2_gray: string;
  medium_x2_gray: string;
  large_x2_gray: string;
  feed: string;
  public: string;
}

export interface Orientation {
  value: string;
  presentation: string;
  image_src: string;
}

export interface Leg_color {
  value: string;
  presentation: string;
  image_src: string;
}

export interface Material {
  value: string;
  presentation: string;
  image_src: string;
}

export interface Option_value {
  orientation: Orientation;
  leg_color: Leg_color;
  material: Material;
}

export interface Property {
  packaging_dimensions: string;
  max_bearing_support: string;
  material_filter: string[];
  assembly_condition: string;
  overall_sit_rating: number;
  seat_depth_rating: number;
  seat_height_rating: number;
  seat_softness_rating: number;
  general_dimensions: string;
  length: number;
  product_weight: string;
}

export interface Variant {
  id: number;
  name: string;
  sku: string;
  color: string;
  lead_time: number;
  lead_time_presentation: string;
  in_stock_regions: any[];
  product_short_description: string;
  price: string;
  list_price: string;
  is_customized: boolean;
  available_quantity: number;
  tags: string[];
  badges: any[];
  images: Image[];
  life_style_image: Life_style_image;
  option_values: Option_value;
  properties: Property;
}

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  price: number;
  product_type: string;
  product_layout: string;
  rank: number;
  styles: any[];
  taxons: Taxon[];
  category_count: number;
  categories: Category[];
  images: any[];
  swatches: Swatche[];
  variants: Variant[];
}

interface ProductCardComponentProps {
  blok: ProductCardStoryblok;
  productInfo: ProductData;
}

const ProductCardComponent = ({ blok, productInfo }: ProductCardComponentProps) => {
  const [currentVariant, setCurrentVariant] = useState<Variant>();

  useEffect(() => {
    if (productInfo.variants.length > 0) {
      setCurrentVariant(productInfo.variants[0]);
    }
  }, [productInfo]);

  const strikeThroughPrice = useMemo(() => {
    if (currentVariant) {
      return currentVariant.price === currentVariant.list_price ? '' : currentVariant.list_price;
    }
    return '';
  }, [currentVariant]);

  const images = useMemo(() => {
    if (currentVariant) {
      return currentVariant.images;
    }
    return [];
  }, [currentVariant]);

  const lifestyle_images = useMemo(() => {
    if (currentVariant) {
      return [currentVariant.life_style_image];
    }
    return [];
  }, [currentVariant]);

  const colorOptions = useMemo(() => {
    if (productInfo.variants.length > 0) {
      const tempArr = productInfo.variants
        .map((v) => {
          const option = v.option_values.material || v.option_values.leg_color;
          if (option) {
            return {
              ...option,
              variantId: v.id,
            };
          }
          return null;
        })
        .filter(Boolean);
      const map = new Map();
      tempArr.forEach((item) => {
        if (!map.has(item.value)) {
          map.set(item.value, item);
        }
      });
      return Array.from(map.values());
    }
    return [];
  }, [productInfo]);

  const tag = useMemo(() => {
    if (currentVariant && currentVariant.badges.length > 0) {
      return currentVariant.badges[0];
    }
    return '';
  }, [currentVariant]);

  const productShortDescription = useMemo(() => {
    if (currentVariant) {
      return currentVariant.product_short_description;
    }
    return '';
  }, [currentVariant]);

  const selectedColor = useMemo(() => {
    if (currentVariant && colorOptions.length > 0) {
      return colorOptions.find((item) => item.variantId === currentVariant.id)?.value;
    }
    return '';
  }, [currentVariant, colorOptions]);

  const selectedLink = useMemo(() => {
    let baseLink = '';
    if (currentVariant) {
      baseLink = `${productInfo.slug}?`;
      const { option_values } = currentVariant;
      Object.keys(option_values).forEach((key, index) => {
        baseLink += `${key}=${option_values[key].value}${index < Object.keys(option_values).length - 1 ? '&' : ''}`;
      });
    }
    return baseLink;
  }, [currentVariant, productInfo]);

  const handleSwitchVariant = (variantId: number) => {
    const variant = productInfo.variants.find((item) => item.id === variantId);
    if (variant) {
      setCurrentVariant(variant);
    }
  };

  if (productInfo.variants.length > 0) {
    return (
      <DtStack useImpression uid={blok._uid} componentName="product-card" {...storyblokEditable(blok)}>
        <ProductItem
          name={productInfo.name}
          images={images}
          price={currentVariant?.price.toString() || ''}
          strikeThroughPrice={strikeThroughPrice}
          lifestyle_images={lifestyle_images}
          colorOptions={colorOptions}
          tag={tag}
          selectedColor={selectedColor}
          onSwitchVariant={handleSwitchVariant}
          productShortDescription={productShortDescription}
          link={selectedLink}
        />
      </DtStack>
    );
  }
  return null;
};

const ProductCard = ({ blok }: { blok: ProductCardStoryblok }) => {
  const { product_id } = blok || {};
  const collections = [Number(product_id)];
  const { products } = useGetProductCollectionsQuery(
    {
      collections,
    },
    {
      skip: !collections.length,
      selectFromResult: ({ data }) => ({
        products: data?.hits.hits.map((item) => item._source),
      }),
    }
  );

  const productInfo = products?.find((item) => Number(item.id) === Number(product_id));
  if (!productInfo) return;

  return <ProductCardComponent blok={blok} productInfo={productInfo} />;
};

export { ProductCard };
