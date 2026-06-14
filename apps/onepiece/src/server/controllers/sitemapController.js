import xml from 'xml';
import { countries } from 'config';
import { getHreflangTags } from 'utils/seo';
import { getDate } from 'utils/time';
import ApiClient from '../../helpers/ApiClient';
import logger from '../utils/logger';

const lastmod = getDate().format('YYYY-MM-DD');

export const renderSitemap = () => (req, res) => {
  // po is for homepage
  const client = new ApiClient();

  const sitemapRequests = countries.map((country) =>
    client.get(`${__HOST__}${country.route}/api/sitemap`, {
      auth: 'basic',
    })
  );

  Promise.all(sitemapRequests)
    .then((pages) => {
      const currentPage = pages.find((page) => page.home.includes(__BASE_ROUTE__));
      const urlSets = new Set();
      const sitemapUrls = Object.entries(currentPage).map(([key, url]) => {
        if (urlSets.has(url)) {
          return;
        }
        urlSets.add(url);
        return {
          url: [{ loc: url }, ...getHreflangTags(pages.map((page) => page[key])), { lastmod }],
        };
      });

      sitemapUrls.unshift({
        url: [
          {
            loc: currentPage?.home?.replace(__BASE_ROUTE__, ''),
          },
          ...getHreflangTags(pages.map((page) => page.home)),
          { lastmod },
        ],
      });

      const data = {
        urlset: [
          {
            _attr: {
              xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
              'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
            },
          },
          ...sitemapUrls,
        ],
      };

      res.set('Content-Type', 'text/xml');
      res.send(xml(data, { declaration: true }));
    })
    .catch((err) => {
      logger.log('error', 'renderSitemap', err);
      res.status(404).send('Not found');
    });
};
