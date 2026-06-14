export * from './stories.action';
export * from './products.action';

import { getAllParallelInPla } from './stories.action';
import { componentKeyMap } from '@castlery/modules-cms-components';

export const getPlaDatas = async ({
  region,
  slug,
  variationSlug,
  searchParams,
}: {
  region: string;
  slug: string;
  variationSlug: string;
  searchParams: URLSearchParams;
}) => {
  const { stories, shopTheLook, globalNav, menuData, pageMap, collectionsData, productData, outerMenuData, salePages } =
    await getAllParallelInPla({
      region,
      spuSlug: slug,
      variationSlug,
      searchParams,
    });
  const newStories = stories?.body?.map((story: { component: any }) => {
    const { component } = story;
    if (component === componentKeyMap.dyRecommendationWidgetV2) {
      // todo: 之后在cms集成realtime filter的选择器，让使用者选择规则 例如：根据category，根据sku，根据spu等等
      const breadcrumbs = productData?.breadcrumbs?.filter(
        (item: { level: number }) => item.level === 2 || item.level === 1
      );
      const categoryString = breadcrumbs?.[breadcrumbs.length - 1]?.name;
      const blogCategoryString = productData?.breadcrumbs?.filter((item: { level: number }) => item.level === 1)?.[0]
        ?.name;
      const collectionString = productData.taxons?.find((item) => item.ancestors.includes('Collections'))?.name;

      return {
        ...story,
        recommendationAttributes: {
          categoryString,
          collectionString,
          blogCategoryString,
        },
      };
    }
    return story;
  });

  return {
    stories: {
      ...stories,
      body: newStories,
    },
    shopTheLook,
    globalNav,
    menuData,
    outerMenuData,
    pageMap,
    productData,
    collectionsData,
    salePages,
  };
};
