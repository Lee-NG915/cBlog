import { getPdpDataBucketServer } from '@castlery/modules-cms-domain/server';
import RefinedUspVariantB from './refined-usp-variant-b';
import { UspVariantBStoryblok } from '@castlery/types';

export const RefinedUspVariantBServer = async ({ slug, blok }: { slug: string; blok: UspVariantBStoryblok }) => {
  const result = await getPdpDataBucketServer(slug);
  return <RefinedUspVariantB blok={blok} content={result?.content} />;
};
