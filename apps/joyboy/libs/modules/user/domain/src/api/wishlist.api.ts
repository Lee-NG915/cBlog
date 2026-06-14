/* eslint-disable */
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { api } from '@castlery/shared-redux-services';
import { v4 as uuidV4 } from 'uuid';
import { TheLookWishListItem, WishListItem } from '../entity/wishList.entity';
export const wishlistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWishList: builder.query<WishListItem[], void>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        try {
          const accessToken = makePersistenceHandles().webAccessToken.getItem();
          const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
          const wishItemGuestToken = makePersistenceHandles().wishItemGuestToken.getItem();
          const guestToken = makePersistenceHandles().guestToken.getItem() || wishItemGuestToken || wishlistToken;

          let wishlistResult: any;

          // 如果有 accessToken，尝试合并
          if (accessToken) {
            if (guestToken) {
              // 有 guestToken，发出合并请求
              wishlistResult = await baseQuery({
                url: '/wish_items/merge',
                method: 'PUT',
                headers: { 'X-Guest-Token': guestToken },
                credentials: 'include',
              });
              makePersistenceHandles().guestToken.removeItem();
              makePersistenceHandles().wishItemGuestToken.removeItem();
              makePersistenceHandles().wishlistToken.removeItem();
            } else {
              // 直接获取 wish_items
              wishlistResult = await baseQuery({
                url: '/wish_items',
                method: 'GET',
                credentials: 'include',
              });
            }
          }
          // 没有 accessToken，但有 guestToken，获取 guestToken 的 wishlist
          else if (guestToken) {
            wishlistResult = await baseQuery({
              url: '/wish_items',
              method: 'GET',
              headers: { 'X-Guest-Token': guestToken },
              credentials: 'include',
            });
          } else {
            const newGuestToken = uuidV4() as string;
            makePersistenceHandles().guestToken.setItem(newGuestToken);
            wishlistResult = await baseQuery({
              url: '/wish_items',
              method: 'GET',
              headers: { 'X-Guest-Token': newGuestToken },
              credentials: 'include',
            });
          }

          // 如果获取 wishlist 失败，直接返回错误
          if (wishlistResult.error) {
            return { error: wishlistResult.error };
          }

          // 提取 variant ids
          const wishlistData = wishlistResult.data as any;
          if (!wishlistData || (Array.isArray(wishlistData) && wishlistData.length === 0)) {
            return { data: [] };
          }

          let variantIds: string;
          if (Array.isArray(wishlistData)) {
            variantIds = wishlistData
              .map((item: any) => item?.id)
              .filter(Boolean)
              .join(',');
          } else {
            return { data: [] };
          }

          const variantsResult = await baseQuery({
            url: `variants?ids=${variantIds.replace(/ /g, '')}`,
            method: 'GET',
          });

          if (variantsResult.error) {
            return { error: variantsResult.error };
          }

          return { data: variantsResult.data as WishListItem[] };

          // 如果没有 token，返回失败
          // return { error: { status: 401, data: 'Unauthorized' } };
        } catch (error) {
          return { error: { status: 500, data: 'Server Error' } };
        }
      },
    }),
    addWishlist: builder.mutation<WishListItem, string>({
      async queryFn(id, api, extraOptions, baseQuery) {
        const accessToken = makePersistenceHandles().webAccessToken.getItem();
        const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
        let guestToken = makePersistenceHandles().guestToken.getItem() || wishlistToken;

        let wishlistResult: any;

        if (accessToken) {
          try {
            wishlistResult = await baseQuery({
              url: `/wish_items/${id}`,
              method: 'POST',
              body: { id },
              credentials: 'include',
            });
          } catch (error: any) {
            return { error: error.message };
          }
        } else {
          if (!guestToken) {
            guestToken = uuidV4() as string;
            makePersistenceHandles().guestToken.setItem(guestToken);
          }
          // 访客用户的请求
          try {
            wishlistResult = await baseQuery({
              url: `/wish_items/${id}`,
              method: 'POST',
              body: { id },
              headers: {
                'X-Guest-Token': guestToken,
              },
              credentials: 'include',
            });
          } catch (error: any) {
            return { error: error.message };
          }
        }

        // 如果添加 wishlist 失败，返回错误
        if (wishlistResult.error) {
          return { error: wishlistResult.error };
        }

        // 从返回结果中获取 variant id
        const variantId = (wishlistResult.data as any)?.id;

        if (!variantId) {
          return {
            error: {
              status: 500,
              data: `Invalid variant id from API: ${variantId}`,
            },
          };
        }

        // 获取完整的 variant 数据
        const variantResult = await baseQuery({
          url: `variants?ids=${variantId}`,
          method: 'GET',
        });

        if (variantResult.error) {
          return { error: variantResult.error };
        }

        const variants = variantResult.data as WishListItem[];

        if (!variants || variants.length === 0) {
          return {
            error: {
              status: 500,
              data: `Failed to get variant data for id: ${variantId}`,
            },
          };
        }

        // 返回完整的 variant 数据
        return { data: variants[0] };
      },
    }),
    deleteWishlist: builder.mutation<void, string>({
      async queryFn(id, api, extraOptions, baseQuery) {
        try {
          const accessToken = makePersistenceHandles().webAccessToken.getItem();
          const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
          const guestToken = makePersistenceHandles().guestToken.getItem() || wishlistToken;

          // 登录用户的删除操作
          if (accessToken) {
            return await baseQuery({
              url: `/wish_items/${id}`,
              method: 'DELETE',
              credentials: 'include',
            });
          }

          // 访客用户需要 guestToken
          if (!guestToken) {
            return {
              error: {
                status: 401,
                data: 'Guest token is required for unauthenticated users',
              },
            };
          }

          // 访客用户的删除操作
          return await baseQuery({
            url: `/wish_items/${id}`,
            method: 'DELETE',
            headers: {
              'X-Guest-Token': guestToken,
            },
            credentials: 'include',
          });
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: error?.message || 'Failed to delete wishlist item',
            },
          };
        }
      },
    }),
  }),
});

// shop_the_look 的 wishlist
export const theLookWishlistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTheLookWishList: builder.query<TheLookWishListItem[], void>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        try {
          const accessToken = makePersistenceHandles().webAccessToken.getItem();
          const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
          let guestToken = makePersistenceHandles().guestToken.getItem() || wishlistToken;

          // 登录用户且有 guestToken，执行合并操作
          if (accessToken) {
            if (guestToken) {
              return await baseQuery({
                url: '/wish_items_looks/merge',
                method: 'PUT',
                headers: { 'X-Guest-Token': guestToken },
                credentials: 'include',
              });
            } else {
              return await baseQuery({
                url: '/wish_items_looks',
                method: 'GET',
                credentials: 'include',
              });
            }
          }

          // 确保访客用户有 guestToken
          if (!guestToken) {
            guestToken = uuidV4() as string;
            makePersistenceHandles().guestToken.setItem(guestToken);
          }

          return await baseQuery({
            url: '/wish_items_looks',
            method: 'GET',
            headers: { 'X-Guest-Token': guestToken },
            credentials: 'include',
          });
        } catch (error) {
          return { error: { status: 500, data: 'Server Error' } };
        }
      },
    }),
    addTheLookWishlist: builder.mutation<TheLookWishListItem, TheLookWishListItem>({
      async queryFn(payload, api, extraOptions, baseQuery) {
        try {
          const accessToken = makePersistenceHandles().webAccessToken.getItem();
          const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
          let guestToken = makePersistenceHandles().guestToken.getItem() || wishlistToken;

          // 登录用户的添加操作
          if (accessToken) {
            return await baseQuery({
              url: `/wish_items_looks/${payload.shop_the_look_id}`,
              method: 'POST',
              body: payload,
              headers: {
                Authorization: 'strict',
              },
              credentials: 'include',
            });
          }

          // 确保访客用户有 guestToken
          if (!guestToken) {
            guestToken = uuidV4() as string;
            makePersistenceHandles().guestToken.setItem(guestToken);
          }

          // 访客用户的添加操作
          return await baseQuery({
            url: `/wish_items_looks/${payload.shop_the_look_id}`,
            method: 'POST',
            body: payload,
            headers: {
              'X-Guest-Token': guestToken,
            },
            credentials: 'include',
          });
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: error?.message || 'Failed to add the look wishlist item',
            },
          };
        }
      },
    }),
    deleteTheLookWishlist: builder.mutation<TheLookWishListItem, string>({
      async queryFn(shop_the_look_id, api, extraOptions, baseQuery) {
        try {
          const accessToken = makePersistenceHandles().webAccessToken.getItem();
          const wishlistToken = makePersistenceHandles().wishlistToken.getItem();
          const guestToken = makePersistenceHandles().guestToken.getItem() || wishlistToken;

          // 登录用户的删除操作
          if (accessToken) {
            return await baseQuery({
              url: `/wish_items_looks/${shop_the_look_id}`,
              method: 'DELETE',
              credentials: 'include',
            });
          }

          // 访客用户需要 guestToken
          if (!guestToken) {
            return {
              error: {
                status: 401,
                data: 'Guest token is required for unauthenticated users',
              },
            };
          }

          // 访客用户的删除操作
          return await baseQuery({
            url: `/wish_items_looks/${shop_the_look_id}`,
            method: 'DELETE',
            headers: {
              'X-Guest-Token': guestToken,
            },
            credentials: 'include',
          });
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: error?.message || 'Failed to delete the look wishlist item',
            },
          };
        }
      },
    }),
  }),
});

export const { useGetTheLookWishListQuery, useAddTheLookWishlistMutation, useDeleteTheLookWishlistMutation } =
  theLookWishlistApi;
export const { getTheLookWishList, addTheLookWishlist, deleteTheLookWishlist } = theLookWishlistApi.endpoints;
export const getTheLookWishListSelect = () => getTheLookWishList.select();

export const { useGetWishListQuery } = wishlistApi;
export const { getWishList, addWishlist, deleteWishlist } = wishlistApi.endpoints;
export const getWishListSelect = () => getWishList.select();
