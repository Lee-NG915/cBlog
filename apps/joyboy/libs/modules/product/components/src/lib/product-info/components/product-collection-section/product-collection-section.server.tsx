import { getProductCollection, Product } from '@castlery/modules-product-domain';
import { CollectionDisplayClient } from './collection-display.client';
import { fetchCollections } from '@castlery/modules-cms-domain/server';

interface ProductCollectionSectionProps {
  product: Product;
}

export const ProductCollectionSectionServer = async (props: ProductCollectionSectionProps) => {
  const { product } = props;

  try {
    const { data: collectionData } = await fetchCollections();
    let collectionPage = null;
    const taxon = product?.taxons?.find((t) => t.level === 1 && t.ancestors[0] === 'Collections');
    if (taxon) {
      const page = collectionData?.find((item: any) => item.permalink === taxon.permalink);
      if (page) {
        collectionPage = page;
      }
    }
    if (!collectionPage) return null;
    return <CollectionDisplayClient collectionPage={collectionPage} />;
  } catch (e) {
    return null;
  }
};
