import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { animate } from 'utils/animate';
import { LocationContext } from 'components/Stack/RouteContext';
import { updateProductConfig } from 'redux/modules/productOptions';
import { record as recordViewedProducts } from 'redux/modules/fixBar';
import { FrameContext } from 'containers/Frame/FrameContext';
import { getProductBreadcrumbs } from 'pages';
import { fetchVariant } from 'redux/modules/products';
import { selectedObjToStr } from '../utils';

const useProductOptions = () => useSelector((state) => state.productOptions);
const getSelectedVariant = ({ product, selectedOptions }) =>
  product?.variants.find((variant) =>
    variant?.variant_option_values.every(
      (optionValue) => selectedOptions?.[optionValue.option_type_id]?.id === optionValue.option_value_id
    )
  );
class Tools {
  updateQueryStringParameter = (uri, key, value) => {
    const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, `$1${key}=${value}$2`);
    }
    return `${uri + separator + key}=${value}`;
  };

  getAggregateRating = (review) => ({
    '@type': 'AggregateRating',
    ratingValue: review.average_rating,
    worstRating: '1',
    bestRating: '5',
    reviewCount: review.total_count,
  });

  getProductUrl = (fields) => {
    const query = Object.keys(fields).reduce((url, key) => this.updateQueryStringParameter(url, key, fields[key]), '');

    const productUrl = `${window.location.origin}${window.location.pathname}${query}`;
    return productUrl;
  };

  getOptionWords = (variant) => {
    if (variant && variant.id !== undefined) {
      const words = variant.variant_option_values.map((v) => v.presentation).join(', ');
      if (words) {
        return `, ${words}`;
      }
      return '';
    }
    return '';
  };

  getKeyWords = (product, variant) => {
    const keywordsArr = [];
    // name and options
    keywordsArr.push(`${product.name}${this.getOptionWords(variant)}`);

    // categories
    keywordsArr.push(
      product.taxons
        ?.filter((t) => t.level !== 0)
        .map((t) => t.name)
        .join(', ')
    );

    return keywordsArr.filter((w) => w !== '').join(', ');
  };

  getAggregateRatingString = (reviews) => {
    if (reviews.total_count < 1 || reviews.average_rating < 3) {
      return '';
    }
    const rating = this.getAggregateRating(reviews);
    return `"aggregateRating": ${JSON.stringify(rating)},`;
  };

  // eslint-disable-next-line camelcase
  getFirstThreeReviews = ({ average_rating, reviews }) => {
    // eslint-disable-next-line camelcase
    if (!reviews || reviews.length === 0 || average_rating < 3) {
      return '';
    }

    const result = reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: (!!review && review.user_name?.trim()) || 'Castlery Customer',
      },
      datePublished: review.updated_at,
      reviewBody: review.content,
      reviewRating: {
        '@type': 'Rating',
        bestRating: '5',
        ratingValue: review.rating,
        worstRating: '1',
      },
    }));

    return `"review": ${JSON.stringify(result)},`;
  };

  // FIXME  If this function is called on the client side,
  // the location here should be consistent with the location on the server side,
  // now the use of location on both ends is a bit confusing and can be optimized later
  reduxInit = async (location, product, dispatch) => {
    const realSearch = location.search;
    if (__SERVER__) {
      // prevent reduxInit when no variants or need 301 redirection
      if (product?.variants.length === 0) {
        return Promise.resolve();
      }
      if (!location.pathname.includes(product?.slug)) {
        return Promise.resolve();
      }
    }
    // if (__CLIENT__ && this.productId && this.productId === product.id && ) {
    //   // Keep only the client side
    //   if (this.search !== undefined && this.search === realSearch) {
    //     return Promise.resolve();
    //   }
    // }
    if (this.product === product) {
      return Promise.resolve();
    }
    const options = {};

    options.init = true;
    options.productSlug = product.slug;
    options.realCustomisable =
      product.product_type === 'configurable' && product.customizations.some((v) => v.is_customized);
    options.deliveryLeadTimeDisplay = '';
    options.currentReviewIndex = 0;
    options.selectedVariants = {};
    options.bundleInit = false;
    options.bundleProduct = {};
    options.bundleSelected = {};
    options.bundleVariant = {};
    options.selected = {};

    // to determine the real quantity
    let quantity = +location.query.quantity;
    const min = product.min_sale_qty;
    const max = product.max_sale_qty;
    const inc = product.qty_increments;
    if (!(quantity && quantity >= min && quantity <= max && (quantity - min) % inc === 0)) {
      quantity = min;
    }
    options.quantity = quantity;

    if (product.product_type === 'bundle') {
      const { query } = location;
      const selectedVariants = {};

      // to determine the real selectedVariants
      product.bundle_options.forEach((option) => {
        const id = +query[option.name];
        const matchedVariant = option.variants.find((v) => v.id === id);
        if (matchedVariant) {
          selectedVariants[option.id] = matchedVariant.id;
        } else {
          selectedVariants[option.id] = option.variants[0]?.id;
        }
      });

      options.selectedVariants = selectedVariants;
      options.variantId = product.variants[0]?.id;
      options.customisable = false;
    } else {
      /**
       *
       * To determine the real selected options
       *
       */
      const { optionTypes } = location.state || {};
      const queryKeys = Object.keys(location.query);
      const valueKeys = queryKeys.length ? queryKeys : optionTypes ? Object.keys(optionTypes) : [];

      let selected;
      let variant;
      let selectedVariants;
      if (valueKeys?.length) {
        try {
          const values = queryKeys.length ? location.query : optionTypes;
          selected = valueKeys.reduce((accumulator, key) => {
            const selectedOptionType =
              // external reference
              // "product_type": "simple" has no option_types
              product?.option_types?.find((optionType) => optionType.name === key) || [];

            if (selectedOptionType && selectedOptionType?.values.length > 0) {
              const selectedOption = selectedOptionType?.values.find((optionValue) => optionValue.name === values[key]);
              if (selectedOption) {
                accumulator[selectedOptionType.id] = selectedOption;
              }
            }
            return accumulator;
          }, {});
          selectedVariants = product.customizations.filter(
            // eslint-disable-next-line camelcase
            ({ option_types }) => option_types === selectedObjToStr(selected)
          );
        } catch (e) {
          console.error(
            JSON.stringify(
              {
                message: 'Error processing selected variants',
                error: e instanceof Error ? { message: e.message, stack: e.stack } : String(e),
              },
              null,
              2
            )
          );
          return {};
        }
      }

      if (selectedVariants?.length > 0) {
        variant = await dispatch(fetchVariant({ selected, slug: product.slug }));
      } else {
        variant = product.variants[0];
        if (!variant) {
          console.error('variants is null');
          // TODO  error handler
        }
        selected = variant?.variant_option_values?.reduce(
          // eslint-disable-next-line camelcase
          (accumulator, { option_type_id, option_value_id }) => ({
            ...accumulator,
            // eslint-disable-next-line camelcase
            [option_type_id]: product.option_types // external reference
              // eslint-disable-next-line camelcase
              .find(({ id }) => id === option_type_id)
              // eslint-disable-next-line camelcase
              .values.find(({ id }) => id === option_value_id),
          }),
          {}
        );
      }

      options.selected = selected;
      options.variantId = variant?.id;

      // customisable only true if:
      // 1. this product is customisable && (
      // 2. selected inventory and url's customisable is 1 ||
      // 3. selected custom)

      options.customisable =
        options.realCustomisable && ((options.variantId && location.query.customisable === '1') || !options.variantId);
    }

    this.search = realSearch;
    this.product = product;
    return dispatch(updateProductConfig(options));
  };
}

const productTools = new Tools();

// TODO 这个location的 是怎么处理的
const useLocation = () => useContext(LocationContext);
const useUser = () => useSelector((state) => state.auth.user);

const useCurrentProduct = () => {
  const { productSlug } = useProductOptions();
  const product = useSelector((state) => state.products?.[productSlug]?.data || {});
  return product;
};

const useCurrentVariant = () => {
  const { variantId } = useProductOptions();
  const product = useCurrentProduct();
  const currentVariant = useMemo(() => product.variants?.find((v) => v.id === variantId) || {}, [product, variantId]);
  return currentVariant;
};

// for bundle
const useCurrentSelectedVariants = () => {
  const { selectedVariants: selectedVariantIds } = useProductOptions();
  const product = useCurrentProduct();
  const selectedVariants = useMemo(
    () =>
      Object.keys(selectedVariantIds).reduce((acc, selectedVariantKey) => {
        const selectedVariantId = selectedVariantIds[selectedVariantKey];
        const selectedVariant = product.bundle_options
          .find((option) => option.id === +selectedVariantKey)
          ?.variants?.find((variant) => variant.id === +selectedVariantId);
        return {
          ...acc,
          [selectedVariantKey]: selectedVariant,
        };
      }, {}),
    [product.bundle_options, selectedVariantIds]
  );
  return selectedVariants;
};

const useMobileFrame = () => {
  const frame = useContext(FrameContext);
  const eventClose = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        frame.removeModal();
      }
    },
    [frame]
  );

  return { frame, eventClose };
};

const useAncestorCrumbs = () => {
  const location = useLocation();
  const product = useCurrentProduct();

  const breadcrumbs = location.state?.breadcrumbs;
  const basePages = useMemo(() => getProductBreadcrumbs(product.breadcrumbs), [product]);
  const ancestorCrumbs = useMemo(() => basePages, [basePages]);

  const socialPage = useMemo(() => {
    if (basePages?.[1]?.socialCollection) {
      return basePages[1];
    }
    if (breadcrumbs?.[0]?.socialCollection) {
      return breadcrumbs[0];
    }
    return basePages[0] || {};
  }, [breadcrumbs, basePages]);

  return { ancestorCrumbs, socialPage, product };
};

const useHelmet = () => {
  const product = useCurrentProduct();
  const variant = useCurrentVariant();

  const ratingString = useMemo(() => productTools.getAggregateRatingString(product.reviews), [product]);

  const threeReviews = useMemo(() => productTools.getFirstThreeReviews(product.reviews), [product]);

  const optionWords = useMemo(() => productTools.getOptionWords(variant), [variant]);

  const keyWords = useMemo(() => productTools.getKeyWords(product, variant), [product, variant]);

  return {
    ratingString,
    threeReviews,
    optionWords,
    keyWords,
  };
};

const useViewedProduct = () => {
  const dispatch = useDispatch();
  const product = useCurrentProduct();
  const { init } = useProductOptions();

  useEffect(() => {
    if (init) {
      dispatch(recordViewedProducts(product.id));
    }
  }, [product.id, dispatch, init]);
};

const useScrollTo = () => {
  const ref = useRef();
  const scrollToRef = useCallback(() => {
    const target = document.scrollingElement;
    if (ref.current) {
      animate({
        from: target.scrollTop,
        to: ref.current.offsetTop,
        duration: 500,
        func: 'easeInOutQuad',
        callback: (d) => (target.scrollTop = d),
      });
    }
  }, []);

  return [ref, scrollToRef];
};

const useUpdateUrl = () => {
  const first = useRef(true);
  const product = useCurrentProduct();
  const { init, selected, selectedVariants, customisable } = useProductOptions();

  const fields = useMemo(() => {
    if (init) {
      if (product.product_type === 'bundle') {
        return Object.keys(selectedVariants).reduce(
          (result, key) => ({
            ...result,
            [product.bundle_options.find((option) => option.id === +key).name]: selectedVariants[key],
          }),
          {}
        );
      }

      const initialFields = {};

      if (customisable) {
        initialFields.customisable = 1;
      }

      return Object.keys(selected).reduce(
        (result, optionTypeId) => ({
          ...result,
          [product?.option_types?.find((o) => o.id === +optionTypeId)?.name]: selected[optionTypeId]?.name,
        }),
        initialFields
      );
    }
    return {};
  }, [
    init,
    product.product_type,
    product.bundle_options,
    product?.option_types,
    customisable,
    selected,
    selectedVariants,
  ]);

  const originUrl = useMemo(() => {
    if (__CLIENT__) {
      return productTools.getProductUrl(fields);
    }
    return '';
  }, [fields]);

  useEffect(() => {
    first.current = true;
  }, [product.slug]);

  useEffect(() => {
    if (__CLIENT__) {
      if (first.current) {
        first.current = false;
      } else {
        window.history.replaceState(null, null, originUrl);
      }
    }
  }, [originUrl]);

  return originUrl;
};

export {
  useUser,
  useLocation,
  useScrollTo,
  useMobileFrame,
  useProductOptions,
  useCurrentProduct,
  useCurrentVariant,
  useCurrentSelectedVariants,
  useViewedProduct,
  productTools,
  getSelectedVariant,
  useHelmet,
  useUpdateUrl,
  useAncestorCrumbs,
};
