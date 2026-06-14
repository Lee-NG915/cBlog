'use client';

import React from 'react';
import { Sheet, Stack, iconButtonClasses } from '@castlery/fortress';
import { UserMenu } from './components/user-menu/user-menu';
import { FlexSearchBar } from './components/flex-search-bar/flex-search-bar';
import { FavoriteButton } from './components/favorite-button/favorite-button';
import { ShoppingBagButton } from './components/shopping-bag-button/shopping-bag-button';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { cartIconClickedEvent } from '@castlery/modules-product-domain';
import { EVENT_GENERAL_LINK_CLICK } from '@castlery/modules-tracking-services';
import { EcEnv } from '@castlery/config';

const WebUserBar = () => {
  const dispatch = useAppDispatch();
  const handleLinkClick = (link: string, name: string) => {
    const prefix = `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`;
    dispatch(
      EVENT_GENERAL_LINK_CLICK({
        category: 'link_click',
        label: 'user_menu',
        link: name,
        dimension5: `${prefix}${link}`,
      })
    );
    // setTimeout(() => {
    //   window.location.href = `${prefix}${link}`;
    // }, 300);
  };

  const handleCartIconClick = () => {
    dispatch(cartIconClickedEvent());
    handleLinkClick('/cart', 'Cart');
  };

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      sx={{
        gap: '16px',
        // position: 'absolute',
        // right: 24,
        // paddingRight: '20px',
        zIndex: 3,
        [`& .${iconButtonClasses.root}`]: {
          minWidth: '',
          paddingInline: 0,
        },
      }}
    >
      <Sheet
        sx={(theme) => ({
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.palette.brand.warmLinen[500],
        })}
      >
        <FlexSearchBar />
      </Sheet>
      <Sheet
        sx={(theme) => ({
          backgroundColor: theme.palette.brand.warmLinen[500],
        })}
      >
        <UserMenu />
      </Sheet>
      <Sheet
        sx={(theme) => ({
          position: 'relative',
          backgroundColor: theme.palette.brand.warmLinen[500],
        })}
      >
        <FavoriteButton onClick={() => handleLinkClick('/wishlist', 'Wishlist')} />
      </Sheet>
      <Sheet
        sx={(theme) => ({
          paddingTop: '4px',
          backgroundColor: theme.palette.brand.warmLinen[500],
        })}
      >
        <ShoppingBagButton onClick={handleCartIconClick} />
      </Sheet>
    </Stack>
  );
};

export { WebUserBar };
