import { getPageType, getPageSlug } from './page-type.util';

export const createDataTrackingData = ({
  pathname,
  module,
  elementName,
  content,
}: {
  module: string;
  elementName?: string;
  content?: Object;
  pathname?: string;
}) => {
  const page = getPageType(pathname);
  const position = getPageSlug(pathname);
  return {
    // 结构化数据 用于gtm自动跟踪，格式为：页面类型|页面slug|模块|元素名称
    'data-dt-id': `${page}|${position}|${module}|${elementName}`,
    // 额外数据
    'data-dt-content': JSON.stringify(content),
  };
};

/**
 * 用于gtm对元素和组件的自动跟踪
 * https://support.google.com/tagmanager/answer/7679410?hl=en&ref_topic=7679108&sjid=2322462775994480134-AP
 * @param uid unique id for the element or the component
 * @returns
 */
export const addImpressionFlag = (uid: string) => {
  return {
    'data-impression': `dt_impression_${uid}`,
  };
};
