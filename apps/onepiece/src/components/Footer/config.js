import { getConfig } from 'utils/config';
import { getPageByUrl } from 'pages';
import {
  addressFeatureInSG,
  enableAmbassadorInFooter,
  enableOurDesignersPage,
  enableSustainabilityPage,
  hostUrl,
} from 'config';

import { addKnightPrefix } from 'pages/util.js';

const FOOTER_LINKS_CONFIG = {
  AU: [
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Boucle Chair',
      pageKey: 'boucle-armchairs',
    },
  ],
  SG: [
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Velvet Sofa',
      pageKey: 'velvet-sofas',
    },
  ],
  US: [
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Boucle Chair',
      pageKey: 'boucle-armchairs',
    },
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
  ],
  // TODO 要更新
  CA: [
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Boucle Chair',
      pageKey: 'boucle-armchairs',
    },
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
  ],
  UK: [
    {
      anchorText: 'Under the Bed Storage',
      pageKey: 'Storage Beds',
    },
    {
      anchorText: 'Spill-Resistant Furniture',
      pageKey: 'performance-fabric-furniture',
    },
    {
      anchorText: 'Solid Wood Furniture',
      pageKey: 'wood-furniture',
    },
    {
      anchorText: 'Small Sofas',
      pageKey: 'small-sofas',
    },
    {
      anchorText: 'Small Dining Tables',
      pageKey: 'small-dining-tables',
    },
    {
      anchorText: 'Storage Solution',
      pageKey: 'Storage Bestsellers',
    },
    {
      anchorText: 'Modern Farmhouse',
      pageKey: 'Modern Farmhouse Furniture',
    },
    {
      anchorText: 'Kid-Friendly Furniture',
      pageKey: 'curved-furniture',
    },
  ],
};

export const FOOTER_LINKS = getConfig(FOOTER_LINKS_CONFIG);

export const getBreadcrumbsByPathname = (pathname) => {
  let result = [];
  const page = getPageByUrl(pathname);
  FOOTER_LINKS?.some((subPage) => {
    const isEnd = subPage.pageKey === page?.key;
    if (isEnd) {
      result = [{ name: subPage.anchorText, key: subPage.pageKey }];
    }
    return isEnd;
  });
  return result;
};
export const ABOUT_LINKS = [
  {
    pageKey: 'our-story',
  },
  {
    pageKey: 'contact-us',
  },
  enableSustainabilityPage && {
    href: `${hostUrl}/${__COUNTRY__.toLocaleLowerCase()}/sustainability`,
    name: 'Sustainability',
    target: '_self',
  },
  enableOurDesignersPage && {
    pageKey: 'designer-community',
    name: 'Our Designers',
  },
  { pageKey: 'trade', name: 'Trade Program' },
  enableAmbassadorInFooter && {
    href: `ambassador-program`,
    name: 'Ambassador Program',
  },
  { pageKey: 'affiliate-program' },

  {
    href: `${hostUrl}/careers`,
    target: '_blank',
    rel: 'noopener',
    name: 'Careers',
  },
  // addressFeatureInSG && {
  //   href: `${hostUrl}/careers/graduate-programme`,
  //   target: '_blank',
  //   rel: 'noopener',
  //   name: 'Graduate programme',
  // },
  {
    pageKey: 'blog',
  },
  {
    pageKey: 'press',
  },
];
export const SHOP_LINKS = [
  { pageKey: 'swatches' },
  { pageKey: 'delivery' },
  { pageKey: 'warranty' },
  { pageKey: 'sales-and-refunds' },
  { pageKey: 'help-center' },
];
export const FOOTER_LINKS_DESKTOP = getConfig({
  AU: [
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Boucle Chair',
      pageKey: 'boucle-armchairs',
    },
  ],
  SG: [
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Velvet Sofa',
      pageKey: 'velvet-sofas',
    },
  ],
  US: [
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Boucle Chair',
      pageKey: 'boucle-armchairs',
    },
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
  ],
  // TODO 要更新
  CA: [
    {
      anchorText: 'L Shaped Couch',
      pageKey: 'l-shape-couch',
    },
    {
      anchorText: 'Marble Dining Table',
      pageKey: 'marble-dining-table',
    },
    {
      anchorText: 'Extendable Dining Tables',
      pageKey: 'extendable-dining-tables',
    },
    {
      anchorText: 'Boucle Chair',
      pageKey: 'boucle-armchairs',
    },
    {
      anchorText: 'Queen Size Bed',
      pageKey: 'queen-sized-beds',
    },
    {
      anchorText: 'King Size Bed',
      pageKey: 'king-sized-beds',
    },
  ],
  UK: [
    {
      anchorText: 'Under the Bed Storage',
      pageKey: 'Storage Beds',
    },
    {
      anchorText: 'Spill-Resistant Furniture',
      pageKey: 'performance-fabric-furniture',
    },
    {
      anchorText: 'Solid Wood Furniture',
      pageKey: 'wood-furniture',
    },
    {
      anchorText: 'Small Sofas',
      pageKey: 'small-sofas',
    },
    {
      anchorText: 'Small Dining Tables',
      pageKey: 'small-dining-tables',
    },
    {
      anchorText: 'Storage Solution',
      pageKey: 'Storage Bestsellers',
    },
    {
      anchorText: 'Modern Farmhouse',
      pageKey: 'Modern Farmhouse Furniture',
    },
    {
      anchorText: 'Kid-Friendly Furniture',
      pageKey: 'curved-furniture',
    },
  ],
});
