import { daysToDate, isExpired, isOutdated } from 'utils/time';
import lang from 'utils/lang';
import { traverseNestedArrayByChildren } from 'utils/common';
import ApiClient from 'helpers/ApiClient';
import uniqBy from 'lodash/uniqBy';
import { cleanData } from 'utils/removeUndefinedValues';
import basePagesConfig from './basePagesConfig';
import legacyPagesConfig from './legacyPagesConfig';
import seoCategoryConfig from './seoCategoryConfig';
import { addKnightPrefix, removeKnightPrefix } from './util';

export { addKnightPrefix, removeKnightPrefix };

const requestClient = new ApiClient();
/*
  pages from different origins
*/
// from knight
let categoryArr = [];
let collectionArr = [];
let taxonomyArr = []; // taxonomy = category + collection

let salePageArr = [];
let storyblokPageArr = [];
let storyblokBlogPageArr = [];

// from config
let basePageArr = [];
let seoCategoryArr = [];

// allPage = category + collection + salePage + basePage
let allPageMap = {};
let allPageUrlMap = {};

let legacyPageUrlMap = {}; // which will be redirect

export function initPages() {
  const taxonomyMap = {};
  const salePageMap = {};
  const storyblokPageMap = {};
  const storyblokBlogPageMap = {};
  const basePageMap = {};
  const seoCategoryMap = {};

  // set key for ages & init map
  traverseNestedArrayByChildren(__taxonomy.categories, (item) => {
    /**
     * Special Handling for sofas/leather-sofas
     */
    const specialPermalink = 'sofas/leather-sofas';

    if (__SERVER__) {
      item.key = addKnightPrefix(item.permalink);
      taxonomyMap[item.key] = item;
      if (item.permalink === specialPermalink) {
        item.permalink = '';
      }
    } else if (__CLIENT__) {
      if (!item.key) {
        item.key = addKnightPrefix(item.permalink);
      }
      taxonomyMap[item.key] = item;
      if (item.permalink === specialPermalink) {
        item.permalink = '';
      }
    }
  });

  traverseNestedArrayByChildren(__taxonomy.collections, (item) => {
    item.key = addKnightPrefix(item.permalink);
    taxonomyMap[item.key] = item;
  });

  uniqBy(__salePages, 'url').forEach((item) => {
    salePageMap[item.key] = item;
  });

  uniqBy(__storyblokSalePages, 'url').forEach((item) => {
    salePageMap[item.key] = item;
  });

  uniqBy(__storyblokPages, 'url').forEach((item) => {
    storyblokPageMap[item.key] = item;
  });

  uniqBy(__storyblokBlogPages, 'url').forEach((item) => {
    storyblokBlogPageMap[item.key] = item;
  });

  basePageArr = basePagesConfig
    .map((item) => {
      if (!item.url) {
        return null;
      }
      const newItem = {
        ...item,
        ...lang.t(`pages.${item.key}`),
        url: typeof item.url === 'string' ? item.url : item.url[__COUNTRY__],
        disabled: item.disabledCountries?.includes(__COUNTRY__),
        notIndexed: item.notIndexedCountries?.includes(__COUNTRY__),
      };
      if (!newItem.disabled) {
        basePageMap[newItem.key] = newItem;
      }
      return newItem;
    })
    .filter(Boolean);

  seoCategoryArr = seoCategoryConfig
    .map((item) => {
      if (!item.url) {
        return null;
      }
      const newItem = {
        ...item,
        url: typeof item.url === 'string' ? item.url : item.url[__COUNTRY__],
        disabled: item.disabledCountries?.includes(__COUNTRY__),
        notIndexed: item.notIndexedCountries?.includes(__COUNTRY__),
      };
      seoCategoryMap[newItem.key] = newItem;
      return newItem;
    })
    .filter(Boolean);

  // init pages
  categoryArr = __taxonomy.categories;
  collectionArr = __taxonomy.collections;
  taxonomyArr = [...categoryArr, ...collectionArr];
  salePageArr = __salePages.concat(__storyblokSalePages);
  storyblokPageArr = __storyblokPages;
  storyblokBlogPageArr = __storyblokBlogPages;

  allPageMap = {
    ...basePageMap,
    ...seoCategoryMap,
    ...taxonomyMap,
    ...salePageMap,
    ...storyblokPageMap,
    ...storyblokBlogPageMap,
  };
  allPageUrlMap = Object.keys(allPageMap).reduce((pre, key) => {
    if (allPageMap[key].url) {
      pre[allPageMap[key].url] = allPageMap[key];
    }
    return pre;
  }, {});

  // outdatedSalePages initialization must be at the end.
  if (__SERVER__) {
    _initLegacyPageUrlMap();
  }
  if (__DEVELOPMENT__ && typeof window !== 'undefined') {
    // for test
    window.__testPages = {
      basePageArr,
      categoryArr,
      seoCategoryArr,
      collectionArr,
      taxonomyArr,
      salePageArr,
      storyblokPageArr,
      storyblokBlogPageArr,
      allPageMap,
      allPageUrlMap,
      legacyPageUrlMap,
    };
  }
}

export function getCategories() {
  return categoryArr;
}

export function getTopCategoriesConfig() {
  return categoryArr?.reduce((pre, cur) => {
    if (cur.url && cur.permalink) {
      pre[cur.permalink] = cur.url;
    }
    return pre;
  }, {});
}

export function getFlattenedCategories() {
  const results = [];
  traverseNestedArrayByChildren(getCategories(), (item) => {
    results.push(item);
  });
  return results;
}

export function getCollections() {
  return collectionArr;
}

export function getTaxonomies() {
  return taxonomyArr;
}

export function getSalePages() {
  return salePageArr;
}

export function getStoryblokPages() {
  return storyblokPageArr;
}

export function getStoryblokBlogPages() {
  return storyblokBlogPageArr;
}

export function getBasePages() {
  return basePageArr;
}

export function getSeoCategoryPages() {
  return seoCategoryArr;
}

export function getAllPageMap() {
  return allPageMap;
}

// only for server
export function getReducedDataForClient(pageKey) {
  if (__SERVER__) {
    const savedKeys = [
      'key',
      'name',
      'permalink',
      'url',
      'thumbnail',
      'startedAt',
      'endedAt',
      'query',
      'queryDeliverBefore',
      'socialCollection',
      'metaTitle',
      'children',
      'metaDescription',
      'publishedAt',
      'bannerBackgroundImage',
    ];

    const { categories, collections } = global.__taxonomy;

    const reducedCategories = traverseNestedArrayByChildren(categories, (page, children) => {
      if (page.key === pageKey) return { ...page, children, isLoaded: true };
      return savedKeys.reduce((pre, key) => {
        if (key === 'children') {
          pre[key] = children;
        } else {
          pre[key] = page[key];
        }
        return pre;
      }, {});
    });

    const reducedCollections = collections.map((page) => {
      if (page.key === pageKey) return { ...page, isLoaded: true };
      return savedKeys.reduce((pre, key) => {
        pre[key] = page[key];
        return pre;
      }, {});
    });

    const reducedSalePages = global.__salePages.map((page) => {
      if (page.key === pageKey) return { ...page, isLoaded: true };
      return savedKeys.reduce((pre, key) => {
        pre[key] = page[key];
        return pre;
      }, {});
    });

    const formatUrlItem = (item) => {
      item.menuType = 'secondary_menu';
      item.dataLabel = item.desc;
      item.linkProps = {
        path: item.link.url,
        menuType: 'secondary_menu',
        text: item.name,
        target: item.link.target ?? '_self',
      };
      return item;
    };

    const globalNavs = global.__globalNav.map((item) => {
      item = formatUrlItem(item);
      if (
        (['/rewards', '/the-castlery-club'].includes(item.link) && !__YOTPO_ENABLED__) ||
        (item.link === '/referral' && !__FRIENDBUY_ENABLED__)
      ) {
        // hardcode 避免环境变量与页面对应不上的问题
        return false;
      }
      if (item.published_at === '' && item.ended_at !== '') {
        if (isOutdated(item.ended_at)) {
          return item;
        }
      }
      if (!isOutdated(item.published_at, item.ended_at)) {
        return item;
      }
      return false;
    });

    const reducedStoryblokPages = global.__storyblokPages.map((page) => {
      if (page.key === pageKey) return { ...page, isLoaded: true };
      return savedKeys.reduce((pre, key) => {
        pre[key] = page[key];
        return pre;
      }, {});
    });

    const reducedStoryblokBlogPages = global.__storyblokBlogPages.map((page) => {
      if (page.key === pageKey) return { ...page, isLoaded: true };
      return savedKeys.reduce((pre, key) => {
        pre[key] = page[key];
        return pre;
      }, {});
    });

    const reducedStoryblokSalePages = global.__storyblokSalePages.map((page) => {
      if (page.key === pageKey) return { ...page, isLoaded: true };
      return savedKeys.reduce((pre, key) => {
        pre[key] = page[key];
        return pre;
      }, {});
    });

    return {
      taxonomy: {
        categories: cleanData(reducedCategories),
        collections: cleanData(reducedCollections),
      },
      salePages: cleanData(reducedSalePages),
      storyblokPages: cleanData(reducedStoryblokPages),
      storyblokSalePages: cleanData(reducedStoryblokSalePages),
      globalNav: globalNavs,
      storyblokBlogPages: cleanData(reducedStoryblokBlogPages),
      menuData: cleanData(global.__menuData),
      termsHistory: global.__termsHistory,
    };
  }
}

export function getUrl(key, withoutSlash, fromKnight) {
  let pageKey = key;
  if (fromKnight) {
    pageKey = addKnightPrefix(key);
  }
  let url = allPageMap[pageKey] ? allPageMap[pageKey].url : '';
  if (url && withoutSlash === true) {
    url = url.slice(1);
  }

  return url;
}

export function validateUrl(url) {
  const lowercaseUrl = url.toLowerCase();
  return allPageUrlMap[lowercaseUrl];
}

export function getPageByKey(key) {
  return allPageMap[key];
}

export function getPageByPermalink(permalink) {
  return getPageByKey(addKnightPrefix(permalink)); // only Taxonomies have permalink
}

export function getParentPageBySubKey(subkey) {
  return getTaxonomies().find((item) => item.children.find((child) => child.key === subkey));
}

function getSubPage(url) {
  let target = '';
  categoryArr?.find((item) => {
    target = item?.children?.find((child) => child.url === url);
    return target;
  });
  return target;
}

export function getPageByUrl(url) {
  return allPageUrlMap[url];
}

// got category breadcrumbs from url
export function getBreadcrumbsByPathname(pathname) {
  const subPage = getSubPage(pathname) || getPageByUrl(pathname);
  if (subPage) {
    const parentPage = getParentPageBySubKey(subPage.key);
    if (parentPage) {
      return [parentPage, subPage];
    }
    return [subPage];
  }
}

// get product breadcrumbs
export const getProductBreadcrumbs = (categoryLevels) => {
  if (!Array.isArray(categoryLevels)) {
    return [];
  }
  const firstLevel = categoryLevels.find((t) => t.level === 1);
  const secondLevel = categoryLevels.find((t) => t.level === 2);
  const firstPage = getPageByPermalink(firstLevel?.permalink);
  const secondPage = getPageByPermalink(secondLevel?.permalink);
  if (firstPage && secondPage) {
    return [firstPage, secondPage];
  }
  return [];
};

// only used on server side
export function getLegacyPageByUrl(url) {
  if (!url) {
    return;
  }
  const targetUrl = url.trim();
  return legacyPageUrlMap[targetUrl];
}

function _initLegacyPageUrlMap() {
  const pages = legacyPagesConfig
    .filter((p) => p.url)
    .map((p) => ({
      ...p,
      redirectUrl: p.redirect.startsWith('/') ? p.redirect : getUrl(p.redirect),
    }));

  const outdatedTaxonomyPages = getTaxonomies().reduce((acc, item) => {
    let result = acc;
    if (item.children?.length > 0) {
      result = acc.concat(
        item.children
          .map((subItem) => ({
            redirectUrl: subItem.url,
            url: subItem.outdatedUrls,
          }))
          ?.filter((redirectItem) => redirectItem.url.length > 0)
      );
    } else if (item.outdatedUrls?.length > 0) {
      result.push({ redirectUrl: item.url, url: item.outdatedUrls });
    }
    return result;
  }, []);

  const outdatedSalePages = getSalePages().reduce((acc, page) => {
    if (isOutdated(page.publishedAt, page.endedAt) && page.url !== getUrl('sale')) {
      acc.push({
        url: page.url,
        redirectUrl: getUrl('sale'),
        from: page.key,
      });
    } else if (!isOutdated(page.publishedAt, page.endedAt)) {
      if (page.outdatedUrls?.trim()) {
        page.outdatedUrls?.split(',')?.forEach((item) => {
          if (item?.trim() && item?.trim() !== page.url) {
            acc.push({
              url: item?.trim(),
              redirectUrl: page.url,
            });
          }
        });
      }
    }
    return acc;
  }, []);

  legacyPageUrlMap = pages
    .concat(outdatedSalePages)
    .concat(outdatedTaxonomyPages)
    .reduce((pre, page) => {
      if (Array.isArray(page.url)) {
        page.url.forEach((item) => {
          if (item?.trim() !== page.redirectUrl?.trim()) {
            pre[item.trim()] = {
              url: item.trim(),
              redirectUrl: page.redirectUrl.trim(),
            };
          }
        });
      } else {
        pre[page.url] = {
          url: page.url,
          redirectUrl: page.redirectUrl,
        };
      }

      return pre;
    }, {});
}
export function composeDeliverQuery(queryDeliverBefore) {
  if (queryDeliverBefore?.length > 0) {
    return `lead_time[0]=0_${daysToDate(queryDeliverBefore[0].deadline)}&true=1`;
  }
  return '';
}

function _setPageDetail(detailPage) {
  const page = allPageMap[detailPage.key];
  if (page) {
    Object.keys(detailPage).forEach((k) => {
      if (!page[k]) {
        page[k] = detailPage[k];
      }
    });
    page.isLoaded = true;
  }
}

export function reqeustAndFillPageDetailIfNeeded(url) {
  const { key, isLoaded } = getPageByUrl(url) || {};
  if (isLoaded) {
    return Promise.resolve();
  }
  return requestClient
    .get(
      `${__ONE_PIECE_WEB_SERVER_NAME__}${
        __ONE_PIECE_WEB_SERVER_NAME__ === 'http://localhost' ? `:${__PORT__}` : ''
      }${__BASE_ROUTE__}/api/category-seo`,
      {
        params: {
          key,
        },
      }
    )
    .then((data) => {
      _setPageDetail(data);
      return data;
    });
}
