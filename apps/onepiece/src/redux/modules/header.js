import { enableDisplayStudioLink, globalFeatureInSG } from 'config';
import { getPageByKey, getUrl } from 'pages';
import lang from 'utils/lang';

const LOAD = 'header/LOAD';
const LOAD_SUCCESS = 'header/LOAD_SUCCESS';
const LOAD_FAIL = 'header/LOAD_FAIL';

const initialState = {};

export const selectHeaderNavList = () => {
  // TODO 现在我在思考  内部链接 和 外部连接 能不能都统一使用 ReactLink 一个组件就写好了
  // 他们的区别应该是 to 的话 就是内部链接
  // href的话 就是外部链接  那么 我们就不需要自己去区分了
  const data = [
    getUrl('livetrue')
      ? {
          link: {
            path: getUrl('livetrue'),
            menuType: 'secondary_menu',
            text: 'Live True',
          },
        }
      : {
          link: {
            path: getUrl('virtual-studio'),
            menuType: 'secondary_menu',
            target: '_blank',
            isOriginal: true,
            text: 'Virtual Studio',
          },
        },
    enableDisplayStudioLink && {
      link: {
        path: getUrl(globalFeatureInSG ? 'showroom' : 'studio'),
        menuType: 'secondary_menu',
        text: lang.t('common.studio'),
      },
    },
    {
      link: {
        path: getUrl('reviews'),
        menuType: 'secondary_menu',
        text: 'Reviews',
      },
    },
    __FRIENDBUY_ENABLED__ && {
      link: {
        path: getUrl('referral'),
        menuType: 'secondary_menu',
        text: `Give ${lang.t('common.friend_offer')}, Get ${lang.t('common.advocate_offer')}`,
      },
    },
    __YOTPO_ENABLED__ && {
      link: {
        path: getUrl('rewards'),
        menuType: 'secondary_menu',
        text: lang.t('common.loyalty'),
      },
    },
    globalFeatureInSG &&
      getPageByKey('lunar-new-year-event')?.effective && {
        link: {
          path: `${__BASE_ROUTE__}${getUrl('lunar-new-year-event')}`,
          menuType: 'secondary_menu',
          text: 'Lunar New Year Event',
          isOriginal: true,
        },
      },
    {
      link: {
        path: getUrl('contact-us'),
        menuType: 'secondary_menu',
        text: 'Contact Us',
      },
    },
  ];
  return data;
};

export default function header(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.result,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}
