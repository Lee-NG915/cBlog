import { initPages, composeDeliverQuery } from 'pages/index.js';
import { toCamel } from 'utils/common';
import { isOutdated, getTimestamp } from 'utils/time';
import { getStoryblokApi, storyblokInit, apiPlugin } from '@storyblok/react';
import { isProd } from 'config';
import logger from './logger';

// TODO 后续思考合并 storyblok 中 非 page 的请求，目前 sale-pages slug 的请求牵涉的有点多，之后再动

const requestStoryblokNav = (client) =>
  client
    .get(`/story_bloks/${__COUNTRY__.toLocaleLowerCase()}/general-configuration/universal-config-new-joyboy/global-nav`)
    .then((result) => {
      const data = result.story.content.items;
      let globalNav = [];
      if (data && Array.isArray(data)) {
        // global.__globalNav = data;
        globalNav = data;
      }
      return globalNav;
    });

const requestStoryblokTerms = (client) =>
  client.get(`/story_bloks/${__COUNTRY__.toLocaleLowerCase()}/general-content-v2/terms/terms-of-use`).then((result) => {
    const data = result?.story?.content?.termsHistory;
    // global.__termsHistory = data;
    const termsHistory = data;
    return termsHistory;
  });

const requestStoryblokMenu = (client) =>
  client
    .get(`/story_bloks/${__COUNTRY__.toLocaleLowerCase()}/general-configuration/universal-config-old-onepiece/menu`)
    .then((result) => {
      const data = result.story.content.items;
      const organizedData = data.reduce(
        (prev, current) => ({
          ...prev,
          [current.slug]: {
            blocks: current.blocks.filter((block) => !isOutdated(block.published_at, block.ended_at)),
            uid: current._uid,
            limit_num: current?.limit_num,
            disable: current?.disable === true,
          },
        }),
        {}
      );
      // global.__menuData = organizedData;
      const menuData = organizedData;
      return menuData;
    });

const requestStoryblokPages = (client) =>
  client
    .get(`/story_bloks/${__COUNTRY__.toLocaleLowerCase()}/general-content-v2/sale-pages/sale-pages`)
    .then((result) => {
      const sales = toCamel(result.story.content?.sale_pages || []);
      const seoPages = toCamel(result.story.content?.seo_pages || []);

      const data = sales.concat(seoPages);
      const filterData = data?.reduce((pre, item) => {
        const targetIndex = pre.findIndex((page) => page.path === item.path);
        if (targetIndex !== -1) {
          if (!isOutdated(item.publishedAt, item.endedAt)) {
            pre.splice(targetIndex, 1, item);
          }
        } else {
          pre.push(item);
        }

        return pre;
      }, []);

      // global.__salePages = filterData.map((page) => {
      const salePages = filterData.map((page) => {
        page.metaTitle = page.name;
        page.metaDescription = page.description;
        page.metaKeywords = page.keywords;
        page.name = page.bannerTitle;
        page.url = page.path;
        page.subTitle = page.bannerSubTitle;
        page.description = page.bannerIntro;
        page.image = page.bannerBackgroundImage;
        page.imageResponsive = page.bannerBackgroundImageMobile;
        page.imageWithText = page.bannerDesktopImage;
        page.imageWithTextResponsive = page.bannerMobileImage;
        page.permalink = '';
        page.deliverQuery = composeDeliverQuery(page.queryDeliverBefore);
        page.faqs =
          page.faqs?.map((faq) => ({
            question: faq?.questionText,
            answer: faq?.questionAnswer,
          })) || [];

        return page;
      });
      return salePages;
    });

const addAllCategory = (data) => {
  if (data) {
    return data?.map((item) => {
      const allUrl = item?.children?.find((child) => child?.name?.startsWith('All'))?.url;

      let { name } = item;
      if (item?.url?.trim() && !allUrl) {
        if (item.permalink === 'chairs') {
          name = 'Chairs & Benches';
        } else if (item.permalink === 'beds') {
          name = 'Bedroom';
        }
        name = `All ${name}`;
        item?.children?.unshift({
          ...item,
          name,
          children: [],
        });
      }
      return {
        ...item,
        url: item?.url?.trim(),
        nameWithAll: allUrl?.name || name,
      };
    });
  }
};

const requestTaxonomies = (client) =>
  Promise.all([client.get('/taxonomies/menu'), client.get('/taxonomies/collections')]).then(([result1, result2]) => {
    // global.__taxonomy = {
    const taxonomy = {
      categories: toCamel(addAllCategory(result1?.children) || []),
      collections: toCamel(result2?.children || []),
    };
    return taxonomy;
  });

const getBlogPages = async () => {
  const storyblokApi = getStoryblokApi();
  const PER_PAGE = 30;
  const params = {
    version: isProd ? 'published' : 'draft',
    content_type: 'Blog Page',
    cv: getTimestamp(),
    per_page: PER_PAGE,
    starts_with: `${__COUNTRY__.toLocaleLowerCase()}/general-content-v2/`,
  };
  let storyblokPages = [];
  try {
    let page = 1;
    let shouldContinue = true;
    while (shouldContinue) {
      const { data } = await storyblokApi.get('cdn/stories', { ...params, page });
      const storyblokData = data?.stories;

      if (!storyblokData) {
        shouldContinue = false;
        break;
      }

      if (storyblokData?.length > 0) {
        const currentPageStories = storyblokData.reduce((acc, item) => {
          const path = item.slug;
          const { title, description } = item.content?.meta?.[0] || {};
          item.bannerBackgroundImage = '';
          if (item.content?.body && Array.isArray(item.content.body) && item.content.body.length > 0) {
            if (item.content.body[0].component === 'blog-banner') {
              item.bannerBackgroundImage = item.content.body[0].image?.[0]?.desktop_url || '';
            }
          }
          const url = `/blog/${path}`;
          if (url) {
            const targetIndex = acc.findIndex((page) => page.url === url);
            const page = {
              key: item.full_slug,
              url,
              name: item.name,
              metaTitle: title || item.name,
              metaDescription: description || '',
              publishedAt: item.first_published_at,
              bannerBackgroundImage: item.bannerBackgroundImage,
            };

            if (page.key?.startsWith(`${__COUNTRY__.toLocaleLowerCase()}/`)) {
              if (targetIndex !== -1) {
                acc.splice(targetIndex, 1, page);
              } else {
                acc.push(page);
              }
            }
          }

          return acc;
        }, []);

        storyblokPages = storyblokPages.concat(currentPageStories);
      }

      if (storyblokData?.length < PER_PAGE) {
        shouldContinue = false;
      }

      page += 1;
    }
  } catch (e) {
    console.log(e);
  }
  // global.__storyblokBlogPages = storyblokPages;
  return storyblokPages;
};

const getAllStories = async (contentType) => {
  const storyblokApi = getStoryblokApi();
  const PER_PAGE = 30;
  const params = {
    version: isProd ? 'published' : 'draft',
    content_type: contentType,
    cv: getTimestamp(),
    per_page: PER_PAGE, // Default: 25, Max for Stories: 100,
    starts_with: `${__COUNTRY__.toLocaleLowerCase()}/general-content-v2/`,
  };
  let storyblokPages = [];

  try {
    let page = 1;
    let shouldContinue = true;

    while (shouldContinue) {
      const { data } = await storyblokApi.get('cdn/stories', { ...params, page });
      const storyblokData = data?.stories;

      if (!storyblokData) {
        shouldContinue = false;
        break;
      }

      if (storyblokData?.length > 0) {
        const currentPageStories = storyblokData.reduce((acc, item) => {
          const path = item.path || item.slug;
          const { title, description } = item.content?.meta?.[0] || {};
          const { published_at: publishedAt, ended_at: endedAt } = item.content?.timer?.[0] || {};
          let notIndexed = false;

          if (Array.isArray(item.content?.meta) && item.content?.meta?.length > 0) {
            notIndexed = item.content.meta[0]?.notIndexable;
          }

          const questionMarkIndex = path.indexOf('?');
          const hashIndex = path.indexOf('#');
          const query =
            questionMarkIndex !== -1
              ? path.substring(questionMarkIndex + 1, hashIndex !== -1 ? hashIndex : undefined)
              : '';
          let url = `/${path.substring(0, questionMarkIndex !== -1 ? questionMarkIndex : undefined)}`;
          if (item.full_slug?.startsWith(`${__COUNTRY__.toLocaleLowerCase()}/`)) {
            if (path?.startsWith(`${__COUNTRY__.toLocaleLowerCase()}/`)) {
              url = path.replace(`${__COUNTRY__.toLocaleLowerCase()}/`, '/');
            }
          }

          if (!isOutdated(publishedAt, endedAt) && url) {
            const targetIndex = acc.findIndex((page) => page.url === url);
            let page;
            if (contentType === 'Visual Sale Page') {
              item.content.key = item.full_slug;
              item.content.metaTitle = title || item.name;
              item.content.metaDescription = item.description || description || '';
              item.content.metaKeywords = item.keywords;
              item.content.name = item.bannerTitle || item.name;
              if (item.path?.startsWith(`${__COUNTRY__.toLocaleLowerCase()}/`)) {
                item.content.url = item.path.replace(`${__COUNTRY__.toLocaleLowerCase()}/`, '/');
              } else {
                item.content.url = `/${item.path}` || `/${item.slug}`;
              }
              item.content.subTitle = item.bannerSubTitle;
              item.content.description = item.bannerIntro;
              item.content.deliverQuery = composeDeliverQuery(item.queryDeliverBefore);
              item.content.publishedAt = item.content?.timer?.[0]?.published_at;
              item.content.endedAt = item.content?.timer?.[0]?.ended_at;
              item.content.faqs =
                item.faqs?.map((faq) => ({
                  question: faq?.questionText,
                  answer: faq?.questionAnswer,
                })) || [];
              item.content.bodySection = item.content.body_section;
              item.content.bottomSection = item.content.bottom_section;
              page = item.content;
            } else {
              page = {
                key: item.full_slug,
                url,
                query,
                name: item.name,
                metaTitle: title || item.name,
                metaDescription: description || '',
                publishedAt,
                endedAt,
                notIndexed,
              };
            }

            if (page.key?.startsWith(`${__COUNTRY__.toLocaleLowerCase()}/`)) {
              if (targetIndex !== -1) {
                acc.splice(targetIndex, 1, page);
              } else {
                acc.push(page);
              }
            }
          } else if (contentType === 'Visual Sale Page') {
            const targetIndex = acc.findIndex((page) => page.url === url);

            item.content.key = item.full_slug;
            item.content.metaTitle = title || item.name;
            item.content.metaDescription = item.description || description || '';
            item.content.metaKeywords = item.keywords;
            item.content.name = item.bannerTitle || item.name;
            if (item.path?.startsWith(`${__COUNTRY__.toLocaleLowerCase()}/`)) {
              item.content.url = item.path.replace(`${__COUNTRY__.toLocaleLowerCase()}/`, '/');
            } else {
              item.content.url = `/${item.path}` || `/${item.slug}`;
            }
            item.content.subTitle = item.bannerSubTitle;
            item.content.description = item.bannerIntro;
            item.content.deliverQuery = composeDeliverQuery(item.queryDeliverBefore);
            item.content.faqs =
              item.faqs?.map((faq) => ({
                question: faq?.questionText,
                answer: faq?.questionAnswer,
              })) || [];
            item.content.bodySection = item.content.body_section;
            item.content.bottomSection = item.content.bottom_section;
            item.content.publishedAt = item.content?.timer?.[0]?.published_at;
            item.content.endedAt = item.content?.timer?.[0]?.ended_at;
            const page = item.content;

            if (page.key?.startsWith(`${__COUNTRY__.toLocaleLowerCase()}/`)) {
              if (targetIndex !== -1) {
                acc.splice(targetIndex, 1, page);
              } else {
                acc.push(page);
              }
            }
          }

          return acc;
        }, []);

        storyblokPages = storyblokPages.concat(currentPageStories);
      }

      if (storyblokData?.length < PER_PAGE) {
        shouldContinue = false;
      }

      page += 1;
    }
  } catch (err) {
    console.log(err);
  }
  // if (contentType !== 'page') {
  //   global.__storyblokSalePages = storyblokPages;
  // } else {
  //   global.__storyblokPages = storyblokPages;
  // }
  return storyblokPages;
};

const fetchAndInitAppData = (client) =>
  Promise.all([
    requestTaxonomies(client),
    requestStoryblokPages(client),
    requestStoryblokNav(client),
    requestStoryblokMenu(client),
    requestStoryblokTerms(client),
    getBlogPages(),
    getAllStories('page'),
    getAllStories('Visual Sale Page'),
  ])
    .then((res) => {
      const [
        taxonomy,
        salePages,
        globalNavs,
        menuData,
        termsHistory,
        storyblokBlogPages,
        storyblokPages,
        storyblokSalePages,
      ] = res;
      global.__taxonomy = taxonomy;
      global.__salePages = salePages;
      global.__globalNav = globalNavs;
      global.__menuData = menuData;
      global.__termsHistory = termsHistory;
      global.__storyblokBlogPages = storyblokBlogPages;
      global.__storyblokPages = storyblokPages;
      global.__storyblokSalePages = storyblokSalePages;

      initPages();
    })
    .catch((err) => {
      logger.log('error', 'fetchAndInitAppData', err);
    });

const requestBeforeStartup = (client) => {
  storyblokInit({
    accessToken: __STORYBLOK_ACCESS_TOKEN__,
    use: [apiPlugin],
    components: [],
  });
  return fetchAndInitAppData(client).then(() => {
    // init pages on the server side
    // initPages();
    // fetch the latest routes
    setInterval(
      () => {
        fetchAndInitAppData(client);
      },
      __STORY_BLOKS_REFRESH_INTERVAL__ ? +__STORY_BLOKS_REFRESH_INTERVAL__ * 1000 : 60 * 1000
    );
  });
};
export default requestBeforeStartup;
