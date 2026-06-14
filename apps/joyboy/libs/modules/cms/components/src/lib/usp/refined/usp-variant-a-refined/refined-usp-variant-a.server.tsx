import { UspVariantAStoryblok } from '@castlery/types';
import RefinedUspVariantA from './refined-usp-variant-a';
import { getPdpDataBucketServer } from '@castlery/modules-cms-domain/server';

interface RefinedUspVariantAServerProps {
  slug: string;
  blok: UspVariantAStoryblok;
}

export const RefinedUspVariantAServer = async ({ slug, blok }: RefinedUspVariantAServerProps) => {
  const result = await getPdpDataBucketServer(slug);

  return (
    <>
      <RefinedUspVariantA blok={blok} content={result?.content} />
    </>
  );
};
