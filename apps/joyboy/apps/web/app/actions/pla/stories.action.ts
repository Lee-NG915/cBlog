import { getStoryByApi } from '../cms.action';
import { fetchFromKnightServer, getStorySlug } from '@castlery/modules-cms-services';
import { getProductData } from './products.action';
import { logger } from '@castlery/observability/server';
/**
 * https://github.com/storyblok/storyblok-js-client?tab=readme-ov-file#method-storyblokget
 * @param param0
 */
export const getAllParallelInPla = async ({
  region,
  spuSlug,
  variationSlug,
  searchParams,
}: {
  region: string;
  spuSlug: string;
  variationSlug: string;
  searchParams: URLSearchParams;
}) => {
  try {
    const storySlug = getStorySlug(region, variationSlug, spuSlug);
    const storiesRes = await getStoryByApi(storySlug.pla);
    if (storiesRes?.status === 'rejected') {
      throw new Error(storiesRes?.reason);
    }
    const [
      dataBucketRes,
      shopTheLookRes,
      pageMapRes,
      outerMenuRes,
      salePagesRes,
      menuRes,
      navRes,
      collectionsRes,
      product,
    ] = await Promise.allSettled([
      getStoryByApi(storySlug.plaBucket),
      getStoryByApi(storySlug.shopTheLook),
      getStoryByApi(storySlug.pageMap),
      getStoryByApi(storySlug.outerMenuData),
      getStoryByApi(storySlug.salePages),
      fetchFromKnightServer({ slugArray: ['taxonomies/menu'] }),
      fetchFromKnightServer({ slugArray: ['story_bloks/global-nav'] }),
      fetchFromKnightServer({ slugArray: ['taxonomies/collections'] }),
      getProductData(searchParams, spuSlug),
    ]);

    // 2. 数据处理和格式化
    const storyContent = storiesRes?.data ? storiesRes?.data?.story?.content : {};

    const plaData = dataBucketRes.status === 'fulfilled' ? dataBucketRes?.value?.data?.story?.content : {};
    const newStoryContent = storyContent?.body?.map((item: any) => {
      if (item.data_source) {
        const selector = item.data_source;
        const data = plaData?.[selector];

        return {
          ...item,
          data_source: data,
        };
      }
      return item;
    });

    // 处理menu数据
    const menuData = menuRes.status === 'fulfilled' ? menuRes.value?.[0].data : {};

    const outerMenuData =
      outerMenuRes.status === 'fulfilled' ? outerMenuRes.value?.data?.story?.content?.menu_component_data : [];

    const salePages =
      salePagesRes.status === 'fulfilled'
        ? salePagesRes.value?.data?.story?.content.seo_pages.concat(salePagesRes.value?.data?.story?.content.sale_pages)
        : [];
    // 处理global nav数据
    const globalNav = navRes.status === 'fulfilled' ? navRes.value?.[0].data?.story?.content?.items : [];

    const collectionsData = collectionsRes.status === 'fulfilled' ? collectionsRes.value?.[0].data : {};

    // 处理pagemap的数据
    const pageMapping = pageMapRes.status === 'fulfilled' ? pageMapRes.value?.data?.story?.content?.list : [];
    const pageMap = Array.isArray(pageMapping)
      ? pageMapping.reduce((acc, cur) => {
          acc[cur.key] = cur.value;
          return acc;
        }, {})
      : {};
    // 处理 shopTheLook data
    const shopTheLook = shopTheLookRes.status === 'fulfilled' ? shopTheLookRes.value?.data?.story?.content : {};
    // 处理 product
    if (product.status === 'rejected') {
      throw new Error(product.reason);
    }
    const productData = product.value;
    return {
      stories: { body: newStoryContent },
      outerMenuData,
      menuData,
      globalNav,
      shopTheLook,
      pageMap,
      collectionsData,
      productData,
      salePages,
    };
  } catch (e) {
    logger.error('Failed to fetch PLA stories', { error: e });
    throw e;
  }
};
