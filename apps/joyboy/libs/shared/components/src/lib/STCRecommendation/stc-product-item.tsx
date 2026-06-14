'use client';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { Button, IconButton, Stack, Typography, useBreakpoints, Loading } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Check, Favorite, ShoppingBag } from '@castlery/fortress/Icons';
import { addToOrder, getProductBySKU } from '@castlery/modules-cms-services';
import { selectOrder, setOrder } from '@castlery/modules-order-domain';
import { toPrice, Variant } from '@castlery/modules-product-domain';
import {
  EVENT_ADD_TO_CART,
  EVENT_ADD_TO_WISHLIST,
  EVENT_RECOMMENDATIONS,
  EVENT_STORYBLOK,
  getProductNeedTracking,
} from '@castlery/modules-tracking-services';
import {
  addWishlist,
  deleteWishlist,
  selectedWishList,
  setWishList,
  updateWishlistActionRecord,
} from '@castlery/modules-user-domain';
import { CustomLink } from '../custom-link/custom-link';
import { FortressImage } from '../fortress-image/fortress-image';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import Slider from 'react-slick';

/** 将完整 URL 转为内部路径，供 Next.js 客户端跳转使用 */
function getInternalPath(fullUrl: string): string {
  try {
    if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
      const urlObj = new URL(fullUrl);
      return `${urlObj.pathname}${urlObj.search}${urlObj.hash || ''}`;
    }
    return fullUrl;
  } catch {
    return fullUrl;
  }
}

interface STCProductItemDataProps {
  sku: string;
  badges: string[];
  images: {
    base: string;
  };
  inStock: boolean;
  name: string;
  price: number;
  salePrice: string;
  productShortDescription: string;
  spuName: string;
  url: string;
  variantId: string;
  slotId?: string;
  productType?: 'configurable' | 'bundle';
}

interface STCProductItemProps {
  product: STCProductItemDataProps;
  bgColor?: string;
  needMargin?: boolean;
  length?: number;
  onModalOpen?: (
    value: boolean,
    type: 'success' | 'error',
    detail?: string,
    productInfo?: { variant: Variant; price: string; listPrice: string }
  ) => void;
  onToastOpen?: (status: 'add' | 'remove' | 'temp_remove', info?: { id: number; name: string }) => void;
  applyATCAndWishlist?: boolean;
  onClickSuccess?: ({ slotId }: { slotId: string }) => void;
  displayDescription?: boolean;
}

const STCProductItem = ({
  product,
  bgColor,
  length,
  needMargin,
  onModalOpen,
  onToastOpen,
  applyATCAndWishlist,
  onClickSuccess,
  displayDescription = false,
}: STCProductItemProps) => {
  const {
    sku,
    badges,
    images,
    name,
    price,
    salePrice,
    productShortDescription,
    spuName,
    url,
    variantId,
    slotId,
    productType,
  } = product;
  const currentOrderData = useAppSelector(selectOrder);
  const wishList = useAppSelector(selectedWishList);
  const [isSelected, setIsSelected] = useState(false);
  const [waitingAddToCart, setWaitingAddToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  /** 内部链接路径，用于 CustomLink 与客户端跳转 */
  const internalPath = useMemo(() => getInternalPath(url), [url]);

  useEffect(() => {
    if (currentOrderData?.line_items?.find((item) => item.variant?.id === Number(variantId))) {
      setAddToCartSuccess(true);
    } else {
      setAddToCartSuccess(false);
    }
  }, [currentOrderData, variantId]);

  useEffect(() => {
    if (wishList.find((item) => item.id === Number(variantId))) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [wishList, variantId]);

  const { base } = images;
  const { desktop, mobile } = useBreakpoints();

  const showLineThroughPrice = useMemo(() => {
    return !!salePrice;
  }, [salePrice]);

  const baseChangeColor = useMemo(() => {
    const replaceColor = 'transparent';
    const colorWithoutHash = replaceColor.replace('#', '');

    if (base && base.includes('b_rgb:')) {
      return base.replace(/b_rgb:[A-F0-9]{6},/, `b_rgb:${colorWithoutHash},`);
    }
    return base;
  }, [base, bgColor]);

  const imageSize = useMemo(() => {
    if (desktop) {
      return {
        width: 326,
        height: 170,
      };
    }
    if (mobile) {
      return {
        width: 202,
        height: 100,
      };
    }
    return {
      width: 313,
      height: 170,
    };
  }, [desktop, mobile]);

  const imageRealSize = useMemo(() => {
    if (length) {
      return {
        width: length,
        height: length,
      };
    } else {
      return imageSize;
    }
    return imageSize;
  }, [imageSize, length]);

  const handleAddToCart = async () => {
    if (productType === 'bundle') {
      handleViewDetails();
      return;
    }
    if (waitingAddToCart || addToCartSuccess) {
      return;
    }
    setWaitingAddToCart(true);
    const data = await getProductBySKU(sku);
    if (data?.variants?.[0]?.id) {
      const addToOrderData = {
        number: currentOrderData?.number || '',
        quantity: data?.min_sale_qty || 1,
        variant_id: Number(variantId),
      };
      try {
        const res = await addToOrder(addToOrderData);
        if (res !== null) {
          await dispatch(setOrder(res));
          setWaitingAddToCart(false);
          setAddToCartSuccess(true);
          dispatch(
            EVENT_ADD_TO_CART({
              trackedProduct: getProductNeedTracking(res?.line_items?.[res?.line_items?.length - 1]),
              cartLineItems: currentOrderData?.line_items || [],
              qtyIncrements: data?.min_sale_qty || 1,
              itemTotal: toPrice(String(price), true),
              atcType: '1click',
            })
          );
          dispatch(
            EVENT_RECOMMENDATIONS({
              pageComponent: 'flash',
              category: 'recommendation_add_to_cart',
              action: 'add_to_cart',
              tag: 'target_sku',
              tagValue: sku,
            })
          );
          onModalOpen?.(true, 'success', undefined, {
            variant: data?.variants?.[0],
            price: String(price) as string,
            listPrice: String(salePrice) as string,
          });
        }
      } catch (error) {
        // 提取错误详情
        let errorDetail = 'Unable to add item to cart';
        setWaitingAddToCart(false);
        if (error instanceof Error) {
          try {
            // 尝试从错误消息中解析 JSON
            const errorMessage = error.message;
            const jsonMatch = errorMessage.match(/\{.*\}/);
            if (jsonMatch) {
              const errorData = JSON.parse(jsonMatch[0]);
              if (errorData.errors && errorData.errors.length > 0) {
                errorDetail = errorData.errors[0].detail || errorDetail;
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse error detail:', parseError);
          }
        }
        setWaitingAddToCart(false);
        onModalOpen?.(true, 'error', errorDetail);
      }
    }
  };

  const handleClickWishlist = async () => {
    if (isSelected) {
      await handleRemoveFromWishlist();
    } else {
      await handleAddToWishlist();
    }
  };

  const handleAddToWishlist = async () => {
    // const addToWishlistData = {
    //   id: Number(variantId),
    // };
    const res = await dispatch(addWishlist.initiate(variantId));
    // const res = await addToWishlist(addToWishlistData);
    if (res) {
      setIsSelected(true);
      dispatch(updateWishlistActionRecord('add'));
      const newWishList = [...wishList];
      if (!newWishList.find((item) => item.id === Number(variantId))) {
        newWishList.push({ id: Number(variantId) });
      }
      await dispatch(setWishList(newWishList));
      onToastOpen?.('add');
      // dispatch(
      //   EVENT_ADD_TO_WISHLIST({
      //     variant: {
      //       name: spuName,
      //       sku: sku,
      //       price: toPrice(String(price), true),
      //     },
      //   })
      // );
      dispatch(
        EVENT_RECOMMENDATIONS({
          pageComponent: 'flash',
          category: 'recommendation_wishlist',
          action: 'add_to_wishlist',
          tag: 'target_sku',
          tagValue: sku,
        })
      );
    }
  };

  const handleViewDetails = () => {
    router.push(internalPath);
  };

  const handleRemoveFromWishlist = async () => {
    await dispatch(deleteWishlist.initiate(variantId));
    dispatch(
      EVENT_RECOMMENDATIONS({
        pageComponent: 'flash',
        category: 'recommendation_wishlist',
        action: 'remove_from_wishlist',
        tag: 'target_sku',
        tagValue: sku,
      })
    );
    onToastOpen?.('remove');
    setIsSelected(false);
  };

  const handleProductClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    dispatch(
      EVENT_RECOMMENDATIONS({
        pageComponent: 'flash',
        category: 'recommendation_click',
        action: 'click',
        label: 'product_card',
        tag: 'target_sku',
        tagValue: sku,
      })
    );
    if (slotId && onClickSuccess) {
      onClickSuccess({
        slotId,
      });
    }
    window.setTimeout(() => {
      router.push(path);
    }, 1000);
  };

  const renderImagePart = () => {
    return (
      <Stack
        sx={(theme) => ({
          position: 'relative',
          width: desktop ? 326 : mobile ? 202 : 313,
          justifyContent: 'flex-end',
          mt: 'auto',
        })}
      >
        <FortressImage
          src={baseChangeColor}
          alt={name}
          ratio={imageRealSize.width / imageRealSize.height}
          objectFit="contain"
          imageWidth={imageRealSize.width}
          imageHeight={imageRealSize.height}
          sx={{
            '--AspectRatio-paddingBottom': 0,
          }}
        />
      </Stack>
    );
  };

  const renderPricePart = () => {
    if (showLineThroughPrice && salePrice !== '') {
      if (Number(price) === Number(salePrice)) {
        return (
          <Stack
            sx={(theme) => ({
              flexDirection: 'row',
              alignItems: 'center',
              mb: theme.spacing(2),
            })}
          >
            <Typography
              level="h5"
              sx={(theme) => ({
                color: theme.palette.brand.warmLinen[500],
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              })}
            >
              {toPrice(String(price), true)}
            </Typography>
          </Stack>
        );
      } else {
        return (
          <Stack
            sx={(theme) => ({
              flexDirection: 'row',
              alignItems: 'center',
              mb: theme.spacing(2),
            })}
          >
            <Typography
              level="h5"
              sx={(theme) => ({
                color: theme.palette.brand.warmLinen[500],
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              })}
            >
              {toPrice(salePrice, true)}
            </Typography>
            {showLineThroughPrice && (
              <Typography
                level="h5"
                sx={(theme) => ({
                  color: theme.palette.brand.mono[500],
                  textDecoration: 'line-through',
                  ml: theme.spacing(1),
                  fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                })}
              >
                {toPrice(String(price), true)}
              </Typography>
            )}
          </Stack>
        );
      }
    } else {
      return (
        <Stack
          sx={(theme) => ({
            flexDirection: 'row',
            alignItems: 'center',
            mb: theme.spacing(2),
          })}
        >
          <Typography
            level="h5"
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              mb: theme.spacing(1),
            })}
          >
            {toPrice(String(price), true)}
          </Typography>
        </Stack>
      );
    }
  };

  return (
    <Stack
      sx={(theme) => ({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        // minHeight: !mobile ? 359 : 273,
        // minHeight: desktop ? 426 : mobile ? 359 : 426,
        maxWidth: 326,
        padding: mobile ? `${theme.spacing(3)} 0` : `${theme.spacing(5)} 0`,
        backgroundColor: 'rgba(252, 251, 248, .03)',
        ...(needMargin && {
          marginRight: desktop ? '24px' : '12px',
        }),
        a: {
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        },
      })}
    >
      <CustomLink href={internalPath} onClick={(e) => handleProductClick(e, internalPath)}>
        <Stack
          sx={(theme) => ({
            padding: mobile ? `0 ${theme.spacing(3)}` : `0 ${theme.spacing(5)}`,
          })}
        >
          {badges.length > 0 && badges[0] !== '' && (
            <Typography
              level="caption2"
              sx={(theme) => ({
                backgroundColor:
                  badges[0] === 'Sale' || badges[0] === 'Clearance'
                    ? theme.palette.brand.burntOrange[400]
                    : theme.palette.brand.terracotta[500],
                color: theme.palette.brand.warmLinen[500],
                padding: theme.spacing(1),
                fontSize: 12,
                width: 'fit-content',
                mb: theme.spacing(2),
              })}
            >
              {badges[0]}
            </Typography>
          )}
          <Typography
            level="h5"
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              maxWidth: 286,
              mb: theme.spacing(1),
            })}
          >
            {spuName}
          </Typography>
          {displayDescription && productShortDescription && (
            <Typography
              level="caption1"
              sx={(theme) => ({
                color: theme.palette.brand.warmLinen[600],
                mt: theme.spacing(1),
                mb: theme.spacing(2),
              })}
            >
              {productShortDescription}
            </Typography>
          )}
          {renderPricePart()}
        </Stack>
        {renderImagePart()}
      </CustomLink>

      {/* {renderPricePart()} */}
      {applyATCAndWishlist && (
        <Stack
          sx={(theme) => ({
            flexDirection: 'row',
            alignItems: 'center',
            mt: theme.spacing(2),
            paddingLeft: theme.spacing(5),
            ...(mobile && {
              mt: theme.spacing(4),
              paddingLeft: theme.spacing(3),
            }),
          })}
        >
          {productType === 'bundle' && desktop ? (
            <Button
              variant="outlined"
              onClick={handleViewDetails}
              sx={(theme) => ({
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
                minHeight: theme.spacing(6),
                maxHeight: theme.spacing(6),
                border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                backgroundColor: 'transparent',
                color: theme.palette.brand.maroonVelvet[500],
                '&:hover': {
                  border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                  backgroundColor: '#63404B',
                  color: '#f6f3e7',
                },
                mr: theme.spacing(2),
              })}
            >
              View Details
            </Button>
          ) : (
            <IconButton
              size="md"
              aria-label="Cart Action"
              sx={(theme) => ({
                borderRadius: '50%',
                border: `1px solid ${theme.palette.brand.mono[300]}`,
                mr: theme.spacing(2),
                minWidth: theme.spacing(6),
                minHeight: theme.spacing(6),
                maxWidth: theme.spacing(6),
                maxHeight: theme.spacing(6),
                backgroundColor: 'transparent',
                '&:hover': {
                  border: `1px solid ${theme.palette.brand.mono[500]}`,
                  backgroundColor: theme.palette.brand.mono[300],
                },
                '&:active': {
                  border: `1px solid ${theme.palette.brand.mono[300]}`,
                  backgroundColor: theme.palette.brand.mono[600],
                },
                cursor: addToCartSuccess || waitingAddToCart ? 'default' : 'pointer',
              })}
              onClick={handleAddToCart}
            >
              {addToCartSuccess ? (
                <Check
                  sx={(theme) => ({
                    fill: theme.palette.brand.warmLinen[500],
                    width: '16px',
                    height: '16px',
                  })}
                />
              ) : waitingAddToCart ? (
                <Loading
                  theme="dark"
                  sx={(theme) => ({
                    '--CircularProgress-size': theme.spacing(4),
                    '--CircularProgress-thickness': theme.spacing(0.5),
                    '& svg circle:nth-of-type(2)': {
                      stroke: theme.palette.brand.warmLinen[500],
                    },
                  })}
                />
              ) : (
                <ShoppingBag
                  sx={(theme) => ({
                    fill: theme.palette.brand.warmLinen[500],
                    width: '16px',
                    height: '16px',
                  })}
                />
              )}
            </IconButton>
          )}
          <IconButton
            size="md"
            aria-label="Wishlist Action"
            sx={(theme) => ({
              borderRadius: '50%',
              border: `1px solid ${theme.palette.brand.mono[300]}`,
              backgroundColor: isSelected ? theme.palette.brand.mono[300] : 'transparent',
              minWidth: theme.spacing(6),
              minHeight: theme.spacing(6),
              maxWidth: theme.spacing(6),
              maxHeight: theme.spacing(6),
              '&:hover': {
                border: `1px solid ${theme.palette.brand.mono[500]}`,
                backgroundColor: theme.palette.brand.mono[300],
              },
              '&:active': {
                border: `1px solid ${theme.palette.brand.mono[300]}`,
                backgroundColor: theme.palette.brand.mono[600],
              },
            })}
            onClick={handleClickWishlist}
          >
            {isSelected ? (
              <Favorite
                sx={(theme) => ({
                  fill: theme.palette.brand.warmLinen[500],
                  width: '16px',
                  height: '16px',
                })}
              />
            ) : (
              <Favorite sx={(theme) => ({ fill: theme.palette.brand.warmLinen[500], width: '16px', height: '16px' })} />
            )}
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
};

export { STCProductItemDataProps, STCProductItem };
