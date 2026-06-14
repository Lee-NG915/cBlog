import resourcesToBackend from 'i18next-resources-to-backend';
import { LocalesNamespace, Bcp47Locales } from '../types';

export function getExtensions() {
  const resourceLoader = async (lng: Bcp47Locales, ns: LocalesNamespace) => {
    return require(`../locales/${ns}/${lng}.json`);
  };
  return [resourcesToBackend(resourceLoader)];
}
