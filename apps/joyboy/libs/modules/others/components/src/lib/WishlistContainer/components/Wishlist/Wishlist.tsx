'use client';

import { ProductItemDataProps, ProductList } from '@castlery/shared-components';

interface WishlistProps {
  wishListData: ProductItemDataProps[];
  onTempRemoveWishlist?: ({ id, name }: { id: number; name: string }) => void;
  onTempRemoveRollback?: () => void;
}

const Wishlist = ({ wishListData, onTempRemoveWishlist, onTempRemoveRollback }: WishlistProps) => {
  return (
    <ProductList
      imageType="base_image"
      products={wishListData}
      applyATCAndWishlist={true}
      openHover={false}
      needSliderDisplay={false}
      forceGridDisplay={true}
      inWishlistPage={true}
      onTempRemoveWishlist={onTempRemoveWishlist}
      onTempRemoveRollback={onTempRemoveRollback}
    />
  );
};

export { Wishlist };
