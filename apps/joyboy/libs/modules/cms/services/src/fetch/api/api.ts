import { getStoryblokApi, ISbStoriesParams, StoryblokClient } from '@storyblok/react';
// import { getFromCache, setToCache } from '../../cache/cache';
import { getTimestamp, isProd } from '../../utils';
import { unstable_cache } from 'next/cache';
import { EcEnv } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { v4 as uuidV4 } from 'uuid';
import { logger } from '@castlery/observability';
import { fetchFromBackendApi } from '@castlery/modules-cms-domain/server';
// import { unstable_cache } from 'next/cache';

// TODO @carl 我不是很理解 为啥要这么写 直接使用redux来获取就好了 正常情况 对应的几个接口 没必要一定要在服务端运行
const fetchKnightApi = async ({ slug }: { slug: string }): Promise<any> => {
  try {
    // const data = await get(
    //   `${API_URL}/${slug}`,
    //   {
    //     nextOption: {
    //       tags: [`web-fetch-knight-${slug}`],
    //       revalidate: EcEnv.NEXT_PUBLIC_KNIGHT_API_REVALIDATE_TIME,
    //     },
    //   },
    //   undefined,
    //   1
    // );
    const data = await fetchFromBackendApi(slug);
    const optimizedData = data?.children?.map((item) => ({
      name: item.name,
      url: item.url,
      image: item?.thumbnail || item.image,
      permalink: item?.permalink,
      children:
        item?.children?.length > 0
          ? item.children.map(({ name, url, thumbnail, image, permalink }) => ({
              name,
              url,
              image: thumbnail || image,
              permalink,
            }))
          : [],
    }));
    return {
      children: optimizedData,
    };
  } catch (e) {
    logger.debug('fetchKnightApi error', { error: e, slug });
    // throw new Error(`Failed to fetch API: ${e}`);
  }
};

const fetchStoryblokApi = async ({ slug }: { slug: string }): Promise<any> => {
  try {
    const storyblokApi = getStoryblokApi();
    const storyblokApiFetch = unstable_cache(
      async () => {
        return await storyblokApi.get(`cdn/stories/${slug}`, {
          version: isProd ? 'published' : 'draft',
          cv: getTimestamp(),
        });
      },
      [`${slug}`],
      {
        tags: [`${slug}`],
        revalidate: EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
      }
    );
    const stories = await storyblokApiFetch();
    return stories;
  } catch (e) {
    logger.error('Error in fetchStoryblokApi', { error: e, slug });
    throw e;
  }
};

const fetchStoryblokPagesCombined = async ({
  page,
  contentType,
}: {
  page: number;
  contentType: string;
}): Promise<any> => {
  try {
    const storyblokApi = getStoryblokApi();
    const storyblokApiFetch = unstable_cache(
      async () => {
        return await storyblokApi.get('cdn/stories', {
          version: isProd ? 'published' : 'draft',
          starts_with: `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/general-content-v2/ugc-pgc/${
            contentType === 'Blog Page' ? 'blog' : ''
          }/`,
          cv: getTimestamp(),
          content_type: contentType,
          per_page: 100,
          page,
        });
      },
      [`web-cdn/stories&contentType=${contentType}&page=${page}`],
      {
        tags: [`web-cdn/stories&contentType=${contentType}&page=${page}`],
        revalidate: EcEnv.NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME,
      }
    );
    const stories = await storyblokApiFetch();
    return stories;
  } catch (e) {
    logger.error('Error in fetchStoryblokPagesCombined', { error: e, page, contentType });
    throw e;
  }
};

const getStoryblokProductList = async (productId: string | string[]) => {
  try {
    const res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/product/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          bool: {
            must: {
              ids: {
                values: [...(Array.isArray(productId) ? productId : [productId])],
              },
            },
            filter: {
              nested: {
                path: 'variants',
                query: {
                  bool: {
                    filter: {
                      exists: {
                        field: 'variants',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const hits = data?.hits?.hits;
      const result: { [key: string]: any } = {};
      if (Array.isArray(hits) && hits.length > 0) {
        hits.forEach((item) => {
          result[item._id] = item._source;
        });
      }
      return Promise.resolve(result);
    }
    throw new Error('Failed to fetch product list');
  } catch (e) {
    return Promise.resolve({});
  }
};

const postSubscribeToKlaviyoList = async (data: { email: string; source: string; list: string[] }) => {
  const res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/users/subscriptions/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    return res.json();
  }
  throw new Error('Failed to subscribe to Klaviyo list');
};

const fetchBlogsFromStoryblok = async ({ storyblokApi }: { storyblokApi: StoryblokClient }): Promise<any> => {
  const sbParams: ISbStoriesParams = {};

  const res = await storyblokApi.get('cdn/stories', {
    version: 'draft',
    cv: getTimestamp(),
    ...sbParams,
  });
  return res;
};

const getProductBySKU = async (sku: string) => {
  const res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/v3/products/${sku}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.ok) {
    return res.json();
  }
  throw new Error('Failed to fetch product by SKU');
};

const addToOrder = async (data: { number: string; quantity: number; variant_id: number; source?: string }) => {
  const { number, source, ...rest } = data;
  const webOrderToken = makePersistenceHandles().webOrderToken.getItem() || '';
  const accessToken = makePersistenceHandles().webAccessToken.getItem() || '';

  try {
    const res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/checkouts/${number}/line_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Channel': 'web',
        'X-Spree-Order-Token': webOrderToken,
        'X-Access-Token': accessToken,
      },
      body: JSON.stringify(rest),
    });

    // 获取响应内容（无论成功还是失败）
    const responseText = await res.text();

    if (res.ok) {
      // 如果响应成功，尝试解析 JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        logger.warn('addToOrder JSON parse error', { error: parseError });
        result = responseText;
      }
      logger.info('addToOrder result', { result });
      return result;
    }

    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch (parseError) {
      errorData = responseText;
    }

    throw new Error(`Failed to add to order: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
  } catch (error) {
    logger.error('addToOrder catch error', { error });
    throw error;
  }
};

const getWishlist = async () => {
  const accessToken = makePersistenceHandles().webAccessToken.getItem();
  const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
  const guestToken = makePersistenceHandles().wishItemGuestToken.getItem() || wishlistToken;

  let res;

  if (accessToken) {
    if (guestToken) {
      res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items/merge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Token': guestToken,
          'X-Channel': 'web',
        },
        credentials: 'include',
      });
    } else {
      res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Channel': 'web',
          'X-Access-Token': accessToken,
        },
        credentials: 'include',
      });
    }
  }
  if (guestToken) {
    res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Token': guestToken,
        'X-Channel': 'web',
      },
      credentials: 'include',
    });
  } else {
    const newGuestToken = uuidV4() as string;
    res = await makePersistenceHandles().guestToken.setItem(newGuestToken);
    res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Token': newGuestToken,
        'X-Channel': 'web',
      },
      credentials: 'include',
    });
  }
  if (res.ok) {
    return res.json();
  }
  throw new Error('Failed to get wishlist');
};

const addToWishlist = async (data: { id: number }) => {
  const accessToken = makePersistenceHandles().webAccessToken.getItem();
  const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
  let guestToken = makePersistenceHandles().guestToken.getItem() || wishlistToken;

  let res;
  if (accessToken) {
    res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items/${data.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Channel': 'web',
        'X-Access-Token': accessToken,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  } else {
    if (!guestToken) {
      guestToken = uuidV4() as string;
      await makePersistenceHandles().guestToken.setItem(guestToken);
    }
    res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items/${data.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Channel': 'web',
        'X-Guest-Token': guestToken,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  }

  const responseText = await res.text();

  if (res.ok) {
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      result = responseText;
    }
    return result;
  }
  let errorData;
  try {
    errorData = JSON.parse(responseText);
  } catch (parseError) {
    errorData = responseText;
  }
  throw new Error(`Failed to add to wishlist: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
};

const removeFromWishlist = async (data: { id: number }) => {
  const accessToken = makePersistenceHandles().webAccessToken.getItem();
  const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
  let guestToken = makePersistenceHandles().guestToken.getItem() || wishlistToken;
  try {
    let res;
    if (accessToken) {
      res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items/${data.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Channel': 'web',
          'X-Access-Token': accessToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
    } else {
      if (!guestToken) {
        guestToken = uuidV4() as string;
        await makePersistenceHandles().guestToken.setItem(guestToken);
      }
      res = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/wish_items/${data.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Token': guestToken,
          'X-Channel': 'web',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
    }

    const responseText = await res.text();

    if (res.ok) {
      // 如果响应成功，尝试解析 JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = responseText;
      }
      return result;
    }

    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch (parseError) {
      errorData = responseText;
    }

    throw new Error(`Failed to add to order: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
  } catch (error) {
    logger.error('removeFromWishlist catch error', { error });
    throw error;
  }
};

export {
  fetchKnightApi,
  fetchStoryblokApi,
  fetchStoryblokPagesCombined,
  getStoryblokProductList,
  fetchBlogsFromStoryblok,
  postSubscribeToKlaviyoList,
  getProductBySKU,
  addToOrder,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
