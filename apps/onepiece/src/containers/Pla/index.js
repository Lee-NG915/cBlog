import React from 'react';
import { asyncLoad } from 'components/AsyncLoad/utils';
import NotFound from 'containers/NotFound';
import { loadIfNeeded as loadProduct, updateVariantPrice } from 'redux/modules/products';
import { useSelector } from 'react-redux';
import loadable from '@loadable/component';
import { productTools } from 'containers/Product/hooks/product';
import { handleCalculateFee } from 'redux/modules/productOptions';
import { load as dyApiData } from 'redux/modules/dyApiData';
import { globalFeatureInAU, globalFeatureInSG, globalFeatureInUS } from 'config';
// import PlaPage from './PlaPage';
// import { getUserDevice } from 'utils/device';

const PlaPage = loadable(() => import(/* webpackPrefetch: true, webpackChunkName: "product" */ './PlaPage'));

const Index = ({ location, params }) => {
  const product = useSelector((state) => state.products[params.product].data);
  let variationType = 'B';
  if (globalFeatureInSG) {
    variationType = 'origin';
  }
  if (product && product.variants && product.variants.length) {
    return <PlaPage variationType={variationType} />;
  }
  return <NotFound location={location} />;
};

export default asyncLoad([
  async ({ location, store: { dispatch }, params }) => {
    const product = await dispatch(loadProduct(params.product));
    const variantCode = product.variants.find((variant) => variant.product_slug === product.slug)?.sku;
    const { query = {} } = location;
    const { region_id: regionId } = query;
    const requestArray = [productTools.reduxInit(location, product, dispatch)];
    if (globalFeatureInUS && regionId) {
      // TODO  interface timeout handling.
      requestArray.concat([dispatch(updateVariantPrice()), dispatch(handleCalculateFee())]);
    }

    const res = await Promise.allSettled(requestArray);

    res.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          JSON.stringify(
            {
              message: `Error in Promise${index}`,
              error:
                result?.reason instanceof Error
                  ? { message: result?.reason?.message, stack: result?.reason?.stack }
                  : String(result?.reason),
            },
            null,
            2
          )
        );
      }
    });

    return Promise.resolve(res[0].value);
  },
  ({ store: { dispatch }, pageType }) => {
    // const device = getUserDevice();
    // const isMobile = device !== 'desktop';
    if (globalFeatureInAU) {
      return dispatch(dyApiData({ selectorArray: ['PLA A/B Test'], pageType }));
    }
    return Promise.resolve();
  },
])(Index);
