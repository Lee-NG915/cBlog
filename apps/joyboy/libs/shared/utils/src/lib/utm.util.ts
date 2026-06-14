import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

// 从持久化中获取utm参数
// example : 'utm_medium=cpc&utm_source=facebook&utm_campaign=funnel%3APrsp-Awa_geo%3AUS-All_type%3ATraffic_campaign%3ABundles&utm_content=format%3ALnk_lead%3AVid_creative%3ADawsonExtendedSofaWithOttomanSet-haleyscornerr-Jun2025-Organic-BCA&utm_id=120213783287270472&utm_term=120221939461790472&fbclid=IwY2xjawNr5WBleHRuA2FlbQEwAGFkaWQBqyUV8TsOqAEeqj1haEJ8qHHSJRLkjOgJoq5uZPOPjwMyhGmISRhjb5uPwSvvb0JV20LAZjw_aem_5mbG7GZYML2E78oH9hfXGw'
export function getUtmParametersFromPersistence() {
  const utmParameters = makePersistenceHandles().utmParameters.getItem();
  if (typeof utmParameters === 'string') {
    return parseUtmParameters(utmParameters);
  }
  return null;
}

export function setUtmParametersToPersistence(utmParameters: string) {
  makePersistenceHandles().utmParameters.setItem(utmParameters);
}

export function removeUtmParametersFromPersistence() {
  makePersistenceHandles().utmParameters.removeItem();
}

export function getUtmParametersFromUrl() {
  if (typeof window === 'undefined') {
    return null;
  }
  const url = new URL(window.location.href);
  const urlParams = url.searchParams;

  const searchParams = Array.from(urlParams.entries()).reduce((acc, [key, value]) => {
    if (key.startsWith('utm_')) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  return searchParams;
}

export function stringifyUtmParameters(utmParameters: Record<string, string>) {
  // Using URLSearchParams is a robust way to create query strings,
  // as it correctly handles encoding of special characters in keys and values.
  return new URLSearchParams(utmParameters).toString();
}

export function parseUtmParameters(utmParameters: string) {
  // URLSearchParams correctly parses query strings, handling encoded characters.
  return Object.fromEntries(new URLSearchParams(utmParameters));
}
