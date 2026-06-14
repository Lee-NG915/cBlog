'use client';

import { EcEnv, basePageConfig, enableYotpo } from '@castlery/config';
import { IconButton, Menu, MenuItem, Typography, useBreakpoints } from '@castlery/fortress';
import { Account, AccountLogin } from '@castlery/fortress/Icons';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { CustomLink } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import React, { useEffect, useMemo, useState } from 'react';
import { MenuButton } from '../menu-button/menu-button';
import { signOut } from '@castlery/modules-user-services';
import { useRouter } from 'nextjs-toploader/app';
import { AuthModal } from '@castlery/shared-components';
import { EVENT_GENERAL_LINK_CLICK } from '@castlery/modules-tracking-services';

const UserMenu = () => {
  const currentUser = useAppSelector(selectedActiveUser);
  const [menuIndex, setMenuIndex] = useState<null | number>(null);
  // const [loginCallbackUrl, setLoginCallbackUrl] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const { desktop, mobile } = useBreakpoints();
  const router = useRouter();
  const itemProps = {
    onClick: () => setMenuIndex(null),
  };
  const dispatch = useAppDispatch();
  const handleClickLogOut = async () => {
    // makePersistenceHandles().webAccessToken.removeItem();
    // makePersistenceHandles().webRefreshToken.removeItem();
    // dispatch(setUser(null));
    // dispatch(setWishList([]));
    // dispatch(setTheLookWishList([]));
    // // window.setTimeout(() => {
    // //   window.location.reload();
    // // }, 2000);
    // dispatch(
    //   enterApp({
    //     page: 'PLA',
    //   })
    // );
    await dispatch(signOut({})).unwrap();
  };
  const createHandleLeaveMenu = (index: number) => (getIsOnButton: () => boolean) => {
    setTimeout(() => {
      const isOnButton = getIsOnButton();
      if (!isOnButton) {
        setMenuIndex((latestIndex: null | number) => {
          if (index === latestIndex) {
            return null;
          }
          return latestIndex;
        });
      }
    }, 200);
  };

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const url = `${
  //       EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
  //     }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/login?redirectUrl=${
  //       window ? encodeURIComponent(window.location.href) : ''
  //     }`;
  //     setLoginCallbackUrl(url);
  //   }
  // }, []);

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
    // const decorateLink = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${link}`;
    // e.preventDefault();
    // e.stopPropagation();
    // if (window?.dataLayer) {
    //   const origin = window?.location?.origin;
    //   const decorateLink = `${origin}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${link}`;
    //   dispatch(
    //     EVENT_GENERAL_LINK_CLICK({ category: 'link_click', label: 'user_menu', link: name, dimension5: decorateLink })
    //   );
    // }
    // setTimeout(() => {
    //   router.push(decorateLink);
    //   // window.location.href = decorateLink;
    // }, 500);
  };

  const hasLogin = currentUser;
  if (!hasLogin) {
    return (
      <>
        <IconButton
          aria-label="Login"
          size="md"
          // component={CustomLink}
          // linkKey={loginCallbackUrl}
          // isExternalFlag={true}
          onClick={() => {
            setAuthModalOpen(true);
            handleLinkClick('/account', 'Account');
          }}
          sx={(theme) => ({
            minWidth: `${theme.spacing(6)} !important`,
            minHeight: `${theme.spacing(6)} !important`,
            padding: '0 !important',
            maxWidth: `${theme.spacing(6)} !important`,
            maxHeight: `${theme.spacing(6)} !important`,
            ...(desktop && {
              marginTop: theme.spacing(1),
            }),
            ...(mobile && {
              marginRight: theme.spacing(3),
            }),
          })}
        >
          <Account
            sx={(theme) => ({
              width: theme.spacing(6),
              height: theme.spacing(6),
              fill: theme.palette.brand.mono[900],
            })}
          />
        </IconButton>
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }
  return (
    <MenuButton
      aria-label="User"
      label="User"
      open={menuIndex === 0}
      onOpen={() => desktop && setMenuIndex(0)}
      onLeaveMenu={createHandleLeaveMenu(0)}
      menu={
        <Menu
          sx={(theme) => ({ backgroundColor: `${theme.palette.brand.warmLinen[200]} !important`, top: '10px' })}
          onClose={() => setMenuIndex(null)}
          placement="bottom-end"
        >
          {[
            {
              path: basePageConfig.profile,
              name: 'Account',
            },
            {
              path: basePageConfig.orders,
              name: 'Orders',
            },
            {
              path: basePageConfig.vouchers,
              name: 'Vouchers',
            },
            enableYotpo && {
              // path: basePageConfig['account-rewards'],
              path: basePageConfig.rewards,
              name: 'Rewards',
            },
            {
              path: basePageConfig.address,
              name: 'Address Book',
            },
            {
              path: basePageConfig['my-reviews'],
              name: 'Reviews',
            },
          ].map((item, i) => {
            if (item) {
              return (
                <MenuItem
                  {...itemProps}
                  key={i}
                  sx={(theme) => ({
                    '&:hover': {
                      color: `${theme.palette.brand.burntOrange[800]} !important`,
                    },
                    backgroundColor: `${theme.palette.brand.warmLinen[200]} !important`,
                  })}
                  onClick={(e) => handleLinkClick(item?.path, item?.name)}
                >
                  <CustomLink
                    linkKey={item?.path}
                    // isExternalFlag={true}
                    menu-type="user_menu"
                    style={{ all: 'unset' }}
                  >
                    <Typography level="body2">{item?.name}</Typography>
                  </CustomLink>
                </MenuItem>
              );
            }
            return null;
          })}
          <MenuItem
            onClick={() => {
              handleClickLogOut();
            }}
            sx={(theme) => ({
              '&:hover': {
                color: `${theme.palette.brand.burntOrange[800]} !important`,
              },
              backgroundColor: `${theme.palette.brand.warmLinen[200]} !important`,
            })}
          >
            <Typography level="body2">Log Out</Typography>
          </MenuItem>
        </Menu>
      }
    >
      <AccountLogin />
    </MenuButton>
  );
};

export { UserMenu };
