import { EVENTS_NAMES_MAP } from '../events-name';
import { defaultEcommerceParameters, defaultCommonParameters } from '../helpers';

function gaTrack(parameters: { event: string; [key: string]: any }) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    // 此处逻辑：
    // 如果是 pageview事件， 则重置dataLayer所有属性
    // 如果是非 pageview事件，则只重置一部分电商属性
    if (parameters.event === EVENTS_NAMES_MAP.GA_PAGE_VIEW) {
      // @ts-ignore
      window.dataLayer.push({
        ...defaultCommonParameters,
        ...defaultEcommerceParameters,
      });
    } else {
      // @ts-ignore
      window.dataLayer.push(defaultEcommerceParameters);
    }
    // 推送事件
    window.dataLayer.push({
      ...parameters,
    });

    // 记录历史pageview事件
    if (parameters.event === EVENTS_NAMES_MAP.GA_PAGE_VIEW) {
      window.historyPageviews = window.historyPageviews || [];

      window.historyPageviews.push(parameters);
      if (window.historyPageviews.length > 10) {
        window.historyPageviews.shift();
      }
    }
  }
}

export { gaTrack };
