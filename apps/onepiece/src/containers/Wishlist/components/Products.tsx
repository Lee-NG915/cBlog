/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ActionCard } from 'components/VariationCard';
import { useDispatch } from 'react-redux';
import { Grid } from '@castlery/fortress';
import React, { useState } from 'react';
import type { Variant, ActionCardProps } from 'components/VariationCard/props';

import { add } from 'redux/modules/cart';
import { remove as removeFormWishlist } from 'redux/modules/wishlist';
import { getVariantLink } from 'utils/link';

import type { ProductsProps } from './props';

const Products: React.FC<ProductsProps> = ({ wishlist, cartData, onUnlike }, { router, frame }) => {
  const dispatch: any = useDispatch();
  const [loading, setLoading] = useState(false);
  const [handleVariant, setHandleVariant] = useState<Variant | null>(null);
  const onClick = (variant: Variant) => {
    const variantLink = getVariantLink(variant) || '/';
    router.push(variantLink);
  };

  type HandleAddToCartType = ActionCardProps['handleAddToCart'];
  const handleAddToCart: HandleAddToCartType = (variant, hasAddToCart) => {
    if (hasAddToCart) {
      frame.openModal('response', {
        status: 'successful',
        title: 'Success',
        body: 'Product already in cart',
      });
      return;
    }

    const quantity = variant.min_sale_qty;
    setLoading(true);
    setHandleVariant(variant);
    dispatch(
      add({
        variant,
        quantity,
        page: 'Wishlist',
      })
    )
      .then(() => {
        frame.openModal('cart');
      })
      .catch((error: string) => {
        frame.openModal('response', { body: error });
      })
      .finally(() => {
        setLoading(false);
        setHandleVariant(null);
      });
  };

  const handleRemoveWishlist = (variant: Variant) => {
    setLoading(true);
    setHandleVariant(variant);
    dispatch(removeFormWishlist(variant.id))
      .then(() => {
        onUnlike(variant);
      })
      .finally(() => {
        setLoading(false);
        setHandleVariant(null);
      });
  };

  return (
    <Grid container width="100%" spacing={1}>
      {wishlist.data.map((variant, i) => (
        <Grid xs={6} sm={4} md={3} xl={2} key={i}>
          {/* <Item
            key={variant.id}
            variant={variant}
            className={`${style.wishlist}__listItem`}
            lazy={desktop ? i >= 8 : i > 2}
            setShowNotification={setShowNotification}
            setNotificationData={setNotificationData}
          /> */}
          <ActionCard
            cardSx={{
              minHeight: '300px',
              height: '100%',
            }}
            variant={variant}
            cartData={cartData}
            handleAddToCart={handleAddToCart}
            handleRemoveWishlist={handleRemoveWishlist}
            handleClick={onClick}
            loading={handleVariant?.id === variant.id && loading}
          />
        </Grid>
      ))}
    </Grid>
  );
};

Products.contextTypes = {
  frame: () => null,
  router: () => null,
};

export default Products;
