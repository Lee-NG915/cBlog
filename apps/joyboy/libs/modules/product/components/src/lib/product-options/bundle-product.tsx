'use client';
import * as React from 'react';
import { BundleVariants, changeBundleVariants, Product } from '@castlery/modules-product-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useSearchParams } from 'next/navigation';
import { BundleOptions } from './bundle-options';

/* eslint-disable-next-line */
export interface BundleProductProps {}

export const BundleProduct = ({ productData }: { productData: Product }) => {
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams);
  const bundle_options = productData.bundle_options || [];
  const dispatch = useAppDispatch();

  const [bundleVariants, setBundleVariants] = React.useState<BundleVariants>({
    variant_id: productData.variants[0].id,
    bundle_options: bundle_options.map((bundle_option) => {
      const variantId = +query[bundle_option.name];
      const matchedVariant = bundle_option.variants.find((v) => v.id === variantId);
      return {
        bundle_option_id: bundle_option.id + '',
        bundle_option_variant_id: matchedVariant ? matchedVariant.id : bundle_option.variants[0].id,
      };
    }),
    sku: productData.variants[0].sku,
  });

  React.useEffect(() => {
    dispatch(changeBundleVariants(bundleVariants));
  }, [bundleVariants, dispatch]);

  return bundle_options.map((bundle_option) => {
    const defaultVariant =
      bundle_option.variants.find(
        (v) =>
          v.id ===
          bundleVariants.bundle_options.find((b) => b.bundle_option_id === bundle_option.id + '')
            ?.bundle_option_variant_id
      ) || bundle_option.variants[0];
    return (
      <BundleOptions
        bundle_option={bundle_option}
        key={bundle_option.id}
        defaultVariant={defaultVariant}
        onBundleOptionChange={(bundleOption) => {
          console.log('bundle confirm button click');
          setBundleVariants((prev) => {
            const newBundleOptions = prev.bundle_options.map((option) => {
              if (option.bundle_option_id === bundleOption.bundle_option_id) {
                return bundleOption;
              }
              return option;
            });
            return {
              ...prev,
              bundle_options: newBundleOptions,
            };
          });
        }}
      />
    );
  });
};
