import React from 'react';
import { asyncLoad } from 'components/AsyncLoad/utils';
import NotFound from 'containers/NotFound';
import { loadIfNeeded as loadProduct, updateVariantPrice } from 'redux/modules/products';
import loadable from '@loadable/component';
import { O2OCreditsWrapper } from 'components/O2OCreditsWrapper';
import { productTools, useCurrentProduct } from './hooks/product';
// import Product from './Product';

const Product = loadable(() => import(/* webpackPrefetch: true, webpackChunkName: "product" */ `./Product`));

const Index = ({ location }) => {
  const product = useCurrentProduct();
  if (product && product.variants && product.variants.length) {
    return (
      <>
        <Product location={location} />
        {__CLIENT__ && <O2OCreditsWrapper location={location} />}
      </>
    );
  }
  return <NotFound location={location} />;
};

export default asyncLoad([
  async ({ location, store: { dispatch }, params }) => {
    // TODO when the api throw an error here, the error handler is incorrect
    // user will enter to the last corect SPU
    const product = await dispatch(loadProduct(params.product));
    if (!product.customizations) product.customizations = [];
    const res = await Promise.allSettled([
      productTools.reduxInit(location, product, dispatch),
      dispatch(updateVariantPrice()),
    ]);

    res.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          JSON.stringify(
            {
              message: `Error in Promise${index}`,
              error:
                result.reason instanceof Error
                  ? { message: result.reason.message, stack: result.reason.stack }
                  : String(result.reason),
            },
            null,
            2
          )
        );
      }
    });
    // await dispatch(updateVariantPrice());
    return Promise.resolve(res[0].value);
  },
])(Index);
