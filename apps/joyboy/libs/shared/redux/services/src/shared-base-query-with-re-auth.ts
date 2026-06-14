import { EcEnv, accessInPos } from '@castlery/config';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit/lib/persistenceHandles';
import { clearPosBridgeSession, redirectToPosLogin } from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { sharedFeatureService } from '@castlery/shared-services';
import { sharedPrepareHeaders } from './shared-prepare-headers';

// create a new mutex
const mutex = new Mutex();

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: EcEnv.NEXT_PUBLIC_API_HOST,
  // @ts-ignore
  prepareHeaders: sharedPrepareHeaders,
});

const baseQuerySpecialForPos = fetchBaseQuery({
  baseUrl: EcEnv.NEXT_PUBLIC_API_HOST.replace('/pos', ''),
  // @ts-ignore
  prepareHeaders: sharedPrepareHeaders,
});

const clearLegacyPosSession = () => {
  const persistenceHandles = makePersistenceHandles();
  persistenceHandles.accessToken.removeItem();
  persistenceHandles.refreshToken.removeItem();
  persistenceHandles.isLoggedIn.removeItem();
};

const handlePosUmsUnauthorized = async () => {
  const locale = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  await clearPosBridgeSession({ locale });
  redirectToPosLogin({ locale });
};

export const sharedBaseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (typeof args !== 'string' && !args?.url) {
    return { error: { status: 404, data: 'url not found' } };
  }
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  const apiPath = typeof args === 'string' ? args : args.url;
  // 由于pos的host现存有两种
  // 如果apiPath是以/api/v1开头，或者包含yotpo/，则使用baseQuerySpecialForPos
  const baseQueryFn =
    accessInPos && (apiPath.startsWith('/api/v1') || apiPath.startsWith('/api/v2') || apiPath.includes('yotpo/'))
      ? baseQuerySpecialForPos
      : baseQuery;

  let result = await baseQueryFn(args, api, extraOptions);

  // TODO 理论上 不要在这里直接引用这个依赖 而是应该通过注入的方式进行控制反转的
  // 因为该方法可能在服务端运行， 这里是无法直接在服务端获取到cookie的
  // 还是期望能在对应的 app 初始化 store 的时候 注入进来
  const persistenceHandles = makePersistenceHandles();
  const isPosUmsAuthMode = EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && sharedFeatureService.enabledPosUmsAuth;
  let refresh_token = null;
  if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
    refresh_token = persistenceHandles?.webRefreshToken?.getItem();
  } else if (!isPosUmsAuthMode) {
    refresh_token = persistenceHandles?.refreshToken?.getItem();
  }
  if (result.error && result.error.status === 401) {
    if (isPosUmsAuthMode) {
      // 在 UMS 模式下，如果 401 错误，则需要重新授权
      await handlePosUmsUnauthorized();
      return result;
    }

    if (!refresh_token) {
      if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
        persistenceHandles.webAccessToken.removeItem();
      } else {
        persistenceHandles.accessToken.removeItem();
      }
      return result;
    }
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          {
            url: '/oauth/token',
            method: 'POST',
            body: { grant_type: 'refresh_token', refresh_token },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // api.dispatch(tokenReceived(refreshResult.data));
          const { access_token, refresh_token } = refreshResult.data as {
            access_token: string;
            refresh_token: string;
            expires_in: number;
            created_at: number;
            token_type: string;
          };
          if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
            persistenceHandles.webAccessToken.setItem(access_token);
            persistenceHandles.webRefreshToken.setItem(refresh_token);
          } else {
            await persistenceHandles.accessToken.setItem(access_token);
            await persistenceHandles.refreshToken.setItem(refresh_token);
            await persistenceHandles.isLoggedIn.setItem('1');
          }
          // retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
            persistenceHandles.webAccessToken.removeItem();
            persistenceHandles.webRefreshToken.removeItem();
          } else {
            clearLegacyPosSession();
            location.reload();
          }
        }
      } catch (error) {
        if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
          persistenceHandles.webAccessToken.removeItem();
          persistenceHandles.webRefreshToken.removeItem();
        } else {
          clearLegacyPosSession();
          location.reload();
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  } else if (result.error && result.error.status === 403) {
    if (isPosUmsAuthMode) {
      // UMS 模式下的 403 表示已登录但无权限，不能按未登录处理。
      // 保留当前会话，让页面/业务逻辑自行展示 forbidden 或权限提示。
      return result;
    }

    const errorData = result.error.data as { errors?: unknown[] } | undefined;

    if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
      if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
        persistenceHandles.webAccessToken.removeItem();
        persistenceHandles.webRefreshToken.removeItem();
      } else {
        clearLegacyPosSession();
        if (!(api.endpoint === 'getCurrentAdmin')) {
          location.reload();
        }
      }
    } else {
      if (EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB') {
        persistenceHandles.webAccessToken.removeItem();
        persistenceHandles.webRefreshToken.removeItem();
      } else {
        clearLegacyPosSession();
        location.reload();
      }
    }
  }

  return result;
};
