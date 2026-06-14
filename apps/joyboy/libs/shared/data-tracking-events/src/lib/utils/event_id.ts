/* eslint-disable @typescript-eslint/no-unused-vars */
import Cookies from 'js-cookie';
// import type { InterActionType } from '../types/interaction';

/**
 * DOMAIN_FLAG.PAGE.MODULE.ELEMENT_NAME.INTERACTION
 * => 维度：域名/来源标识 + 页面 + 模块 + 元素 + 交互
 * @param elementName
 * @param interaction
 */
const createEventId = (elementName: string, interaction: any) => {};

/**
 *
 */
const generateSource = () => {
  //根据cookie来映射source
  const source = Cookies.get('dt-source');
  const sourceStr = source ? 'not set' : source?.toUpperCase();
  if (sourceStr?.includes('.')) {
    throw Error('TYPE ERROR:"dt-source" is not expected to contain the symbol "."');
  }
  return sourceStr;
};

const generatePageName = () => {
  const URL = new window.URL(window.location.href);
  const pathname = URL.pathname;
  const reg = /^\/[(AU|US|SG)]\/(.*)?$/gi;
};
