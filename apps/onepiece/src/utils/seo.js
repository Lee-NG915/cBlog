import { countries, designers } from 'config';
import {
  getBasePages,
  getSeoCategoryPages,
  getSalePages,
  getTaxonomies,
  getCollections,
  getUrl,
  getStoryblokPages,
  getStoryblokBlogPages,
} from 'pages';
import ApiClient from 'helpers/ApiClient';
import { isOutdated } from 'utils/time';
import { traverseNestedArrayByChildren } from 'utils/common';
import commonPagesConfig from 'pages/commonPagesConfig';

export const getIndexable = (page) => {
  const expired = isOutdated(page.publishedAt, page.endedAt);
  // if (page?.notCanDisplay === true) {
  //   return false;
  // }
  return !page.disabled && !page.notIndexed && !page.notCanDisplay && !expired && page.url;
};

export const getSitemap = (type) => {
  const client = new ApiClient();

  return Promise.all([
    // get a array of object like [{id, slug}]
    client.get('/sitemap/products'),
    // get a array of object like [{author, content, cover, created_at, id, is_published, keywords, published_at, slug, title, updated_at}]
  ]).then(([products]) => {
    const rootLinks = getBasePages()
      .filter(getIndexable)
      .map((page) => ({
        type: 'root',
        url: page.url === '/' ? '' : page.url,
        key: page.key,
        name: page.name,
      }));
    const seoCategoryLinks = getSeoCategoryPages()
      .filter(getIndexable)
      .map((page) => ({
        type: 'seoCategory',
        url: page.url,
        key: page.key,
        name: page.name,
      }));
    const salePageLinks = getSalePages()
      .filter(getIndexable)
      .map((page) => ({
        type: 'storyblok',
        url: page.url === '/' ? '' : page.url,
        key: page.key,
        name: page.name,
      }));
    const storyblokPageLinks = getStoryblokPages()
      .filter(getIndexable)
      .map((page) => ({
        type: 'storyblok content page',
        url: page.url === '/' ? '' : page.url,
        key: page.key,
        name: page.name,
      }));
    const storyblokBlogPageLinks = getStoryblokBlogPages()
      .filter(getIndexable)
      .map((page) => ({
        type: 'storyblok blog content page',
        url: page.url === '/' ? '' : page.url,
        key: page.key,
        name: page.name,
      }));
    const allTaxons = [];
    traverseNestedArrayByChildren(getTaxonomies(), (item) => {
      allTaxons.push(item);
    });
    const TaxonomyLinks = allTaxons
      .filter((item) => item?.children?.length === 0)
      .filter(getIndexable)
      .map((page) => ({
        type: 'category',
        url: page.url,
        key: page.key,
      }));

    const collectionLinks = getCollections()
      .filter(getIndexable)
      .map((page) => ({
        type: 'collection',
        url: page.url,
        key: page.key,
        name: page.name,
      }));

    const productLinks = products.map((product) => ({
      type: 'product',
      url: `${getUrl('product')}/${product.slug}`,
      key: product.slug,
      name: product.name,
    }));
    const designerLinks = designers.filter(getIndexable).map((designer) => ({
      type: 'designer',
      url: `${getUrl('designers')}/${designer.key}`,
      key: designer.key,
      name: designer.name,
    }));
    const commonPagesLinks = commonPagesConfig.map((page) => ({
      type: 'common',
      url: page.url,
      key: page.key,
      name: page.name,
    }));

    const sitemapPageLinks = [
      {
        key: 'Sale',
        children: [...salePageLinks, ...seoCategoryLinks, ...storyblokPageLinks],
      },
      {
        key: 'Collections',
        children: collectionLinks,
      },
      {
        key: 'Furniture',
        children: productLinks,
      },
      {
        key: 'Internal Links',
        children: [
          ...rootLinks,
          ...commonPagesLinks.map((item) => ({
            ...item,
            href: `${__HOST__}${item.url}`,
          })),
        ],
      },
      {
        key: 'Blog',
        children: storyblokBlogPageLinks,
      },
    ];

    if (type === 'page') {
      return sitemapPageLinks;
    }

    const allPageLinks = [
      ...rootLinks,
      ...seoCategoryLinks,
      ...salePageLinks,
      ...storyblokPageLinks,
      ...storyblokBlogPageLinks,
      ...TaxonomyLinks,
      ...productLinks,
      ...designerLinks,
      ...commonPagesLinks,
    ];

    return allPageLinks.reduce((acc, cur) => {
      acc[cur.key] = cur.type === 'common' ? `${__HOST__}${cur.url}` : `${__BASE_URL__}${cur.url}`;
      return acc;
    }, {});
  });
};

export const getHreflangTags = (urls) => {
  const isAllSame = urls && urls.every((url) => url === urls[0]);
  const tags = countries
    .map((country, index) => ({
      hreflang: country.lang,
      href: urls[index],
    }))
    .filter((alternate) => alternate.href);

  const href = tags[0].href.match(/\/(us|au|sg|ca|uk)(.*)/);
  const allTags = [
    {
      hreflang: 'x-default',
      href: href?.[2] ? tags[0].href : tags[0].href.replace(href?.[0], '/'),
    },
    ...(isAllSame ? [] : tags), // if all urls are same, no need to add hreflang tags
  ];

  return allTags.map(({ hreflang, href }) => ({
    'xhtml:link': {
      _attr: { rel: 'alternate', hreflang, href },
    },
  }));
};
