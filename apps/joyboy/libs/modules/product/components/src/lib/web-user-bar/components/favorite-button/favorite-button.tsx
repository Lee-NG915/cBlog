'use client';

import { EcEnv } from '@castlery/config';
import { Badge, IconButton, Stack, Toast, Typography, useBreakpoints } from '@castlery/fortress';
import { Favorite } from '@castlery/fortress/Icons';
import { getWishListSelect, initWishList, selectedWishList } from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import LinkButton from '../link-button/link-button';

const FavoriteButton = ({ onClick }: { onClick: () => void }) => {
  const dispatch = useAppDispatch();
  const { isLoading: wishListIsLoading, status: wishListStatus } = useAppSelector(getWishListSelect());
  const currentWishListData = useAppSelector(selectedWishList);
  // 添加初始化标志（仅本组件实例未 init 过时为 false）
  const [isInitialized, setIsInitialized] = useState(false);

  const firstInitWishList = useCallback(async () => {
    await dispatch(initWishList());
    setIsInitialized(true);
  }, [dispatch]);

  useEffect(() => {
    // 若 store 里已有 wishlist 数据（例如从其他 layout 的 FavoriteButton 已拉过），
    // 则不再 init，避免客户端切到 wishlist 页时因 layout 重挂载导致 /wish_items 重复请求
    const alreadyLoaded = wishListStatus === 'fulfilled';
    if (!isInitialized && !alreadyLoaded) {
      firstInitWishList();
    } else if (alreadyLoaded) {
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized, firstInitWishList, wishListStatus]);

  return (
    <>
      <IconButton
        size="md"
        component={LinkButton}
        path={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/wishlist`}
        menu-type="user_menu"
        text="Wishlist"
        aria-label="Wishlist"
        onClick={(e) => {
          onClick();
        }}
      >
        <Badge loading={wishListIsLoading} badgeContent={currentWishListData.length}>
          <Favorite
            sx={(theme) => ({
              width: theme.spacing(6),
              height: theme.spacing(6),
              color: theme.palette.brand.mono[900],
            })}
          />
        </Badge>
      </IconButton>
      {/* <Toast
        open={isToastOpen}
        theme="dark"
        sx={{
          position: 'fixed',
          left: '87%',
          bottom: '83%',
          width: toastStatus === 'add' ? '368px' : '312px',
          padding: '16px',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        startDecorator={<CheckCircleFilled />}
        endDecorator={<Close onClick={() => setIsToastOpen(false)} sx={{ cursor: 'pointer' }} />}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={(theme) => ({
            width: 'fit-content',
            a: {
              textDecorationColor: theme.palette.brand.warmLinen[500],
            },
          })}
        >
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              marginRight: '8px',
              fontSize: '16px',
            })}
          >
            {toastStatus === 'add' ? 'Added to wishlist!' : 'Removed from wishlist!'}
          </Typography>
          {toastStatus === 'add' && (
            <CustomLink linkKey="wishlist">
              <Typography
                sx={{
                  color: '#F6F3E7',
                  fontSize: '16px',
                }}
              >
                View Wishlist
              </Typography>
            </CustomLink>
          )}
        </Stack>
      </Toast> */}
      {/* <Toast
        open={isTempRemoveToastOpen}
        theme="dark"
        sx={(theme) => ({
          position: 'fixed',
          bottom: theme.spacing(15),
          width: 'fit-content',
          padding: '16px',
        })}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={(theme) => ({
            width: 'fit-content',
            a: {},
          })}
        >
          <Typography>{tempRemoveWishListItemInfo.name} has been removed from your wishlist.</Typography>
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              marginRight: '8px',
              fontSize: '16px',
              textDecorationColor: theme.palette.brand.warmLinen[500],
              textDecoration: 'underline',
              cursor: 'pointer',
            })}
            onClick={(e) => {
              if (countDownTimerRef.current) {
                clearInterval(countDownTimerRef.current);
                countDownTimerRef.current = null;
              }
              setIsTempRemoveToastOpen(false);
              lastTempRemoveWishListItemInfoRef.current = {
                name: '',
                id: 0,
              };
              dispatch(updateTempRemoveWishListItemInfo({ name: '', id: 0 }));
            }}
          >
            {`Undo (0:0${countDown})`}
          </Typography>
        </Stack>
      </Toast> */}
    </>
  );
};

export { FavoriteButton };
