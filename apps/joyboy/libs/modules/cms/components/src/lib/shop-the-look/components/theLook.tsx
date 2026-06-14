/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { EcEnv } from '@castlery/config';
import {
  Box,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  ModalClose,
  Stack,
  Switch,
  Toast,
  Typography,
} from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import {
  ArrowForwardIos,
  CheckCircleFilled,
  Close,
  Favorite,
  FavoriteFilled,
  TipsAndUpdates,
} from '@castlery/fortress/Icons';
import type { HotspotsV2, TipsV2 } from '@castlery/modules-cms-domain';
import { VariantPrice } from '@castlery/modules-product-components';
import { selectShopTheLookVariantData } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import HotSpot from './hotSpot';
import Tip from './tips';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { addTheLookWishlist, deleteTheLookWishlist, selectedTheLookWishList } from '@castlery/modules-user-domain';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { useParams } from 'next/navigation';
import { ShopTheLookModuleName } from '../config';
import { trackShopTheLookEvent } from '@castlery/modules-tracking-services';

export interface TheLookIProps {
  hotsPotsBlok: HotspotsV2[];
  imageUrl: string;
  tipsBlok: TipsV2[];
  lookId: string;
  variantIds: string;
  hideControl?: boolean;
  hideAddToWishlist?: boolean;
  onDrawerStateChange?: (isOpen: boolean) => void;
}
function TheLook({
  hotsPotsBlok,
  imageUrl,
  tipsBlok,
  lookId,
  variantIds,
  hideControl = false,
  hideAddToWishlist = false,
  onDrawerStateChange,
}: TheLookIProps) {
  const { desktop, tablet, mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const { region } = useParams();

  const theLookWishList = useAppSelector(selectedTheLookWishList);
  const [loadingLikeBtn, setLoadingLikeBtn] = useState(false);
  const [liked, setLiked] = useState(false);
  const [viewAllHotsPot, setViewAllHotsPot] = useState(false);
  const [viewAllTips, setViewAllTips] = useState(false);
  const [snackbarIsOpen, setOpenSnackbar] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const variantList = useAppSelector(selectShopTheLookVariantData);

  // Tracking 事件抽象方法
  const trackProductsToggle = useCallback(
    (isOn: boolean) => {
      dispatch(
        trackShopTheLookEvent({
          action: isOn ? 'view_all_products_on' : 'view_all_products_off',
          label: lookId,
        })
      );
    },
    [dispatch, lookId]
  );

  const trackTipsToggle = useCallback(
    (isOn: boolean) => {
      dispatch(
        trackShopTheLookEvent({
          action: isOn ? 'view_all_tips_on' : 'view_all_tips_off',
          label: lookId,
        })
      );
    },
    [dispatch, lookId]
  );

  const trackTipsOn = useCallback(() => {
    dispatch(trackShopTheLookEvent({ action: 'view_all_tips_on', label: lookId }));
  }, [dispatch, lookId]);

  // 添加防抖处理关闭事件
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  type FnType = (...args: any[]) => void;
  const useThrottle = (fn: FnType, limit: number) => {
    const throttle = useCallback(
      (...args: any[]) => {
        let lastCall = 0;
        const now = Date.now();

        // 如果距离上次调用超过了设定的时间间隔
        if (now - lastCall >= limit) {
          lastCall = now;
          fn(...args); // 使用 ...args 来确保传递多个参数
        }
      },
      [fn, limit] // 将 fn 和 limit 作为依赖项
    );

    return throttle;
  };
  const variantData: { variant: any; hotsPot: HotspotsV2 }[] = variantList.map((v, i) => {
    const _v = hotsPotsBlok.find((item) => String(v.id) === String(item.variant_id)) as HotspotsV2;
    return {
      variant: v,
      hotsPot: _v,
    };
  });

  const cleanSnackbarTimer = useCallback(() => {
    setOpenSnackbar(false);
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const _t = theLookWishList.find((item) => item.shop_the_look_id === lookId);
    setLiked(!!_t);
  }, [theLookWishList, lookId]);

  useEffect(() => {
    if (snackbarIsOpen) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            cleanSnackbarTimer();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [snackbarIsOpen, cleanSnackbarTimer]);

  // 监听 Drawer 状态变化并通知父组件
  useEffect(() => {
    const isDrawerOpen = !desktop && (viewAllHotsPot || viewAllTips);
    onDrawerStateChange?.(isDrawerOpen);
  }, [viewAllHotsPot, viewAllTips, desktop, onDrawerStateChange]);

  const switchSx = {
    marginRight: '24px',
    span: {
      transition: 'left 0.4s ease, background-color 0.4s',
    },
    '.MuiSwitch-track': {
      backgroundColor: (theme: any) => theme.palette.brand.charcoal[0],
      border: '1px solid #929292',
      span: {
        boxShadow: 'none',
        backgroundColor: '#929292',
      },
    },
    '.Mui-checked': {
      backgroundColor: (theme: any) => theme.palette.primary[500],
      border: 'none',
      span: {
        boxShadow: 'none',
        backgroundColor: (theme: any) => theme.palette.brand.charcoal[0],
      },
    },
  };
  const toggleLike = async () => {
    setLoadingLikeBtn(true);
    try {
      if (liked) {
        await dispatch(deleteTheLookWishlist.initiate(lookId, { forceRefetch: true }));
        setLiked(false);
      } else {
        await dispatch(
          addTheLookWishlist.initiate({
            shop_the_look_id: lookId,
            background_image: imageUrl,
            variant_ids: variantIds.split(',').map((v) => Number(v)),
          })
        ).unwrap();
        setCountdown(5);
        setOpenSnackbar(true);
        setLiked(true);
      }
    } catch (error: any) {
      throw new Error(error);
    }
    setLoadingLikeBtn(false);
  };

  const debounceToggleLike = useThrottle(() => {
    toggleLike();
  }, 1000);

  // const openKlaviyoForm =
  //   (event: React.MouseEvent<HTMLButtonElement>) => {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     const originalXHR = window.XMLHttpRequest;
  //     window.XMLHttpRequest = function () {
  //       const xhr = new originalXHR();
  //       const originalOpen = xhr.open;
  //       xhr.open = function (method: string, url: string, ...args: any[]) {
  //         //  强制将 Klaviyo 相关请求转换为 HTTPS
  //         if (url.includes('http://') && url.includes('klaviyo.com')) {
  //           url = url.replace('http://', 'https://');
  //         }
  //         return originalOpen.call(xhr, method, url, ...args);
  //       };
  //       return xhr;
  //     } as any;
  //     if (window._klOnsite) {
  //       window._klOnsite.push(['openForm', 'XWsgLv']);
  //     }
  //     debounceToggleLike();
  //     return () => {
  //       window.XMLHttpRequest = originalXHR;
  //     };
  //   },
  //   ;

  const viewProductsTrackingTags = useTrackingTags({
    moduleName: ShopTheLookModuleName,
    elementName: 'View All Products',
  });
  const viewTipsTrackingTags = useTrackingTags({
    moduleName: ShopTheLookModuleName,
    elementName: 'View All Styling Tips',
  });
  const wishIconTrackingTags = useTrackingTags({
    moduleName: ShopTheLookModuleName,
    elementName: 'Add To Wishlist',
  });

  const HotsPotsDrawerContent = React.memo(() => {
    if (!variantData || !variantData.length) return null;
    const filteredVariantData = variantData.filter((item) => item.hotsPot);
    return (
      <>
        <Typography sx={(theme) => ({ mb: theme.spacing(4) })}>
          {filteredVariantData.length} products displayed{' '}
        </Typography>
        {filteredVariantData &&
          filteredVariantData.length > 0 &&
          filteredVariantData.map((item, index) => (
            <CustomLink
              // href={`https://www.castlery.com/${region}/products/${item.variant.product_slug}`}
              href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${
                item.variant?.product_slug
              }`}
              // isExternalFlag={true}
            >
              <Box display="flex" alignItems={'center'} key={index} justifyContent="space-between">
                <Stack
                  sx={{
                    minWidth: 120,
                    minHeight: 85,
                  }}
                >
                  <FortressImage
                    imageWidth={120}
                    imageHeight={85}
                    // ratio={0.66}
                    src={item.variant?.images?.[0]?.links?.mini}
                    alt={item.variant?.product_name}
                    sizes={['0.3-xs', '0.2-md']}
                  />
                </Stack>
                <Box flexGrow={1} sx={{ marginLeft: '20px' }}>
                  <Typography
                    level="h4"
                    sx={(theme) => ({ color: theme.palette.brand.maroonVelvet[500], mb: theme.spacing(2) })}
                  >
                    {item.variant?.product_name}
                  </Typography>
                  <VariantPrice variant={item.variant} minSaleQty={item.variant?.min_sale_qty || 1} />
                </Box>
                <ArrowForwardIos name="arrow-next" sx={(theme) => ({ fill: theme.palette.brand.mono[900] })} />
              </Box>
            </CustomLink>
          ))}
      </>
    );
  });

  const TipsDrawerContent = React.memo(() => {
    if (!tipsBlok || !tipsBlok.length) return null;
    return (
      <>
        <Typography>{tipsBlok.length} styling tips </Typography>
        {tipsBlok.map((item, index) => (
          <>
            <Box
              key={index}
              sx={{
                paddingBottom: '20px',
                '&:not(:first-child)': {
                  marginTop: '20px',
                },
                '&:not(:last-child)': {
                  borderBottom: '1px solid #dcd0b8',
                },
              }}
            >
              <Box display="flex" alignItems="center">
                <TipsAndUpdates />
                <Typography
                  level="h4"
                  sx={{
                    marginLeft: '12px',
                    color: '#686666',
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
              <Typography sx={{ marginTop: '5px' }} level="caption2">
                {item.description}{' '}
              </Typography>
            </Box>
          </>
        ))}
      </>
    );
  });

  return (
    <>
      <Box>
        <Box sx={{ maxWidth: '100%', margin: 'auto' }}>
          <Box
            sx={{
              width: '100%',
              height: 'auto',
              // width: 'calc((100vw - 64px)/1.77)',
              display: 'grid',
              position: 'relative',
              gridTemplateColumns: 'repeat(20, 1fr)',
              gridTemplateRows: 'repeat(20, 1fr)',
              placeItems: 'center',
              padding: '0 0',
              marginBottom: '16px',
              overflow: 'hidden',
            }}
          >
            <FortressImage
              // imageWidth={1664}
              sx={{
                // width: 'calc(min(1664px, (100vw - 64px)))', // 计算图片宽度，不超过1664px
                width: '100%',
                height: 'auto', // 高度自适应
                gridColumn: '1/21',
                gridRow: '1/21',
                // '--AspectRatio-paddingBottom': 0,
              }}
              // ratio={1.77}
              src={imageUrl}
              alt={'shop the look image'}
              sizes={['1-xs', '1-md', '1-lg', '0.8-xl']}
            />
            {variantData &&
              variantData.map((item, index) => (
                <HotSpot
                  key={item.variant?.id}
                  lookId={lookId}
                  position={index}
                  hotspot={item?.hotsPot || {}}
                  viewAll={viewAllHotsPot}
                  variantsData={item.variant}
                  mobileClickHandler={() => {
                    const newValue = !viewAllHotsPot;
                    setViewAllHotsPot(newValue);
                    trackProductsToggle(newValue);
                  }}
                />
              ))}
            {tipsBlok &&
              tipsBlok.map((tip, index) => (
                <Tip
                  key={index}
                  tips={tip}
                  viewState={viewAllTips}
                  mobileClickHandler={() => {
                    setViewAllTips(true);
                    trackTipsOn();
                  }}
                />
              ))}
          </Box>
          {!hideControl && (
            <Box
              sx={
                mobile
                  ? {
                      py: 0,
                      px: 3,
                      overflow: 'hidden',
                      display: 'grid',
                    }
                  : {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      height: '40px',
                      margin: tablet ? '0 24px' : '0 0',
                      padding: '0 0',
                      overflow: 'hidden',
                    }
              }
            >
              <Box
                sx={{
                  display: mobile ? 'inline-grid' : 'flex',
                }}
              >
                {variantData && variantData.length > 0 && (
                  <Switch
                    slotProps={{
                      input: {
                        ...viewProductsTrackingTags,
                      },
                    }}
                    checked={viewAllHotsPot}
                    onChange={(event) => {
                      const newValue = event.target.checked;
                      setViewAllHotsPot(newValue);
                      trackProductsToggle(newValue);
                    }}
                    sx={{
                      ...switchSx,
                      maxWidth: '175px',
                      marginRight: mobile ? '0' : '35px',
                    }}
                    endDecorator={
                      <Typography
                        level="body1"
                        noWrap
                        onClick={() => {
                          const newValue = !viewAllHotsPot;
                          setViewAllHotsPot(newValue);
                          trackProductsToggle(newValue);
                        }}
                      >
                        View all products
                      </Typography>
                    }
                  />
                )}
                {tipsBlok && tipsBlok.length > 0 && (
                  <Switch
                    slotProps={{
                      input: {
                        ...viewTipsTrackingTags,
                      },
                    }}
                    checked={viewAllTips}
                    sx={{
                      ...switchSx,
                      maxWidth: '180px',
                      margin: mobile ? '12px 0' : '0 0',
                    }}
                    onClick={() => {
                      const newValue = !viewAllTips;
                      setViewAllTips(newValue);
                      trackTipsToggle(newValue);
                    }}
                    endDecorator={
                      <Typography level="body1" noWrap>
                        View all styling tips
                      </Typography>
                    }
                  />
                )}
              </Box>
              {!hideAddToWishlist && (
                <Box
                  display={'flex'}
                  sx={{ alignItems: 'center', height: '40px', overflow: 'hidden' }}
                  onClick={debounceToggleLike}
                >
                  <IconButton
                    {...wishIconTrackingTags}
                    variant="plain"
                    disabled={loadingLikeBtn}
                    loading={loadingLikeBtn}
                    sx={{
                      p: 0,
                      m: 0,
                      width: desktop ? 40 : 32,
                      height: desktop ? 40 : 32,
                      minHeight: 'auto',
                      minWidth: 'auto',
                      '&:active': {
                        backgroundColor: '#ffffff', // 修改背景颜色
                      },
                    }}
                  >
                    {!liked ? (
                      <Favorite sx={{ color: (theme) => theme.palette.brand.charcoal[800] }} />
                    ) : (
                      <FavoriteFilled />
                    )}
                  </IconButton>
                  <Typography
                    level="body1"
                    noWrap
                    sx={{
                      lineHeight: '40px',
                      ml: 1,
                      cursor: loadingLikeBtn ? 'default' : 'pointer',
                    }}
                  >
                    Add to Wishlist
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
      <Drawer
        anchor="bottom"
        open={!desktop && (viewAllHotsPot || viewAllTips)}
        onClose={() => {
          if (viewAllHotsPot) {
            trackProductsToggle(false);
          }
          if (viewAllTips) {
            trackTipsToggle(false);
          }
          setViewAllHotsPot(false);
          setViewAllTips(false);
        }}
        sx={{
          // '.MuiDialogContent-root': { padding: '32px 16px' },
          a: {
            textDecoration: 'none',
            padding: '8px 0',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            fontSize: '24px',
            marginBottom: '4px',
          }}
        >
          In This Look
        </DialogTitle>
        <ModalClose
          onClick={() => {
            if (viewAllHotsPot) {
              trackProductsToggle(false);
            }
            if (viewAllTips) {
              trackTipsToggle(false);
            }
            setViewAllHotsPot(false);
            setViewAllTips(false);
          }}
        />

        <DialogContent sx={{ padding: '0 24px' }}>
          {viewAllHotsPot && <HotsPotsDrawerContent />}
          {viewAllTips && <TipsDrawerContent />}
        </DialogContent>
      </Drawer>
      <Toast
        open={snackbarIsOpen}
        variant="soft"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          bottom: tablet ? 76 : 50,
          width: '90%',
          color: '#FFFDF9',
          flexWrap: 'wrap',
          paddingRight: 0,
          borderRadius: 'var(--spacing-2, 16px)',
          zIndex: 9999,
          background: `var(--fortress-palette-brand-charcoal-800, #323433)`,
          a: {
            color: 'var(--colours-text-secondary, #FFFDF9)',
          },
        }}
      >
        <CheckCircleFilled
          sx={{
            color: '#00CC92',
          }}
        />
        <Typography sx={{ color: '#FFFDF9' }}>Add to wishlist</Typography>
        <CustomLink linkKey={'wishListLook'}>View wishlist (0:0{countdown})</CustomLink>
        <Box
          sx={{ position: 'absolute', right: '16px', cursor: 'pointer', zIndex: 999 }}
          onClick={() => {
            cleanSnackbarTimer();
          }}
        >
          <Close
            onClick={() => {
              cleanSnackbarTimer();
            }}
          />
        </Box>
      </Toast>
    </>
  );
}

export default TheLook;
