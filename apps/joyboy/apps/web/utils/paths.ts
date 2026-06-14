import { supportLanguages } from '@castlery/monorepo-i18n';
import { supportRegions } from '../navigation';

export const getStaticPrefixes = () => {
  // Return a list of possible value for locale
  const locales = supportLanguages;
  const regions = supportRegions;

  //Get the paths we want to pre-render based on posts
  const prefixes = locales.reduce((acc: any, locale: string) => {
    regions.forEach((region) => {
      acc.push({ locale, region });
    });
    return acc;
  }, []);
  return prefixes;
};
