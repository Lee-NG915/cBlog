import { DYPageTypes } from '@castlery/modules-dy-domain';
import { dyRecContext } from '@castlery/modules-dy-services';
import { NextRequest } from 'next/server';
import { getExtraPathname } from '../../utils/pathname';
import { campaignSelectors } from './campaign-selectors';
import { RoutPaths } from './routes';

export const personalizationRoutes = [
  {
    path: RoutPaths.pla,
    campaignSelectorName: campaignSelectors.pla,
    pageContextHandler: (request: NextRequest) => {
      const extraPathname = getExtraPathname(request.nextUrl.pathname);
      const sku = extraPathname.replace(`${RoutPaths.pla}/`, '');
      return dyRecContext[DYPageTypes.PRODUCT](sku);
    },
  },
];
