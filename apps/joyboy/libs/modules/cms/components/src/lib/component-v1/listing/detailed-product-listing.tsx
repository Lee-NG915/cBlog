'use client';
import { storyblokEditable } from '@storyblok/react/rsc';
import { ProductItem } from '@castlery/modules-product-components';
import { DtStack } from '@castlery/modules-tracking-components';
import { useGetProductCollectionsQuery } from '@castlery/modules-product-domain';
import { DetailedProductListingStoryblok } from '@castlery/modules-cms-services';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCMSProductList } from '@castlery/modules-cms-domain';
import React, { useState, useEffect } from 'react';
import { EcEnv } from '@castlery/config';

type DetailedProductListingProps = {
  blok: DetailedProductListingStoryblok;
};

type DetailedProductComponentProps = {
  blok: DetailedProductListingStoryblok;
  productInfo: {
    price: number;
    name: string;
  };
};

const getTopUniqueValues = (arr, limit = 3) => {
  const uniqueValues = new Map();

  for (const item of arr) {
    if (!uniqueValues.has(item.value)) {
      uniqueValues.set(item.value, item);
    }
  }

  return Array.from(uniqueValues.values());
};

export const DetailedProductComponent = ({ blok, productInfo }: DetailedProductComponentProps) => {
  const [selectedVariant, setSelectedVariant] = useState();
  const [selectedColor, setSelectedColor] = useState('');
  const [variantLink, setVariantLink] = useState('');
  const [filteredColorOptions, setFilteredColorOptions] = useState();

  useEffect(() => {
    if (productInfo) {
      setSelectedVariant(productInfo.variants[0]);
      const colorOptions = productInfo.variants
        .map((v) => v.option_values.material || v.option_values.color_option || v.option_values.wood)
        .filter(Boolean);
      setFilteredColorOptions(getTopUniqueValues(colorOptions));
    }
  }, [productInfo]);

  useEffect(() => {
    if (filteredColorOptions?.length > 0) {
      setSelectedColor(filteredColorOptions[0].value);
    }
  }, [filteredColorOptions]);

  useEffect(() => {
    if (selectedVariant && productInfo) {
      let baseLink = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${productInfo.slug}`;
      if (selectedVariant.sku === productInfo.variants[0].sku) {
        setVariantLink(baseLink);
      } else {
        baseLink = baseLink + '?';
        Object.keys(selectedVariant.option_values).forEach((key, index) => {
          baseLink =
            baseLink +
            `${key}=${selectedVariant.option_values[key].value}${
              index === Object.keys(selectedVariant.option_values).length - 1 ? '' : '&'
            }`;
        });
        setVariantLink(baseLink);
      }
    }
  }, [selectedVariant, productInfo]);

  if (!selectedVariant) {
    return null;
  }

  const strikeThroughPrice = selectedVariant.price === selectedVariant.list_price ? '' : selectedVariant.list_price;
  const images = selectedVariant.images;
  const lifestyle_images = selectedVariant.life_style_image || undefined;

  const handleSwitchVariant = (value: string) => {
    let hasFind = false;
    productInfo.variants.forEach((variant) => {
      if (
        (variant.option_values?.material?.value === value ||
          variant.option_values?.color_option?.value === value ||
          variant.option_values?.wood?.value === value) &&
        variant.available_quantity > 0 &&
        !hasFind
      ) {
        setSelectedVariant(variant);
        setSelectedColor(value);
        hasFind = true;
      }
    });
  };

  return (
    <DtStack
      {...storyblokEditable(blok)}
      useImpression
      uid={blok._uid}
      key={blok._uid}
      componentName="detailed-product-listing"
      direction="column"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        border: '1px solid transparent',
        transition: 'border-color 0.3s ease-in-out',
        '@media (hover: hover) ': {
          '&:hover': {
            borderColor: theme.palette.brand.wheat[500],
          },
        },
      })}
    >
      <ProductItem
        name={productInfo.name}
        description={selectedVariant.product_short_description}
        price={selectedVariant.price}
        strikeThroughPrice={strikeThroughPrice}
        images={images}
        lifestyle_images={[lifestyle_images]}
        fromStoryblok={true}
        colorOptions={filteredColorOptions}
        onSwitchVariant={handleSwitchVariant}
        selectedColor={selectedColor}
        link={variantLink}
      />
    </DtStack>
  );
};

function DetailedProductListing({ blok }: DetailedProductListingProps) {
  const { product_id } = blok || {};
  const products = useAppSelector(selectCMSProductList);
  const productInfo = products?.[product_id];
  if (!productInfo) return;

  return <DetailedProductComponent blok={blok} productInfo={productInfo} />;
}

export { DetailedProductListing };
