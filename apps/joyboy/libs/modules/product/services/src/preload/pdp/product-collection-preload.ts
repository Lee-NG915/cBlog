import { fetchCollections } from '@castlery/modules-cms-domain/server';
// import { getProductCollection } from '@castlery/modules-product-domain';

export const productCollectionPreload = async () => {
  // void getProductCollection();
  void fetchCollections();
};
