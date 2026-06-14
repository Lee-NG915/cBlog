'use server';
import { getProductByIdOrSlugThunk } from '../api/product.api';

export const getPlaProduct = async (makeStore: any, slug: string) => {
  // const token = await webAuth();
  // if (token && !token.error) {
  const wrapperGetProductRtk = async () => {
    // 服务端执行该 makeStore 函数，和水合的 store 也不是同一个，不需要关心其它的触发器，只需要它来触发请求
    const store = makeStore();
    const result = await store.dispatch(
      getProductByIdOrSlugThunk({
        idOrSlug: slug,
      })
    );
    if (result?.error) {
      // 404、401、403、fail url
      throw new Error(result);
    }
    return result?.payload;
  };
  return await wrapperGetProductRtk();
  // } else {
  //   throw new Error('Missing token');
  // }
};
