import { fetchFromKnightServer, getStorySlug } from '@castlery/modules-cms-services';
import { getStoryByApi } from '../cms.action';
import { EcEnv } from '@castlery/config';

const apiPrefix = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase();

export const fetchAndProcessParallel = async (promises, handlers) => {
  try {
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (typeof handlers[index] === 'function') {
        return handlers[index](result);
      }
      return null; // 如果没有提供处理函数，返回 null
    });
  } catch (error) {
    console.log('Error in fetchAndProcessParallel:', error);
    throw error;
  }
};

// 使用示例
export const getAllParallelInGeneralList = async (additionalPromises = [], additionalHandlers = []) => {
  const storySlug = getStorySlug(apiPrefix, undefined, undefined);

  const basePromises = [
    getStoryByApi(storySlug.pageMap),
    getStoryByApi(storySlug.salePages),
    fetchFromKnightServer({ slugArray: ['taxonomies/menu'] }),
    fetchFromKnightServer({ slugArray: ['taxonomies/collections'] }),
    getStoryByApi(storySlug.outerMenuData),
    fetchFromKnightServer({ slugArray: ['story_bloks/global-nav'] }),
  ];

  const baseHandlers = [
    (res) =>
      res.status === 'fulfilled'
        ? res.value?.data?.story?.content?.list.reduce((acc, cur) => {
            acc[cur.key] = cur.value;
            return acc;
          }, {})
        : {},

    (res) => (res.status === 'fulfilled' ? res.value?.data?.story?.content.sale_pages : []),

    (res) => (res.status === 'fulfilled' ? res.value?.[0].data : {}),

    (res) => (res.status === 'fulfilled' ? res.value?.[0].data : {}),

    (res) => (res.status === 'fulfilled' ? res.value?.data?.story?.content?.menu_component_data : []),

    (res) => (res.status === 'fulfilled' ? res.value?.[0].data?.story?.content?.items : []),
  ];

  const allPromises = [...basePromises, ...additionalPromises];
  const allHandlers = [...baseHandlers, ...additionalHandlers];

  const results = await fetchAndProcessParallel(allPromises, allHandlers);

  const [pageMap, salePages, menuData, collectionsData, outerMenuData, globalNav, ...additionalResults] = results;

  return {
    pageMap,
    salePages,
    menuData,
    collectionsData,
    outerMenuData,
    globalNav,
    additionalResults,
  };
};
