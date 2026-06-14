import { EcEnv } from '@castlery/config';
export const removeRegionInPath = (path: string) => {
  if (!path) {
    return path;
  }
  // remove region from path
  const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  return path.replace(`/${region}/`, '');
};
