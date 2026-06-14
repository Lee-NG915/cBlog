import cache from 'memory-cache';

const CACHE_DURATION = 10 * 60 * 1000;

export const getFromCache = <T>(key: string): T | null => {
  return cache.get(key) as T | null;
};

export const setToCache = (key: string, value: any): void => {
  cache.put(key, value, CACHE_DURATION);
};
