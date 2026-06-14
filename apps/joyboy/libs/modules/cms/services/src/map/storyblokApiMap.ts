export const StoryBlokUrlPaths = {
  PLA: 'pla',
  PLA_BUCKET: 'plaBucket',
  SHOP_THE_LOOK: 'shopTheLook',
  PAGE_MAP: 'pageMap',
  OUTER_MENU_DATA: 'outerMenuData',
  SALE_PAGES: 'salePages',
  GLOBAL_NAV: 'globalNav',
  CONFIGURATION_NOTICE: 'configurationNotice',
  THE_CASTLERY_CLUB: 'theCastleryClub',
  // 添加更多常用路径常量
} as const;

export type UrlPath = keyof typeof StoryBlokUrlPaths; // 确保类型安全

/**
 * pla-layout: `sg/pla/pla-layout-a` => `${region}/pla/${variationSlug}`
 * data-bucket: `sg/pla/pla-data-bucket/remi-3-seater-sofa-with-ottoman` => `${region}/pla/pla-data-bucket/${spuSlug}`
 * page-map: `au/configuration/page-map` => `${region}/configuration/page-map`
 * outer-menu-data: `au/menu-group/menu-a` => `${region}/menu-group/menu-a`
 * global-nav: `au/configuration/global-nav` => `${region}/configuration/global-nav`
 * @param region
 * @param variationSlug
 * @param spuSlug
 * @returns
 */

export const getStorySlug = (region: string, variationSlug?: string, spuSlug?: string) => {
  return {
    [StoryBlokUrlPaths.PLA]: region && variationSlug ? `${region}/pla/${variationSlug}` : '', // 只有 region 和 variationSlug 都存在时有效
    [StoryBlokUrlPaths.PLA_BUCKET]: region && spuSlug ? `${region}/pla/pla-data-bucket/${spuSlug}` : '', // 只有region, spuSlug 存在时有效
    [StoryBlokUrlPaths.SHOP_THE_LOOK]: 'shop-the-look', // 永远有效
    [StoryBlokUrlPaths.PAGE_MAP]: region ? `${region}/configuration/page-map` : '', // region 必须存在
    [StoryBlokUrlPaths.OUTER_MENU_DATA]: region ? `${region}/menu-group/menu-a` : '', // region 必须存在
    [StoryBlokUrlPaths.SALE_PAGES]: 'sale-pages', // 永远有效
    [StoryBlokUrlPaths.GLOBAL_NAV]: region ? `${region}/configuration/global-nav` : '', // region 必须存在
    [StoryBlokUrlPaths.CONFIGURATION_NOTICE]: region ? `${region}/configuration/notice` : '', // region 必须存在
    [StoryBlokUrlPaths.THE_CASTLERY_CLUB]: region ? `${region}/general-content/tcc-pages/the-castlery-club` : '', // region 必须存在
  };
};

export const getValidStorySlugs = (storySlug: Record<string, string>): string[] => {
  return Object.values(storySlug).filter((path) => path !== ''); // 过滤掉空路径
};
