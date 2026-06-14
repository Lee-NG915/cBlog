import { fetchFromKnightServer, getStorySlug } from '@castlery/modules-cms-services';
import fetchCMSData, { getStoryByApi } from '../cms.action';
import { EcEnv } from '@castlery/config';

const apiPrefix = EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase();

export const getAllParallelInBlogList = async () => {
  try {
    const storySlug = getStorySlug(apiPrefix, undefined, undefined);
    const [pageMapRes, salePagesRes, blogListRes, menuRes, collectionsRes, outerMenuRes] = await Promise.allSettled([
      getStoryByApi(storySlug.pageMap),
      getStoryByApi(storySlug.salePages),
      fetchCMSData.allStoryblokPages({ contentType: 'Blog Page' }),
      fetchFromKnightServer({ slugArray: ['taxonomies/menu'] }),
      fetchFromKnightServer({ slugArray: ['taxonomies/collections'] }),
      getStoryByApi(storySlug.outerMenuData),
    ]);
    const blogListData = blogListRes.status === 'fulfilled' ? blogListRes?.value : {};
    const menuData = menuRes.status === 'fulfilled' ? menuRes.value?.[0].data : {};
    const outerMenuData =
      outerMenuRes.status === 'fulfilled' ? outerMenuRes.value?.data?.story?.content?.menu_component_data : [];
    const collectionsData = collectionsRes.status === 'fulfilled' ? collectionsRes.value?.[0].data : {};
    const pageMapping = pageMapRes.status === 'fulfilled' ? pageMapRes.value?.data?.story?.content?.list : [];
    const pageMap = Array.isArray(pageMapping)
      ? pageMapping.reduce((acc, cur) => {
          acc[cur.key] = cur.value;
          return acc;
        }, {})
      : {};
    const salePages = salePagesRes.status === 'fulfilled' ? salePagesRes.value?.data?.story?.content.sale_pages : [];

    return {
      pageMap,
      blogListData,
      menuData,
      collectionsData,
      salePages,
      outerMenuData,
    };
  } catch (e) {
    console.log('🚀 ~ getAllParallelInBlogList ~ e:', e);
  }
};
