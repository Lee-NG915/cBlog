// import { unstable_cache } from 'next/cache';
import { unstable_cache } from 'next/cache';
import { getTimestamp, isOutdated, isProd } from '../../utils';
import { fetchKnightApi, fetchStoryblokApi, fetchStoryblokPagesCombined } from '../api/api';
import { ISbStoriesParams, getStoryblokApi } from '@storyblok/react';
import * as Sentry from '@sentry/nextjs';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/server';
import {
  FetchInServerParams,
  SetStoryblokDataParams,
  StoryblokPageItemType,
  StoryblokPageRawItemType,
} from '@castlery/modules-cms-domain';

const fetchFromKnightServer = async ({ slugArray }: FetchInServerParams) => {
  const requestList = [];
  for (const slug of slugArray) {
    requestList.push(fetchKnightApi({ slug }));
  }
  try {
    const responses = await Promise.all(requestList);
    const results: SetStoryblokDataParams[] = responses.map((response, index) => ({
      slug: slugArray[index],
      // data: response.story.content,
      data: response,
    }));
    return results;
  } catch (e) {
    logger.error('fetchFromKnightServer error', { error: e, slugArray });
    Sentry.captureException(e);
    throw e;
  }
  // return null;
};

const fetchFromStoryblok = async ({ slugArray }: FetchInServerParams) => {
  const requestList = [];
  for (const slug of slugArray) {
    requestList.push(fetchStoryblokApi({ slug }));
  }
  try {
    const responses = await Promise.all(requestList);
    const results: SetStoryblokDataParams[] = responses.map((response, index) => ({
      slug: slugArray[index],
      data: response.data.story.content,
    }));
    return results;
  } catch (e) {
    logger.error('fetchFromStoryblok error', { error: e, slugArray });
    Sentry.captureException(e);
    throw e;
  }
  // return null;
};

const fetchAllStoriesByContentType = async ({ contentType }: { contentType: string }) => {
  let storyblokPages: StoryblokPageItemType[] = [];
  const PER_PAGE = 100;

  try {
    let page = 1;
    let shouldContinue = true;

    while (shouldContinue) {
      const { data } = await fetchStoryblokPagesCombined({ page, contentType });
      const storyblokData = data?.stories;

      if (!storyblokData) {
        shouldContinue = false;
        break;
      }

      if (storyblokData?.length > 0) {
        const currentPageStories = storyblokData.reduce(
          (acc: StoryblokPageItemType[], item: StoryblokPageRawItemType) => {
            const path = item.path || item.slug;
            const { title, description } = item.content?.meta?.[0] || {};
            let { published_at: publishedAt, ended_at: endedAt } = item.content?.timer?.[0] || {};
            let notIndexed = false;

            if (Array.isArray(item.content?.meta) && item.content?.meta?.length > 0) {
              notIndexed = item.content?.meta?.[0]?.notIndexed || false;
            }

            if (!publishedAt) {
              publishedAt = item.published_at;
            }

            if (!endedAt) {
              endedAt = undefined;
            }

            if (contentType === 'Blog Page') {
              item.bannerBackgroundImage = '';
              if (item.content?.body && Array.isArray(item.content.body) && item.content.body.length > 0) {
                if (item.content.body[0].component === 'blog-banner') {
                  item.bannerBackgroundImage = item.content.body[0].image?.[0]?.desktop_url || '';
                }
              }
            }

            const questionMarkIndex = path.indexOf('?');
            const hashIndex = path.indexOf('#');
            const query =
              questionMarkIndex !== -1
                ? path.substring(questionMarkIndex + 1, hashIndex !== -1 ? hashIndex : undefined)
                : '';
            const url = `/${path.substring(0, questionMarkIndex !== -1 ? questionMarkIndex : undefined)}`;

            if (!isOutdated(publishedAt, endedAt) && url) {
              const targetIndex = acc.findIndex((page) => page.url === url);
              const page: StoryblokPageItemType = {
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

              if (contentType === 'Blog Page') {
                page.bannerBackgroundImage = item.bannerBackgroundImage;
              }

              if (targetIndex !== -1) {
                acc.splice(targetIndex, 1, page);
              } else {
                acc.push(page);
              }
            }
            return acc;
          },
          []
        );
        storyblokPages = storyblokPages.concat(currentPageStories);
      }
      if (storyblokData?.length < PER_PAGE) {
        shouldContinue = false;
      }
      page += 1;
    }
  } catch (err) {
    logger.error('Storyblok page load failed', { error: err, contentType });
    throw err;
  }
  return storyblokPages;
};

const fetchFromStoryblokPage = async ({ slugArray }: FetchInServerParams) => {
  const storyblokApi = getStoryblokApi();
  const params = {
    version: isProd ? 'published' : 'draft',
    cv: getTimestamp(),
  } as ISbStoriesParams;
  const storyblokApiFetchFactory = (slug: string, fetchParams: ISbStoriesParams) => {
    return unstable_cache(
      async () => {
        return await storyblokApi.get(`cdn/stories/${slug}`, fetchParams);
      },
      [`${slug}`],
      {
        tags: [`${slug}`],
        revalidate: EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
      }
    );
  };
  const requestList = [];
  for (const slug of slugArray) {
    const storyblokApiFetch = storyblokApiFetchFactory(slug, params);
    requestList.push(storyblokApiFetch());
  }
  try {
    const responses = await Promise.all(requestList);
    const results: SetStoryblokDataParams[] = responses.map((response) => {
      return response.data.story;
    });
    return results;
  } catch (e) {
    logger.error('fetchFromStoryblokPage error', { error: e, slugArray });
    throw e;
  }
  // return null;
};

export { fetchFromKnightServer, fetchFromStoryblok, fetchAllStoriesByContentType, fetchFromStoryblokPage };
