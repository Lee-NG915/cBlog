'use client';
import { CollectionHeader } from './content';
import { useBreakpoints } from '@castlery/fortress';
import { ProductsList } from '@castlery/modules-product-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProductCollectionsIds, useGetProductCollectionsQuery } from '@castlery/modules-product-domain';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';
import { ProductsCollectionModuleName } from './config';
import { EcEnv } from '@castlery/config';
import { useParams } from 'next/navigation';
import { ProductsCollectionV2Storyblok } from '@castlery/types';

export interface ProductsCollectionProps {
  blok: ProductsCollectionV2Storyblok;
}
export function ProductsCollection({ blok }: ProductsCollectionProps) {
  const { region } = useParams();
  const collections = useAppSelector(selectProductCollectionsIds);

  const { data } = useGetProductCollectionsQuery({ collections }, { skip: !collections.length });
  const products = data?.hits?.hits?.map((item: any) => item._source) || [];
  const categories = products[0]?.categories || [];
  const collection =
    Array.isArray(categories) && categories.length > 0
      ? categories.find((item: any) => item.name !== 'Collections' && item.name.includes('Collection'))
      : null;

  const link = collection
    ? `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST ?? ''}/${region}/collections/${collection.permalink}`
    : '';

  const { desktop, tablet } = useBreakpoints();

  if (!products || !products.length) {
    return null;
  }

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={ProductsCollectionModuleName}
      sx={{ py: desktop ? '60px' : tablet ? 6 : 4 }}
      {...storyblokEditable(blok)}
      key={blok._uid}
    >
      <CollectionHeader blok={blok} link={link} />
      {Array.isArray(products) && products.length > 0 ? (
        <ProductsList outerModuleName={ProductsCollectionModuleName} products={products} />
      ) : null}
    </DtStack>
  );
}

export default ProductsCollection;
