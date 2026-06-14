import { globalFeatureInAU, globalFeatureInSG } from 'config';
import { temporaryRedirectUrls } from 'utils/loyaltyV2';
// FIXME: replace the value of redirect which is url with page key
// 'redirect' could be key or url of page
export default [
  {
    url: globalFeatureInAU ? '/zippay' : '',
    redirect: 'zip',
  },
  {
    url: '/sales-and-refund',
    redirect: 'sales-and-refunds',
  },
  {
    url: '/interior-design',
    redirect: 'home',
  },
  {
    url: '/fabric-swatches',
    redirect: 'swatches',
  },
  {
    url: '/living-room/modular-sofas',
    redirect: '/sofas/modular-sofas',
  },
  {
    url: '/living-room/corner-sofas',
    redirect: '/sofas/corner-sofas',
  },
  {
    url: '/faq',
    redirect: '/help-center',
  },
  {
    url: globalFeatureInSG ? '/lunar-new-year' : '',
    redirect: '/lunar-new-year-event',
  },
  {
    url: globalFeatureInSG ? '/studio' : '',
    redirect: '/showroom',
  },
  {
    url: globalFeatureInAU ? '/studio' : '',
    redirect: '/sydney-showroom',
  },
  {
    url: globalFeatureInAU ? '/showroom' : '',
    redirect: '/sydney-showroom',
  },

  ...temporaryRedirectUrls,
];
