import { CustomMiddleware } from '../lib/chain';
import { getRequiredParams, createRedirectWithState } from '../lib/utils';

/**
 * 👤 Account 路由重定向中间件
 * 将 /account/rewards 重定向到 /{region}/account/the-castlery-club
 * 将 /{region}/account 重定向到 /{region}/account/profile
 */
export function accountMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const { originalPathname } = getRequiredParams(request);

    // 处理 /account/rewards 重定向
    if (originalPathname === '/account/rewards') {
      const { region } = getRequiredParams(request);
      const targetUrl = new URL(`/${region}/account/the-castlery-club`, request.url);
      return createRedirectWithState(response, targetUrl);
    }

    // 其他路径继续执行下一个中间件
    return middleware(request, event, response);
  };
}
