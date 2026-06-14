import { supportLanguages } from '@castlery/monorepo-i18n';
import { supportRegions } from '../navigation';

export const getRegionInPathname = (pathname: string) => {
  return supportRegions.find((region) => pathname.startsWith(`/${region}`));
};

export const getLocaleInPathname = (pathname: string) => {
  const region = getRegionInPathname(pathname);
  if (region) {
    return supportLanguages.find((lang) => pathname.startsWith(`/${region}/${lang}`));
  }
  return '';
};
/**
 * 获取除了region和locale之外的pathname，比如：/sg/en/products/xxx -> /products/xxx
 * @param pathname
 */
export const getExtraPathname = (pathname: string) => {
  const regionInPathname = getRegionInPathname(pathname);
  if (regionInPathname) {
    return pathname.replace(`/${regionInPathname}`, '');
  }
  const locale = supportLanguages.find((lang) => pathname.startsWith(`/${lang}`));
  if (locale) {
    return pathname.replace(`/${locale}`, '');
  }
  return pathname;
};
