import { getPdpDataBucketServer } from '@castlery/modules-cms-domain/server';
import RefinedUspVariantD from './refined-usp-variant-d';
import { UspVariantDStoryblok } from '@castlery/types';

export const RefinedUspVariantDServer = async ({ slug, blok }: { slug: string; blok: UspVariantDStoryblok }) => {
  const result = await getPdpDataBucketServer(slug);
  return <RefinedUspVariantD blok={blok} content={result?.content} />;
};
