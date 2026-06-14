import { getPdpDataBucketServer } from '@castlery/modules-cms-domain/server';
import { SofaComfortVideoList } from './sofa-comfort-video-list';

const SofaComfortVideoListServer = async ({ slug }: { slug: string }) => {
  const result = await getPdpDataBucketServer(slug);
  return (
    <SofaComfortVideoList
      videoList={result?.content?.sofaComfortVideos || []}
      listTitle={result?.content?.sofaComfortVideoSectionTitle || 'Comfort at every height'}
    />
  );
};

export { SofaComfortVideoListServer };
