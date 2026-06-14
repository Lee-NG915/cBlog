import { useCallback } from 'react';
import { getCollections } from 'pages';
import { useAncestorCrumbs, useMobileFrame } from './product';

const useRenderModal = () => {
  const { frame } = useMobileFrame();
  return useCallback(
    ({ content, head }) => {
      frame.openModal('mobileModal', { content, head, styleOverflow: 'hidden' }, { height: 80, styleOverflow: 'auto' });
    },
    [frame]
  );
};

// const productNameInclude = (name) =>
//   ['armchair', 'ottoman', 'sofa', 'chaise', 'loveseat', 'armless'].some((s) => name.includes(s));

const findCollectionFromProductName = (productName) => {
  const lowerCaseName = productName.toLowerCase();

  const collectionAction = [
    {
      collection: 'amber',
      condition: lowerCaseName.startsWith('amber'),
    },
    {
      collection: 'lily',
      condition: lowerCaseName.startsWith('lily sideboard') || lowerCaseName.startsWith('lily-sideboard'),
    },
  ];

  for (const action of collectionAction) {
    // get meet the conditions collection
    if (action.condition) return action.collection;
  }
};

// get product Social collection
const getProductSocialCollection = (product) => {
  const taxon = product.taxons.find((t) => t.level === 1 && t.ancestors[0] === 'Collections');
  const AllCollections = getCollections();
  if (taxon) {
    const ProductCollection = AllCollections.find((c) => c.name === taxon.name);
    return ProductCollection?.socialCollection;
  }
  return null;
};

/**
 * logic
 * 1. find prod's collection's socialCollection
 * 2. find menu socialCollection
 */
const useWidgetCollection = () => {
  const { socialPage = {}, product } = useAncestorCrumbs();
  const collection = findCollectionFromProductName(product.name); // hardcode
  const productCollection = getProductSocialCollection(product);
  const { socialCollection } = socialPage;
  const scCollection = productCollection || socialCollection || 'other';
  return { collection, socialCollection: scCollection, product };
};

export { useRenderModal, useWidgetCollection };
