import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { defaultImage } from 'utils/image';
import {
  updateSelectedVariants,
  updateBundleProduct,
  updateBundleSelected,
  updateBundleVariant,
} from 'redux/modules/productOptions';
import { useCurrentProduct, useCurrentSelectedVariants, useProductOptions } from './product';

const useUpdateSelectVariant = () => {
  const dispatch = useDispatch();
  const { selectedVariants } = useProductOptions();
  return useCallback(
    (id, variant) => {
      const newSelectedVariants = {
        ...selectedVariants,
        [id]: variant.id,
      };

      dispatch(updateSelectedVariants(newSelectedVariants));
    },
    [dispatch, selectedVariants]
  );
};

const useBundle = () => {
  const product = useCurrentProduct();
  const selectedVariants = useCurrentSelectedVariants();

  const bundleProductVariant = useMemo(() => {
    if (product.product_type === 'bundle') {
      return product.bundle_options.map((option) => {
        const selected = selectedVariants[option.id];
        const temp = {};
        temp.src = defaultImage(100);
        temp.id = option.id;
        temp.product = option;
        if (selected) {
          const preName = option.default_quantity > 1 ? `${option.default_quantity} x ` : '';
          temp.variant = selected;
          temp.variantName = preName + selected.product_name;
          temp.variantInfo = selected.variant_option_values?.map((v) => v.presentation)?.join(', ');
          temp.src = selected.images?.length > 0 ? selected.images[0].links.large : temp.src;
          temp.alt = selected.name;
        }
        temp.loader = { ratio: 0.46 };
        return temp;
      });
    }
    return [];
  }, [product, selectedVariants]);

  return bundleProductVariant;
};

const useBundleVariant = (bundleVariant, bundleProduct) => {
  const dispatch = useDispatch();
  const reduxBundleProductRef = useRef();
  const { init, bundleProduct: reduxBundleProduct, bundleVariant: reduxBundleVariant } = useProductOptions();

  reduxBundleProductRef.current = reduxBundleProduct;

  // init current bundle product and clear last bundleVariant
  useEffect(() => {
    const { current: currentReduxBundleProduct } = reduxBundleProductRef;
    if (bundleProduct.id !== currentReduxBundleProduct.id) {
      dispatch(updateBundleProduct(bundleProduct));
    }
  }, [dispatch, bundleProduct]);

  // init new default bundleSelected for new bundleProduct
  useEffect(() => {
    if (init && bundleProduct.option_types) {
      dispatch(
        updateBundleSelected(
          bundleVariant.variant_option_values.reduce((s, o) => {
            s[o.option_type_id] = bundleProduct.option_types
              .find((t) => t.id === o.option_type_id)
              ?.values.find((v) => v.id === o.option_value_id);
            return s;
          }, {})
        )
      );
    }
  }, [bundleVariant, dispatch, bundleProduct, init]);

  // use current variant for redux bundlevariant
  useEffect(() => {
    if (init) {
      dispatch(updateBundleVariant(bundleVariant));
    }
  }, [bundleVariant, dispatch, init]);

  // clear current bundleProduct
  useEffect(() => () => dispatch(updateBundleProduct({})), [dispatch]);

  return {
    bundleVariant: reduxBundleVariant,
  };
};

export { useBundle, useBundleVariant, useUpdateSelectVariant };
