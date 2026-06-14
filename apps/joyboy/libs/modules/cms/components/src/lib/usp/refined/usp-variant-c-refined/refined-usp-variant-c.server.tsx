import { getPdpDataBucketServer } from '@castlery/modules-cms-domain/server';
import RefinedUspVariantC from './refined-usp-variant-c';
import { UspVariantCStoryblok } from '@castlery/types';

export const RefinedUspVariantCServer = async ({ slug, blok }: { slug: string; blok: UspVariantCStoryblok }) => {
  const result = await getPdpDataBucketServer(slug);
  return <RefinedUspVariantC blok={blok} content={result?.content} />;
};
