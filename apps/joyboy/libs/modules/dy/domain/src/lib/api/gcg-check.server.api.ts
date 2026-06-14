import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import type { CookieContext } from '../entity';
import { getDyApiPayload, getDyApiHeader, getDyApiUrl, getDyCookies } from '../utils';

//官方提供的名字Global Control Test
export const GCGSelectorName = 'Global Control Test';

export const dyGlobalControlCheck = (cookieContext?: CookieContext) => {
  const { dyGlobalControlGroup: gcgCookie, ...restCookies } = getDyCookies(cookieContext);

  if (!gcgCookie || gcgCookie === 'undefined') {
    const url = getDyApiUrl();
    const payload = getDyApiPayload(
      {
        campaignNames: [GCGSelectorName],
      },
      restCookies
    );
    return fetch(url, {
      method: 'POST',
      headers: getDyApiHeader(),
      body: JSON.stringify(payload),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const gcg = res?.choices[0]?.variations[0]?.payload?.data?._dy_cs_gcg;
        // @ts-ignore
        makePersistenceHandles().dyGlobalControlGroup.setItem(gcg, {
          ...(cookieContext || {}),
          expires: new Date(Date.now() + 31540000000000),
        });
        return gcg;
      });
  }
  return Promise.resolve(gcgCookie);
};
