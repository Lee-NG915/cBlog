import { LocaleLayoutClient } from './layout.client';
import { TermsOfUseGlobalServer } from '@castlery/modules-composite-components';
import { cookies, headers } from 'next/headers';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { termsOfUsePreload } from '@castlery/modules-cms-services/server';
import { getCurrentUserFromServer } from '@castlery/modules-user-domain';
import { UttInitialScript } from '@castlery/modules-tracking-components';
import { WebDyScripts } from '@castlery/modules-dy-components';
import { CATEGORY_MIDDLEWARE_REWRITE_PATHNAME } from '@castlery/config';
import { logger } from '@castlery/observability/server';

export const getCategoryRewritePathname = async () => {
  const allHeaders = headers();
  return allHeaders.get(CATEGORY_MIDDLEWARE_REWRITE_PATHNAME) ?? '';
};

export const getUserData = async (persistenceHandles: ReturnType<typeof makePersistenceHandles>) => {
  const webAccessToken = persistenceHandles.webAccessToken.getItem();
  if (webAccessToken) {
    const resp = await getCurrentUserFromServer(webAccessToken);
    if (resp && resp.ok) {
      try {
        return await resp.json();
      } catch (e) {
        logger.error('Failed to parse user from response json', { error: e });
      }
    }
  }

  return null;
};

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const persistenceHandles = makePersistenceHandles({
    cookies,
  });
  const cityInfo = persistenceHandles.webCity.getItem();
  const categoryOriginalPathname = await getCategoryRewritePathname();
  termsOfUsePreload();

  // 并行执行多个请求
  const [userData] = await Promise.all([
    getUserData(persistenceHandles),
    // 这里可以再添加其他并行请求
    // otherApiCall(),
    // anotherApiCall(),
  ]);

  return (
    <LocaleLayoutClient city={cityInfo} user={userData}>
      <WebDyScripts categoryOriginalPathname={categoryOriginalPathname} />
      <TermsOfUseGlobalServer />
      {children}
      <UttInitialScript />
    </LocaleLayoutClient>
  );
}
