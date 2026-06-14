import type { AppStartListening, RootState } from '@castlery/shared-redux-store';
import {
  tokenRefreshedEvent,
  tokenReceived,
  Tokens,
  getCurrentAdmin,
  EnterAppEvent,
  getUserByUid,
  setCustomer,
  customerUpdatedEvent,
  loggedOutEvent,
  selectedCustomerId,
  InitWishListEvent,
  getWishList,
  // getTheLookWishList,
  setWishList,
  // setTheLookWishList,
  TheLookWishListEvent,
  getCurrentUser,
  setUser,
  getCustomerAddress,
  customerApiErrorEvent,
  customerAddressUpdatedEvent,
  userSliceUpdatedEvent,
  setCustomerAddress,
  userAddressGetEvent,
  customerReviewUpdatedEvent,
  getCustomerReviews,
  setCustomerReviews,
  customerReviewGetEvent,
  userProfileUpdatedEvent,
  userSubscriptionsGetEvent,
  setUserSubscriptions,
  getUserSubscriptions,
  login,
  googleLogin,
  appleLogin,
  createUserFromWebChannel,
  resetPosUmsPermission,
  resetPosUmsUserInfo,
} from '@castlery/modules-user-domain';
import { PayloadAction, Unsubscribe, isAnyOf } from '@reduxjs/toolkit';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { EcEnv, enableZipCode } from '@castlery/config';
// TODO: 这里需要优化 @abby
// eslint-disable-next-line @nx/enforce-module-boundaries
import { resetAutoOnlineCartSymbol } from '@castlery/modules-composite-services';
import {
  EVENT_CUSTOMER_IDENTIFY,
  EVENT_CUSTOMER_IDENTIFY_GA,
  EVENT_PAGE_VIEW_AFTER_AUTH_BY_MODAL,
  trackUserIdentify,
} from '@castlery/modules-tracking-services';
import { User } from '@castlery/types';
import {
  captureStructuredError,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  isUserInputError,
} from '@castlery/observability/client';
import { sharedFeatureService } from '@castlery/shared-services';
import { PosUmsAuthService } from './lib/ums-auth/ums-auth.service';
import { clearPosUmsInfoCache } from './lib/ums-auth/ums-api';
import { clearPosUmsLoginSession } from './lib/ums-auth/ums-session.helper';

let handlingPosUmsCurrentUserForbidden = false;

function getPosUmsCurrentUserForbiddenMessage(payload: any): string {
  return payload?.data?.errors?.[0]?.detail || payload?.data?.errors?.[0]?.title || 'Access denied';
}

/**
 * Subscribes counter listeners and returns a `teardown` function.
 * @example
 * ```ts
 * useEffect(() => {
 *   const unsubscribe = setupCounterListeners();
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function setupUserListeners(startListening: AppStartListening, { modal }: { modal: any }): Unsubscribe {
  const subscriptions = [
    startListening({
      matcher: isAnyOf(getCurrentUser.matchRejected, getCurrentAdmin.matchRejected),
      effect: async (action, { dispatch }) => {
        const payload = action['payload'] as { status?: number | string; data?: unknown } | undefined;

        if (
          EcEnv.NEXT_PUBLIC_CHANNEL !== 'POS' ||
          !sharedFeatureService.enabledPosUmsAuth ||
          handlingPosUmsCurrentUserForbidden ||
          payload?.status !== 403
        ) {
          return;
        }

        handlingPosUmsCurrentUserForbidden = true;

        modal.warning({
          title: 'Oops!',
          desc: getPosUmsCurrentUserForbiddenMessage(payload),
          showCloseBtn: false,
          showCancelBtn: false,
          disabledCloseByClickBackdrop: true,
          confirmText: 'Got it',
          onConfirm: async () => {
            const locale = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
            const service = PosUmsAuthService.getInstance(locale);

            clearPosUmsInfoCache();
            dispatch(resetPosUmsPermission());
            dispatch(resetPosUmsUserInfo());

            try {
              await service.signoutRedirect({
                state: {
                  postLogoutRedirectPath: '/',
                },
              });
            } catch {
              await clearPosUmsLoginSession({
                locale,
                clearRetailContext: true,
                authService: service,
              });
              window.location.replace('/');
            }
          },
        });
      },
    }),
    /* -------------------------------------------------------------------------- */
    /*                         电商核心流程：登录/注册监控                          */
    /* -------------------------------------------------------------------------- */
    // 登录成功 - 面包屑追踪
    startListening({
      matcher: login.matchFulfilled,
      effect: (action) => {
        const username = action.meta?.arg?.originalArgs?.username;

        // 添加面包屑
        addBreadcrumb({
          message: 'User logged in',
          data: { username, method: 'email' },
        });
      },
    }),

    // 注意：login 是用户交互操作，错误捕获应该在组件层处理
    // 监听层不处理用户交互操作的错误，避免时序问题和重复捕获

    // Google 登录成功
    startListening({
      matcher: googleLogin.matchFulfilled,
      effect: () => {
        // 添加面包屑
        addBreadcrumb({
          message: 'User logged in',
          data: { method: 'google' },
        });
      },
    }),

    // 注意：googleLogin 是用户交互操作，错误捕获应该在组件层处理

    // Apple 登录成功
    startListening({
      matcher: appleLogin.matchFulfilled,
      effect: () => {
        // 添加面包屑
        addBreadcrumb({
          message: 'User logged in',
          data: { method: 'apple' },
        });
      },
    }),

    // 注意：appleLogin 是用户交互操作，错误捕获应该在组件层处理

    // 注册成功 - 面包屑追踪
    startListening({
      matcher: createUserFromWebChannel.matchFulfilled,
      effect: (action) => {
        const email = action.meta?.arg?.originalArgs?.email;
        addBreadcrumb({
          message: 'User registered',
          data: { email },
        });
      },
    }),

    // 注意：createUserFromWebChannel 是用户交互操作，错误捕获应该在组件层处理

    /* -------------------------------------------------------------------------- */
    /*                                    共享                                     */
    /* -------------------------------------------------------------------------- */
    // startListening({
    //   matcher: isAnyOf(InitWishListEvent, TheLookWishListEvent),
    //   effect: async (action, { dispatch }) => {
    //     const result: any = await Promise.allSettled([
    //       dispatch(getWishList.initiate(undefined, { forceRefetch: true })),
    //       dispatch(getTheLookWishList.initiate(undefined, { forceRefetch: true })),
    //     ]);

    //     await Promise.allSettled([
    //       dispatch(setWishList(result[0].value?.data || [])),
    //       dispatch(setTheLookWishList(result[1].value?.data || [])),
    //     ]);
    //   },
    // }),
    // the look wishlist
    // startListening({
    //   matcher: TheLookWishListEvent,
    //   effect: async (action, { dispatch }) => {
    //     console.log('--------TheLook的监听器----------');

    //     const result: any = await Promise.allSettled([
    //       dispatch(getWishList.initiate()),
    //       dispatch(getTheLookWishList.initiate()),
    //     ]);
    //     await Promise.allSettled([
    //       dispatch(setWishList(result[0].value?.data || [])),
    //       dispatch(setTheLookWishList(result[1].value?.data || [])),
    //     ]);
    //   },
    // }),
    startListening({
      // 登出的时候
      actionCreator: loggedOutEvent,
      effect: (action, { extra }) => {
        // 清除 Sentry 用户上下文
        clearUserContext();
        // 清空结算流程session token
        const { persistenceHandles } = extra as ExtraArgument;
        persistenceHandles.xCheckoutSessionToken.removeItem();
        persistenceHandles.shippingMethodStepConfirmed.removeItem();
        persistenceHandles.paymentPageNonZeroVisited.removeItem();
        location.reload();
      },
    }),
    startListening({
      // 登录 或者 刷新token 的时候
      matcher: tokenRefreshedEvent,
      // matcher: isAnyOf(loggedInEvent, tokenRefreshedEvent),
      effect: async (action: PayloadAction<Tokens>, { dispatch }) => {
        const { payload } = action;
        await dispatch(tokenReceived(payload));
        await dispatch(getCurrentAdmin.initiate());
        //事件上报
      },
    }),

    /* -------------------------------------------------------------------------- */
    /*                                  POS 独享                                   */
    /* -------------------------------------------------------------------------- */
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && [
      startListening({
        actionCreator: EnterAppEvent,
        effect: async (action, { dispatch }) => {
          await dispatch(getCurrentAdmin.initiate());
        },
      }),
      startListening({
        actionCreator: EnterAppEvent,
        effect: async ({ payload }) => {
          // 更新page title
          let title = '';
          switch (payload) {
            case 'checkout':
              title = 'Checkout';
              break;
            case 'SALES HISTORY':
              title = 'Sales History';
              break;
            default:
              title = 'Castlery POS';
              break;
          }
          document.title = title;
        },
      }),
      /**
       * 更新 customer 到 store
       */
      startListening({
        actionCreator: EnterAppEvent,
        effect: async (action, { dispatch, extra, getState }) => {
          const rootState = getState() as RootState;
          const customerIdFromRedux = selectedCustomerId(rootState);
          const { persistenceHandles } = extra as ExtraArgument;
          const customerIdFromLocalStorage = Number(await persistenceHandles.customerId.getItem());
          if (customerIdFromRedux && customerIdFromLocalStorage && customerIdFromLocalStorage === customerIdFromRedux) {
            return;
          }

          if (customerIdFromLocalStorage) {
            // 获取用户信息
            const { data, error } = await dispatch(getUserByUid.initiate(customerIdFromLocalStorage));
            if (error) {
              return;
            }
            if (data) {
              dispatch(setCustomer(data));
            }
          } else {
            dispatch(resetAutoOnlineCartSymbol());
          }
        },
      }),
      // customer 变化的时候 更新到 localStorage
      startListening({
        actionCreator: customerUpdatedEvent,
        effect: (action, { extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          const customer = action.payload;
          persistenceHandles.customerId.setItem(customer?.id + '');
          persistenceHandles.temporaryCustomerEmail.setItem(customer?.email || '');
          persistenceHandles.autoAppliedCoupon.removeItem();
        },
      }),
    ]) ||
      []),
    /* -------------------------------------------------------------------------- */
    /*                                  WEB 独享                                   */
    /* -------------------------------------------------------------------------- */
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' && [
      startListening({
        actionCreator: EnterAppEvent,
        effect: async (action, { dispatch, extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          const webAccessToken = persistenceHandles.webAccessToken.getItem();
          if (webAccessToken) {
            const { data, error } = await dispatch(getCurrentUser.initiate(undefined, { forceRefetch: true }));
            if (error) {
              return;
            }
            if (data) {
              dispatch(setUser(data));
              if (action.payload === 'Signup' || action.payload === 'Signin') {
                const result = await dispatch(getWishList.initiate(undefined, { forceRefetch: false }));
                // const result = await dispatch(getWishList.initiate(undefined, { forceRefetch: true }));
                if (result.data) {
                  dispatch(setWishList(result.data));
                }
                dispatch(
                  EVENT_CUSTOMER_IDENTIFY_GA({
                    isSignin: action.payload === 'Signin',
                    isSignup: action.payload === 'Signup',
                  })
                );
              }

              // 设置 Sentry 用户上下文（防御性：确保 id 存在）
              if (data?.id) {
                setUserContext({
                  id: String(data.id),
                });
              }

              dispatch(
                EVENT_CUSTOMER_IDENTIFY({
                  isSignup: action.payload === 'Signup',
                  isSignin: action.payload === 'Signin',
                })
              );
              if (action.payload === 'Signup' || action.payload === 'Signin') {
                dispatch(EVENT_PAGE_VIEW_AFTER_AUTH_BY_MODAL({ customer: data as User }));
              }
            }
          }
        },
      }),
      startListening({
        matcher: isAnyOf(InitWishListEvent, TheLookWishListEvent, EnterAppEvent),
        effect: async (action, { dispatch, extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          const webAccessToken = persistenceHandles.webAccessToken.getItem();
          if (action.type === EnterAppEvent.type && action['payload'] !== 'Signin' && action['payload'] !== 'Signup') {
            return;
          }
          const result: any = await Promise.allSettled([
            dispatch(getWishList.initiate(undefined, { forceRefetch: true })),
          ]);

          await Promise.allSettled([
            dispatch(setWishList(result[0].value?.data || [])),
            // dispatch(setTheLookWishList(result[1].value?.data || [])),
          ]);
          if (webAccessToken) {
            persistenceHandles.guestToken.removeItem();
            persistenceHandles.wishlistToken.removeItem();
            persistenceHandles.wishItemGuestToken.removeItem();
          }
        },
      }),
      startListening({
        matcher: isAnyOf(InitWishListEvent, TheLookWishListEvent, EnterAppEvent),
        effect: async (action, { dispatch, extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          const webAccessToken = persistenceHandles.webAccessToken.getItem();
          if (action.type === EnterAppEvent.type && action['payload'] !== 'Signin' && action['payload'] !== 'Signup') {
            return;
          }
          const result: any = await Promise.allSettled([
            dispatch(getWishList.initiate(undefined, { forceRefetch: false })),
            // dispatch(getTheLookWishList.initiate(undefined, { forceRefetch: true })),
          ]);

          await Promise.allSettled([
            dispatch(setWishList(result[0].value?.data || [])),
            // dispatch(setTheLookWishList(result[1].value?.data || [])),
          ]);
          if (webAccessToken) {
            persistenceHandles.guestToken.removeItem();
            persistenceHandles.wishlistToken.removeItem();
            persistenceHandles.wishItemGuestToken.removeItem();
          }
        },
      }),
      startListening({
        matcher: userProfileUpdatedEvent,
        effect: async (action, { dispatch }) => {
          // dispatch(getUserSubscriptions.initiate(undefined, { forceRefetch: true }));
          const { data, error } = await dispatch(getCurrentUser.initiate(undefined, { forceRefetch: true }));
          if (error) {
            return;
          }
          if (data) {
            dispatch(setUser(data));

            // 设置 Sentry 用户上下文（防御性：确保 id 存在）
            if (data?.id) {
              setUserContext({
                id: String(data.id),
              });
            }
          }
        },
      }),
      startListening({
        matcher: userSubscriptionsGetEvent,
        effect: async (action, { dispatch }) => {
          const subscriptions = action.payload;
          if (subscriptions) {
            dispatch(setUserSubscriptions(subscriptions));
          }
        },
      }),
      startListening({
        matcher: customerApiErrorEvent,
        effect: (action) => {
          const extractErrorMessage = (payload: any): string => {
            try {
              // 安全地提取错误信息，避免 JSON 序列化问题
              if (!payload) return 'Something went wrong';

              // 直接访问属性，不使用 JSON 序列化
              const data = payload.data;
              if (data?.errors?.length > 0) {
                return data.errors[0]?.detail || data.errors[0]?.title || 'Something went wrong';
              }

              // 检查其他可能的错误格式
              if (data?.message) return data.message;
              if (data?.error) return data.error;
              if (payload.message) return payload.message;
              if (payload.error) return payload.error;

              return 'Something went wrong';
            } catch (err) {
              // 如果提取过程中出现任何错误，返回默认消息
              console.warn('Error extracting error message:', err);
              return 'Something went wrong';
            }
          };

          const error = extractErrorMessage(action.payload);
          modal.warning({
            title: 'Oops!',
            desc: error,
            showCancelBtn: false,
            confirmText: 'Got it',
          });
        },
      }),
      startListening({
        matcher: customerAddressUpdatedEvent,
        effect: async (action, { dispatch }) => {
          dispatch(getCustomerAddress.initiate(undefined, { forceRefetch: true }));
        },
      }),
      startListening({
        matcher: userAddressGetEvent,
        effect: async (action, { dispatch }) => {
          const address = action.payload;
          if (address) {
            dispatch(setCustomerAddress(address));
          }
        },
      }),
      startListening({
        matcher: customerReviewUpdatedEvent,
        effect: async (action, { dispatch }) => {
          dispatch(getCustomerReviews.initiate(undefined, { forceRefetch: true }));
        },
      }),
      startListening({
        matcher: customerReviewGetEvent,
        effect: (action, { dispatch }) => {
          const reviews = action.payload;
          if (reviews) {
            dispatch(setCustomerReviews(reviews));
          }
        },
      }),
    ]) ||
      []),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
