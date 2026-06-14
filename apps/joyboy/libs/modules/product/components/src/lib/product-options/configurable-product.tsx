import { changeVariant, Product } from '@castlery/modules-product-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { VariantSelector } from '../variant-selector/variant-selector';
/* eslint-disable-next-line */
export interface ConfigurableProductProps {}

export const ConfigurableProduct = ({ productData }: { productData: Product }) => {
  const dispatch = useAppDispatch();
  const defaultVariant = productData.variants[0];
  // useMount(() => {
  //   dispatch(changeVariant(defaultVariant));
  // });
  if (productData.customizations.length === 0) return null;
  return (
    <VariantSelector
      options={productData.option_types}
      defaultVariant={defaultVariant}
      customizations={productData.customizations}
      onVariantChange={(variant) => {
        dispatch(changeVariant(variant));
      }}
    />
  );
};
