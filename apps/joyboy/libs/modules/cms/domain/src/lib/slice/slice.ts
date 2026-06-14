import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { SetStoryblokDataParams } from '../types';
import { PlaPageStoryblok, ShopTheLookDataV2Storyblok, TermsWithVersionStoryblok } from '@castlery/types';

export const CMS_PATHS = {
  TAXONOMIES: {
    MENU: 'taxonomies/menu',
    COLLECTIONS: 'taxonomies/collections',
  },
  MENU: {
    OUTER: 'general-configuration/universal-config-new-joyboy/menu-group/menu-a',
    CONFIG: '/story_bloks/menu',
  },
  PDP: {
    SELECTOR: 'general-configuration/universal-config-new-joyboy/pdp/pdp-selector',
    DATA_BUCKET: 'general-configuration/universal-config-new-joyboy/pdp/data-bucket',
    WIDGETS: 'general-configuration/universal-config-new-joyboy/pdp/pdp-widgets',
  },
  // SALE_PAGES: '/sale-pages',
  GLOBAL_NAV: 'general-configuration/universal-config-new-joyboy/global-nav',
  PAGE_MAP: 'page-map',
  SHOP_THE_LOOK: 'general-content-v2/inspiration-tool-pages/shop-the-look',
  STORY_CONTENT: '/story_bloks/story-content',
  SALE_PAGES: 'general-content-v2/sale-pages/sale-pages',
  FOOTER: 'general-configuration/universal-config-new-joyboy/footer',
  PLA_LAYOUT_PAGES: 'general-content-v2/product-pages/pla-layout',
  TERMS_OF_USE: 'general-content-v2/terms/terms-of-use',
} as const;

interface CMSState {
  data: Record<string, any>;
}

const initialCMSState: CMSState = {
  data: {},
};

export const cmsSlice = createSliceWithThunks({
  name: 'cms',
  initialState: initialCMSState,
  reducers: (create) => {
    return {
      setCMSData: create.reducer((state, { payload }: { payload: SetStoryblokDataParams[] }) => {
        if (Array.isArray(payload) && payload.length > 0) {
          payload.forEach((item: SetStoryblokDataParams) => {
            state.data[item.slug] = item.data;
          });
        }
      }),
      setOriginalMenuData: create.reducer((state, { payload }) => {
        state.data[CMS_PATHS.TAXONOMIES.MENU] = payload;
      }),
      setOuterMenuData: create.reducer((state, { payload }) => {
        state.data[CMS_PATHS.MENU.OUTER] = payload;
      }),
      // setSalePages: create.reducer((state, { payload }) => {
      //   state.data[CMS_PATHS.SALE_PAGES] = payload;
      // }),
      setConfigMenuData: create.reducer((state, { payload }) => {
        state.data[CMS_PATHS.MENU.CONFIG] = { story: { content: { items: payload } } };
      }),
      setGlobalNavData: create.reducer((state, { payload }) => {
        state.data[CMS_PATHS.GLOBAL_NAV] = payload;
      }),
      setPageMap: create.reducer((state, { payload }) => {
        state.data[CMS_PATHS.PAGE_MAP] = payload;
      }),
      setShopTheLookData: create.reducer(
        (
          state,
          {
            payload,
          }: {
            payload: ShopTheLookDataV2Storyblok | {};
          }
        ) => {
          state.data[CMS_PATHS.SHOP_THE_LOOK] = payload;
        }
      ),
      setCMSProductList: create.reducer((state, { payload }: { payload: any }) => {
        const existingProductList = state.data['product-list'] || {};
        const updatedProductList = {
          ...existingProductList,
          ...payload,
        };

        state.data['product-list'] = updatedProductList;
      }),
      setCollectionData: create.reducer((state, { payload }) => {
        state.data[CMS_PATHS.TAXONOMIES.COLLECTIONS] = payload;
      }),
      // setCollectionData: create.reducer((state, { payload }) => {
      //   state.data[CMS_PATHS.TAXONOMIES.COLLECTIONS] = payload;
      // }),
      setStoryContent: create.reducer((state, { payload }) => {
        state.data[CMS_PATHS.STORY_CONTENT] = payload;
      }),
      setPlaPageStoryblok: create.reducer(
        (
          state,
          {
            payload,
          }: {
            payload: PlaPageStoryblok;
          }
        ) => {
          state.data[CMS_PATHS.PLA_LAYOUT_PAGES] = payload;
        }
      ),
      setTermsOfUse: create.reducer((state, { payload }: { payload: TermsWithVersionStoryblok[] }) => {
        state.data[CMS_PATHS.TERMS_OF_USE] = payload?.[0];
      }),
    };
  },
  selectors: {
    selectCMSOriginalMenuData: (state) => state.data[CMS_PATHS.TAXONOMIES.MENU],
    selectCMSOuterMenuData: (state) => state.data[CMS_PATHS.MENU.OUTER],
    // selectCMSSalePages: (state) => state.data[CMS_PATHS.SALE_PAGES],
    // selectCMSConfigMenuData: (state) => {
    //   const menuData = state.data[CMS_PATHS.MENU.CONFIG];
    //   return menuData?.story?.content?.items || [];
    // },
    // selectCMSGlobalNavData: (state) => state.data[CMS_PATHS.GLOBAL_NAV],
    selectPageMap: (state) => state.data[CMS_PATHS.PAGE_MAP],
    selectShopTheInfoData: (state) => state.data[CMS_PATHS.SHOP_THE_LOOK] as ShopTheLookDataV2Storyblok,
    selectCMSCollectionData: (state) => state.data[CMS_PATHS.TAXONOMIES.COLLECTIONS],
    selectCMSStoryContent: (state) => state.data[CMS_PATHS.STORY_CONTENT],
    selectCMSProductList: (state) => state.data['product-list'],
    selectPlaPageStoryblok: (state) => state.data[CMS_PATHS.PLA_LAYOUT_PAGES],
    selectTermsOfUse: (state) => state.data[CMS_PATHS.TERMS_OF_USE],
  },
});

export const {
  setCMSData,
  setOriginalMenuData,
  setOuterMenuData,
  // setSalePages,
  setConfigMenuData,
  setGlobalNavData,
  setPageMap,
  setShopTheLookData,
  setCollectionData,
  setStoryContent,
  setCMSProductList,
  setPlaPageStoryblok,
  setTermsOfUse,
} = cmsSlice.actions;

export const {
  selectCMSOriginalMenuData,
  // selectCMSConfigMenuData,
  // selectCMSGlobalNavData,
  selectPageMap,
  selectShopTheInfoData,
  selectCMSCollectionData,
  selectCMSStoryContent,
  selectCMSOuterMenuData,
  selectCMSProductList,
  selectPlaPageStoryblok,
  selectTermsOfUse,
  // selectCMSSalePages,
} = cmsSlice.selectors;
