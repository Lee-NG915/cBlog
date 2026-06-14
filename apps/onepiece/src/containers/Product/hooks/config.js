/* eslint-disable camelcase */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ApiClient from 'helpers/ApiClient';
import { freeFabricEnabled } from 'config';
import { getProductLink } from 'utils/link';
import { add as addToCart, process as processCart } from 'redux/modules/cart';
import { loadIfNeeded as loadSwatches } from 'redux/modules/swatches';
import {
  updateVariant,
  updateSelected,
  updateCustomisable,
  updateBundleVariant,
  updateBundleSelected,
  updateBatchOfVariant,
  selectCurrentVariantIds,
  selectCurrentProduct,
} from 'redux/modules/productOptions';
import { fetchVariant, updateVariantPrice } from 'redux/modules/products';
import { EVENT_PDP_CONFIG } from 'utils/track/constants';
import { useCart } from './cart';
import { useCurrentProduct, useMobileFrame, useProductOptions } from './product';
import { selectedObjToStr, optionTypesStrToObj } from '../utils';

const useInitalOptionalVariants = (customisable, product) => {
  const initalOptionalVariantsRef = useRef();

  const initalVariant = useMemo(() => {
    const { customizations } = product;
    // if (customisable) {
    //   return customizations
    //     .filter(({ is_customized }) => is_customized)
    //     .map(({ option_types }) => optionTypesStrToObj(option_types));
    // }
    if (product.variants) {
      const { __isBundleProduct = false } = product;
      if (__isBundleProduct) {
        return product.variants
          .filter((v) => !v.is_customized)
          .map((v) =>
            v.variant_option_values.map((o) => ({
              option_type_id: o.option_type_id,
              option_value_id: o.option_value_id,
            }))
          );
      }
      // return customizations
      //   .filter(({ is_customized }) => !is_customized)
      //   .map(({ option_types }) => optionTypesStrToObj(option_types));
      return customizations.map(({ option_types }) => optionTypesStrToObj(option_types));
    }
    return [];
  }, [customisable, product]);

  initalOptionalVariantsRef.current = initalVariant;

  return { initalVariant, initalOptionalVariantsRef };
};

const useInitalOptions = (product) => {
  const [options, setOptions] = useState({});

  useEffect(() => {
    if (product.option_types) {
      setOptions(
        product.option_types.reduce(
          (result, o) => ({
            ...result,
            [o.id]: [],
          }),
          {}
        )
      );
    } else {
      setOptions((last) => (Object.keys(last).length === 0 ? last : {}));
    }
  }, [product]);

  return [options, setOptions];
};

const useModel = () => {
  const { customisable, init } = useProductOptions();
  const product = useCurrentProduct();

  const modal = useMemo(() => {
    if (product.related_products && product.related_products.length > 1) {
      return product.related_products.map((p) => ({
        selected: product.id === p.id,
        value: p.label,
        id: p.id,
        link: getProductLink(p.product_slug) + (customisable ? '?customisable=1' : ''),
      }));
    }
    return [];
  }, [product, customisable]);

  const label = useMemo(() => {
    if (init) {
      return product.related_products.find((p) => p.id === product.id)?.label;
    }
    return '';
    // FIXME product.related_products   product.id
  }, [product, init]);

  return { modal, label };
};

const INTERVALS_OF_PRICE = 10000;

// auto change variant(bundle) and variant price
const useUpdateVariant = () => {
  const firstLoad = useRef(true);
  const variantRef = useRef();
  const dispatch = useDispatch();
  const client = useMemo(() => new ApiClient(), []);
  const product = useCurrentProduct();
  const currentVariantIds = useSelector(selectCurrentVariantIds);

  const { selected, bundleInit, bundleVariant, bundleProduct, bundleSelected } = useProductOptions();

  variantRef.current = { bundleVariant };

  useEffect(() => {
    firstLoad.current = true;
  }, [bundleProduct]);

  // auto update variant price
  // FIXME It is better to call it once immediately and then every 10s
  // useEffect(() => {
  //   // https://beta.reactjs.org/learn/synchronizing-with-effects#fetching-data-fetching-data
  //   let ignore = false;
  //   const id = setInterval(() => {
  //     if (!ignore) {
  //       dispatch(updateVariantPrice());
  //     }
  //   }, INTERVALS_OF_PRICE);

  //   return () => {
  //     clearInterval(id);
  //     ignore = true;
  //   };
  // }, [currentVariantIds, dispatch]);

  // auto update variant batch
  useEffect(() => {
    const batchOfVariant = product.customizations.filter(
      ({ option_types }) => option_types === selectedObjToStr(selected)
    );

    dispatch(updateBatchOfVariant(batchOfVariant));
  }, [product, dispatch, selected]);

  // auto update variant for bundle
  useEffect(() => {
    if (bundleInit) {
      if (firstLoad.current && Object.keys(variantRef.current.bundleVariant).length) {
        firstLoad.current = false;
      } else {
        firstLoad.current = false;
        // try to get regular variant
        let variant = bundleProduct.variants.find((v) =>
          Object.keys(bundleSelected).every((key) => {
            const targetOption = v.variant_option_values.find((o = {}) => o.option_type_id === +key) || {};
            return bundleSelected[key] ? bundleSelected[key].id === targetOption.option_value_id : false;
          })
        );

        if (!variant) {
          variant = {
            variant_option_values: Object.keys(bundleSelected).map((key) => ({
              name: bundleSelected[key]?.name,
              option_type_id: +key,
              option_type_name: bundleProduct.option_types.find((o) => o.id === +key)?.name,
              option_type_presentation: bundleProduct.option_types.find((o) => o.id === +key)?.presentation,
              option_value_id: bundleSelected[key]?.id,
              presentation: bundleSelected[key]?.presentation,
            })),
          };

          // get customised variant
          client
            .post('/variant', {
              data: {
                product_id: bundleProduct.id,
                options: {
                  customizations: Object.keys(bundleSelected).map((key) => ({
                    option_id: +key,
                    value_id: bundleSelected[key]?.id,
                  })),
                },
              },
            })
            .then(
              (variantEstimate) => dispatch(updateBundleVariant(variantEstimate)),
              (err) =>
                console.error(
                  JSON.stringify(
                    {
                      message: 'Error updating bundle variant',
                      error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
                    },
                    null,
                    2
                  )
                )
            );
        } else {
          dispatch(updateBundleVariant(variant));
        }
      }
    }
  }, [bundleProduct, bundleSelected, bundleInit, dispatch, client]);
};

const useUpdateSelected = (props = {}) => {
  const { customisable = false, currentProduct, currentSelected, bundle } = props;

  const dispatch = useDispatch();

  const currentProductRef = useRef();

  const currentSelectedRef = useRef();

  currentProductRef.current = currentProduct;

  currentSelectedRef.current = currentSelected;

  const { initalOptionalVariantsRef } = useInitalOptionalVariants(customisable, currentProduct);
  // FIXME Optimization should be possible
  const currentUpdateSelected = useCallback(
    async (newSelected, { optionType, optionValue }) => {
      if (bundle) {
        dispatch(updateBundleSelected(newSelected));
      } else {
        const variant = await dispatch(
          fetchVariant({
            selected: newSelected,
            slug: currentProductRef.current.slug,
          })
        );

        dispatch({
          type: EVENT_PDP_CONFIG,
          result: {
            detailAction: optionType?.presentation?.toLowerCase(),
            label: optionValue?.presentation,
            skuId: variant?.sku,
            skuName: variant?.name,
          },
        });

        dispatch(updateSelected(newSelected));
        dispatch(updateVariant(variant));
      }
    },
    [bundle, dispatch]
  );

  return useCallback(
    (optionType, optionValue) => {
      const targetCurrentProduct = currentProductRef.current;
      const targetCurrentSelected = currentSelectedRef.current;

      const tempSelected = {
        ...targetCurrentSelected,
        [optionType.id]: optionValue,
      };

      let optionalVariants = initalOptionalVariantsRef.current;

      const optionTypes = Object.keys(tempSelected);

      for (let i = 0; i < optionTypes.length; i += 1) {
        const qualified = [];
        const optionTypeId = +optionTypes[i];

        for (const v of optionalVariants) {
          const selectedTemp = tempSelected;
          if (v.some((o) => o.option_type_id === optionTypeId && o.option_value_id === selectedTemp[optionTypeId].id)) {
            qualified.push(v);
          }
        }

        if (qualified.length > 0) {
          optionalVariants = qualified;
        } else {
          // choose the first remaining variant as the selected variant
          const selectedVariant = optionalVariants[0];
          const newSelected = selectedVariant.reduce(
            (result, o) => ({
              ...result,
              [o.option_type_id]: targetCurrentProduct.option_types
                .find((t) => t.id === o.option_type_id)
                .values.find((v) => v.id === o.option_value_id),
            }),
            {}
          );
          // break;
          currentUpdateSelected(newSelected, { optionType, optionValue });
          return;
        }
      }
      currentUpdateSelected(tempSelected, { optionType, optionValue });
    },
    [currentUpdateSelected, initalOptionalVariantsRef]
  );
};

const useOptions = (props = {}) => {
  const { init, currentProduct = {}, currentSelected = {}, customisable = false } = props;

  const [options, setOptions] = useInitalOptions(currentProduct);

  // use to narrow down the option values, use variants for non-customizable one
  const { initalOptionalVariantsRef: realOptionalVariantsRef } = useInitalOptionalVariants(
    customisable,
    currentProduct
  );

  useEffect(() => {
    if (init) {
      const nextOptions = {};
      // narrow down the options level by level to determine all option values available
      currentProduct.option_types?.reduce((optionalVariants, option) => {
        nextOptions[option.id] = [];

        const selectedId = currentSelected[option.id] && currentSelected[option.id].id;
        const qualified = [];

        // determine regular and customized of options
        optionalVariants.forEach((v) => {
          const targetOption = v.find((o) => o.option_type_id === option.id);
          if (targetOption) {
            const optionValue = option.values.find((o) => o.id === targetOption.option_value_id);
            // push to options if it's not pushed yet
            if (optionValue) {
              if (!nextOptions[option.id].find((o) => o.id === optionValue.id)) {
                nextOptions[option.id].push(optionValue);
                // TODO The option value can be sorted here in the future
                // nextOptions[option.id].sort((a, b) => a?.id - b?.id);
              }
              if (optionValue.id === selectedId) {
                qualified.push(v);
              }
            }
          }
        });
        return qualified;
      }, realOptionalVariantsRef.current);
      setOptions(nextOptions);
    }
  }, [init, setOptions, customisable, realOptionalVariantsRef, currentProduct, currentSelected]);

  return options;
};

const useConfigOptions = ({ bundle = false, customisable = false }) => {
  const product = useCurrentProduct();
  const { init, selected, bundleInit, bundleProduct, bundleSelected } = useProductOptions();

  const currentProduct = bundle ? bundleProduct : product;

  const currentSelected = bundle ? bundleSelected : selected;

  const targetInit = bundle ? bundleInit : init;

  const options = useOptions({
    init: targetInit,
    customisable,
    currentProduct,
    currentSelected,
  });

  const updateSelectedHandler = useUpdateSelected({
    bundle,
    customisable,
    currentProduct,
    currentSelected,
  });

  return useMemo(() => {
    if (targetInit) {
      const productOptions = currentProduct.option_types?.filter((option) => options[option.id]?.length > 0) || [];
      return productOptions.map((currentOption) => {
        const selectedOption = currentSelected[currentOption.id] || {};
        const allOptions = options[currentOption.id] || [];
        const data = allOptions.map((option) => {
          const customizations = currentProduct.customizations;
          let isCustomizedOptionType = false;
          let isStockAndCustomOptionType = false;
          const variantsWithIsCustomizedFlag = customizations?.map(({ option_types, is_customized }) => ({
            variantOptions: optionTypesStrToObj(option_types),
            is_customized,
          }));

          const currentVariantWithIsCustomizedFlag = variantsWithIsCustomizedFlag?.find((e) => {
            let totalCount = 0;
            for (let i = 0; i < e.variantOptions.length; i++) {
              let count = 0;
              // 筛选当前选中 variant 是否为 customization variant
              Object.entries(currentSelected).forEach(([key, value]) => {
                if (
                  +e.variantOptions[i].option_type_id === +key &&
                  +e.variantOptions[i].option_value_id === +value.id
                ) {
                  count++;
                }
              });
              totalCount += count;
            }
            if (totalCount === e.variantOptions.length) {
              return true;
            }
            return false;
          });

          const isOptionCurrentlySelected = currentVariantWithIsCustomizedFlag?.variantOptions.some(
            (e) => e.option_type_id === currentOption.id && e.option_value_id === option.id
          );
          if (isOptionCurrentlySelected) {
            isCustomizedOptionType = currentVariantWithIsCustomizedFlag.is_customized;
          }
          const variantsWithCustomizedOptionType = variantsWithIsCustomizedFlag?.filter((e) =>
            e.variantOptions.some((o) => o.option_type_id === currentOption.id && o.option_value_id === option.id)
          );

          if (variantsWithCustomizedOptionType?.length > 0) {
            const customizedVariants = variantsWithCustomizedOptionType?.filter((res) => res.is_customized);
            if (customizedVariants?.length > 0) {
              if (customizedVariants?.length !== variantsWithCustomizedOptionType?.length) {
                isStockAndCustomOptionType = true;
              } else if (customizedVariants?.length === variantsWithCustomizedOptionType?.length) {
                isCustomizedOptionType = true;
              }
            }
          }

          const clickHandler = () => {
            if (option.id !== selectedOption.id) {
              updateSelectedHandler(currentOption, option);
            }
          };
          return {
            id: option.id,
            name: option.name,
            value: option.presentation,
            src: option.image_url,
            collection: option.collection,
            selected: option.id === selectedOption.id,
            clickHandler,
            isCustomized: isCustomizedOptionType,
            // use for material
            isStockAndCustom: isStockAndCustomOptionType,
          };
        });

        return {
          customisable,
          optionName: currentOption.name,
          headName: currentOption.presentation,
          headValue: selectedOption.presentation || '',
          freeSwatch: currentProduct.show_free_swatch && freeFabricEnabled,
          defaultActive: selectedOption.presentation,
          data,
          currentData: data.find((option) => option.selected === true) || {},
          isBundle: bundle,
        };
      });
    }
    return [];
  }, [
    targetInit,
    currentProduct.option_types,
    currentProduct.show_free_swatch,
    currentProduct.customizations,
    options,
    currentSelected,
    customisable,
    bundle,
    updateSelectedHandler,
  ]);
};

const useSwatchCart = () => {
  const orderRef = useRef();
  const productRef = useRef();
  const dispatch = useDispatch();
  const { data: order } = useCart();
  const { frame } = useMobileFrame();
  const product = useCurrentProduct();

  orderRef.current = order;
  productRef.current = product;

  const addToCartHandler = useCallback(
    ({ variant, listPosition, presentation }) => {
      dispatch(
        addToCart({
          variant,
          quantity: 1,
          listPosition,
          isSwatch: true,
          page: 'Swatch Popup',
          listName: `Swatch - ${presentation}`,
          swatchRelatedProduct: productRef.current,
        })
      ).catch((err) => frame.openModal('response', { body: err }));
    },
    [frame, dispatch]
  );
  const removeFromCartHandler = useCallback(
    ({ variant }) => {
      const targetItem = orderRef.current.line_items.find((item) => item.variant.id === variant.id);
      if (targetItem) {
        dispatch(processCart(targetItem)).catch((err) => frame.openModal('response', { body: err }));
      }
    },
    [frame, dispatch]
  );

  return { addToCartHandler, removeFromCartHandler };
};

const useMaterialLoad = (props = {}) => {
  const { needLoad } = props;
  const dispatch = useDispatch();
  const product = useCurrentProduct();
  useEffect(() => {
    if (needLoad) {
      dispatch(loadSwatches(product.id));
    }
  }, [product?.id, dispatch, needLoad]);
};

const useMaterialPopup = (props = {}) => {
  const product = useCurrentProduct();
  const { defaultActive, customisable = false } = props;
  const swatches = useSelector((state) => state.swatches);
  const swatchLoading = !swatches[product.id] || swatches[product.id].loading || !swatches[product.id].data;

  useMaterialLoad(props);

  const collections = useMemo(() => {
    if (product?.id && swatches && swatches[product.id] && swatches[product.id].data) {
      return swatches[product.id].data.map((s) => ({
        ...s,
        variants: s.variants.filter((v) => customisable || !v.is_customized),
      }));
    }
    return [];
  }, [product?.id, swatches, customisable]);

  const aliveCollections = useMemo(() => collections.filter((collection) => collection.variants.length), [collections]);

  const activeCollection = useMemo(() => {
    if (defaultActive && aliveCollections) {
      return aliveCollections.find(
        (it) =>
          it &&
          it.variants &&
          it.variants.some(
            (v) =>
              v.presentation.toLowerCase().startsWith(defaultActive.toLowerCase()) ||
              defaultActive.toLowerCase().startsWith(v.presentation.toLowerCase())
          )
      );
    }
    return {};
  }, [aliveCollections, defaultActive]);

  return {
    swatchLoading,
    aliveCollections,
    activeCollection,
  };
};

const useFreeSwatchPopup = (props = {}) => {
  const cartLoadingRef = useRef();
  const cart = useSelector((state) => state.cart);
  const order = cart.data;
  cartLoadingRef.current = cart.loading || cart.creating || cart.processing;
  const [currentVariant, setCurrentVariant] = useState({});
  const { addToCartHandler, removeFromCartHandler } = useSwatchCart();
  const { swatchLoading, aliveCollections } = useMaterialPopup(props);
  const { customizations } = useSelector(selectCurrentProduct);

  const orderAliveCollections = useMemo(
    () =>
      aliveCollections
        .map((collection) => {
          const orderCollection = collection;
          orderCollection.variants = orderCollection.variants
            .map((variant, index) => {
              const newVariant = variant;
              if (order?.line_items?.find((item) => item.variant.id === variant.id)) {
                newVariant.added_order = true;
                newVariant.clickHandler = () => {
                  if (!cartLoadingRef.current) {
                    setCurrentVariant(variant);
                    removeFromCartHandler({ variant });
                  }
                };
              } else {
                newVariant.added_order = false;
                newVariant.clickHandler = () => {
                  if (!cartLoadingRef.current) {
                    setCurrentVariant(variant);
                    addToCartHandler({
                      variant,
                      listPosition: index,
                      presentation: orderCollection.presentation,
                    });
                  }
                };
              }
              return newVariant;
            })
            .filter(({ id }) => new Set(customizations.map(({ swatch_id }) => swatch_id)).has(id));

          return orderCollection;
        })
        .filter((orderCollection) => orderCollection?.variants?.length),
    [aliveCollections, order?.line_items, removeFromCartHandler, addToCartHandler, customizations]
  );

  return {
    currentVariant,
    orderAliveCollections,
    swatchLoading,
    cartLoading: cartLoadingRef.current,
  };
};

export {
  useOptions,
  useModel,
  useMaterialLoad,
  useConfigOptions,
  useMaterialPopup,
  useFreeSwatchPopup,
  useUpdateVariant,
};
