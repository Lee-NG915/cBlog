import { getStoryblokApi } from '@storyblok/react';
import { isProd } from 'config';
import { getDate, getTimestamp } from 'utils/time';
import { load as loadRecommendations } from 'redux/modules/dyApiData';
import { load as loadStoyblokProducts } from './storyblokProductListing';

const LOAD = 'storyblokBlogPage/LOAD';
const LOAD_SUCCESS = 'storyblokBlogPage/LOAD_SUCCESS';
const LOAD_FAIL = 'storyblokBlogPage/LOAD_FAIL';

const initialState = {};

export default function storyblokBlogPage(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.slug]: {
          loading: true,
        },
      };
    case LOAD_SUCCESS:
      // eslint-disable-next-line no-case-declarations
      let helmetData = {};
      // eslint-disable-next-line
      let hasYotpoTemplate = false;
      if (action.result.data?.story) {
        const story = action.result.data.story;
        if (story.content?.body?.length > 0) {
          for (const item of story.content.body) {
            const { component } = item || {};
            if (component === 'yotpo-template') {
              hasYotpoTemplate = true;
              break;
            }
          }
        }
        const blogBannerInfo = {};
        story.content.body.forEach((item) => {
          if (item.component === 'blog-banner') {
            if (item.image?.[0]) {
              blogBannerInfo.image = item.image?.[0].desktop_url || '';
            }
            blogBannerInfo.author = item?.author;
            blogBannerInfo.title = item?.articleTitle || '';
            item.publishDate = story?.first_published_at || '';
          }
        });
        helmetData = {
          pathname: story.slug || '',
          title: blogBannerInfo?.title,
          metaTitle: story.content?.meta[0]?.title || '',
          description: story.content?.meta[0]?.description || '',
          keywords: story.content?.meta[0]?.keywords || '',
          image: blogBannerInfo?.image,
          name: blogBannerInfo?.author,
          published_time: getDate(story?.first_published_at).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || '',
          modified_time: getDate(story?.published_at).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || '',
        };
      }
      return {
        ...state,
        [action.slug]: {
          loading: false,
          data: action.result.data?.story,
          helmetData,
          hasYotpoTemplate,
        },
      };
    case LOAD_FAIL:
      return {
        ...state,
        [action.slug]: {
          loading: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}

export function load(slug) {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: async () => {
        const storyblokApi = getStoryblokApi();
        const params = {
          version: isProd ? 'published' : 'draft',
          cv: getTimestamp(),
        };
        // https://www.storyblok.com/docs/api/content-delivery/v2#core-resources/stories/retrieve-one-story
        // GET /v2/cdn/stories/(:full_slug|:id|:uuid)
        const response = await storyblokApi.get(`cdn/stories/${slug}`, params);

        const storyBody = response?.data?.story?.content?.body || [];
        if (storyBody.length > 0) {
          for (const item of storyBody) {
            const { _uid, component, product_id: productId, items, selector_name: selectorName } = item || {};
            if (component === 'detailed-product-listing' || component === 'simple-product-listing') {
              if (productId) {
                await dispatch(loadStoyblokProducts({ uid: _uid, productId }));
              }
            } else if (component === 'detailed-listing' || component === 'simple-listing') {
              if (items?.length > 0) {
                const productId = items
                  .filter(
                    (subItem) =>
                      subItem.component === 'detailed-product-listing' || subItem.component === 'simple-product-listing'
                  )
                  ?.map((product) => product.product_id)
                  ?.filter(Boolean);

                if (productId.length > 0) {
                  await dispatch(loadStoyblokProducts({ uid: _uid, productId }));
                }
              }
            }

            if (component === 'dynamic-yield-embed' && selectorName) {
              await dispatch(
                loadRecommendations({
                  selectorArray: [selectorName],
                })
              );
            }
          }
        }

        return response;
      },
      slug,
    });
}

function needLoad(slug, storyblokBlogPage) {
  return slug && !storyblokBlogPage?.[slug]?.data;
}

export function loadIfNeeded(slug) {
  return (dispatch, getState) => {
    if (needLoad(slug, getState().storyblokBlogPage)) {
      return dispatch(load(slug));
    }
    return Promise.resolve(getState().storyblokBlogPage[slug].data);
  };
}
