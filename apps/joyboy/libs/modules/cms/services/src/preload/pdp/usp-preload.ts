import { getPdpDataBucketServer } from '@castlery/modules-cms-domain/server';

interface UspPreloadProps {
  slug: string;
}

export const uspPreload = ({ slug }: UspPreloadProps) => {
  // void baseSbApiClient.getPdpDataBucket(slug as string);
  void getPdpDataBucketServer(slug);
};
