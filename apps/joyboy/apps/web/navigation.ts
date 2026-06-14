export const defaultRegion = 'sg';
export const supportRegions = ['sg', 'us', 'au', 'ca', 'uk'];

export const isSupportedRegion = (region: string) => {
  return !!supportRegions.find((r) => r === region);
};
