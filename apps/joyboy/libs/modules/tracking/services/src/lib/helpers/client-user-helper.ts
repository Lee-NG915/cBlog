import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import Cookies from 'js-cookie';
import { logger } from '@castlery/observability/client';

export const getUserFromPersistence = async () => {
  try {
    const webAccessToken = await makePersistenceHandles().webAccessToken.getItem();
    if (webAccessToken) {
      const userInfo = await makePersistenceHandles().webUserInfo.getItem();
      if (userInfo) {
        return JSON.parse(userInfo);
      }
    }
    return null;
  } catch (error) {
    logger.error('Failed to get user from persistence', { error });
    return null;
  }
};

/**
 * 同步版本的 getUserFromPersistence 函数
 * 使用 js-cookie 库实现同步的 cookie 读取，避免异步延迟
 *
 * 注意：js-cookie 库在客户端环境下无法通过路径筛选 cookie，
 * 但通常特定路径的 cookie 在客户端是可见的，所以直接读取即可
 */
export const getUserFromPersistenceSync = () => {
  try {
    // Cookie 键名，与 makePersistenceHandles 保持一致
    // webAccessToken 使用 accessToken 常量（值为 'access_token'），autoPrefix = false
    // webUserInfo 使用 userInfo 常量（值为 'server_user_info'），autoPrefix = false
    const webAccessTokenKey = 'access_token';
    const webUserInfoKey = 'server_user_info';

    // 同步读取 cookie
    // 注意：js-cookie 库在客户端环境下无法通过路径筛选 cookie
    // 但通常特定路径的 cookie 在客户端是可见的
    const webAccessToken = Cookies.get(webAccessTokenKey);
    if (webAccessToken) {
      const userInfo = Cookies.get(webUserInfoKey);
      if (userInfo) {
        return JSON.parse(userInfo);
      }
    }
    return null;
  } catch (error) {
    logger.error('Failed to get user from persistence (sync)', { error });
    return null;
  }
};
