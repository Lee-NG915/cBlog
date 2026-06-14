'use client';

import { Button, IconButton, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Check, Favorite, Loading, ShoppingBag } from '@castlery/fortress/Icons';
import { selectCartLineItems, selectAddToCartLoading } from '@castlery/modules-cart-domain';
import { getProductBySKU } from '@castlery/modules-cms-services';
import { toPrice } from '@castlery/modules-product-domain';
import {
  // EVENT_ADD_TO_CART,
  EVENT_ADD_TO_WISHLIST,
  EVENT_STORYBLOK,
  // getProductNeedTracking,
} from '@castlery/modules-tracking-services';
import {
  addWishlist,
  deleteWishlist,
  selectedWishList,
  setWishList,
  // updateTempRemoveWishListItemInfo,
  updateWishlistActionRecord,
} from '@castlery/modules-user-domain';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import React, { useEffect, useMemo, useState } from 'react';
import Slider from 'react-slick';
import { addToCartCommandV2 } from '@castlery/modules-cart-services';
import { OnlineAddCartSource } from '@castlery/config';
import { logger } from '@castlery/observability';

interface ProductItemDataPropsV2 {
  sku: string;
  badges: string[];
  images: {
    base: string;
    lifestyle?: string;
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
  productOptionsPresentation?: string;
}

interface ProductItemProps {
  product: ProductItemDataPropsV2;
  openHover?: boolean;
  imageType?: 'base_image' | 'lifestyle_image';
  bgColor?: string;
  needMargin?: boolean;
  length?: number;
  onModalOpen?: (value: boolean, type: 'success' | 'error', detail?: string) => void;
  onToastOpen?: (status: 'add' | 'remove' | 'temp_remove', info?: { id: number; name: string }) => void;
  applyATCAndWishlist?: boolean;
  onClickSuccess?: ({ slotId }: { slotId: string }) => void;
  inWishlistPage?: boolean;
  onAtcToastOpen?: (success: boolean) => void;
}

const SingleProductItemV2 = ({
  product,
  openHover = false,
  imageType,
  bgColor,
  length,
  needMargin,
  onModalOpen,
  onToastOpen,
  applyATCAndWishlist,
  onClickSuccess,
  inWishlistPage = false,
  onAtcToastOpen,
}: ProductItemProps) => {
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
    productOptionsPresentation,
  } = product;
  const cartLineItems = useAppSelector(selectCartLineItems);
  const wishList = useAppSelector(selectedWishList);
  const [isSelected, setIsSelected] = useState(false);
  const [waitingAddToCart, setWaitingAddToCart] = useState(false);
  const atcLoading = useAppSelector(selectAddToCartLoading);
  const [atcActionId, setAtcActionId] = useState<string>('');
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [pendingAtcToastStatus, setPendingAtcToastStatus] = useState<boolean | null>(null);

  const dispatch = useAppDispatch();

  const isAdded = useMemo(() => {
    return cartLineItems?.some((item) => Number(item.variant?.id) === Number(variantId));
  }, [cartLineItems, variantId]);

  useEffect(() => {
    if (wishList.find((item) => item.id === Number(variantId))) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [wishList, variantId]);

  const { base, lifestyle } = images;
  const { desktop } = useBreakpoints();

  const showLineThroughPrice = useMemo(() => {
    return !!salePrice;
  }, [salePrice]);

  const [isHover, setIsHover] = useState(false);

  const baseChangeColor = useMemo(() => {
    const replaceColor = bgColor || '#FBF9F4';
    const colorWithoutHash = replaceColor.replace('#', '');

    if (base && base.includes('b_rgb:')) {
      return base.replace(/b_rgb:[A-F0-9]{6},/, `b_rgb:${colorWithoutHash},`);
    }
    return base;
  }, [base, bgColor]);

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const handleViewDetails = () => {
    window.location.href = url;
  };

  const imageSize = useMemo(() => {
    if (openHover) {
      if (desktop) {
        return {
          width: 256,
          height: 256,
        };
      }
      return {
        width: 202,
        height: 202,
      };
    }
    if (imageType === 'lifestyle_image') {
      if (desktop) {
        return {
          width: 256,
          height: 256,
        };
      }
      return {
        width: 202,
        height: 202,
      };
    }
    if (desktop) {
      return {
        width: 256,
        height: 256,
      };
    }
    return {
      width: 202,
      height: 202,
    };
  }, [imageType, openHover, desktop]);

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

  const usualImageSrc = useMemo(() => {
    if (openHover) {
      return baseChangeColor;
    }
    if (imageType === 'lifestyle_image') {
      return lifestyle !== '' ? lifestyle : baseChangeColor;
    }
    return baseChangeColor;
  }, [imageType, lifestyle, baseChangeColor, openHover]);

  const handleAddToCart = async () => {
    if (productType === 'bundle') {
      handleViewDetails();
      return;
    }
    if (atcLoading || isAdded) {
      return;
    }
    setAtcActionId(sku);
    setWaitingAddToCart(true);
    try {
      const data = await getProductBySKU(sku);
      const variant = data?.variants?.[0];
      if (variant?.id) {
        try {
          const res = await dispatch(
            addToCartCommandV2({
              scene: 'rec-list',
              source: OnlineAddCartSource.Recommendation,
              variant: {
                id: variant.id,
                price: variant.price,
              },
              quantity: data?.min_sale_qty || 1,
              isLowStock: false,
            })
          );
          if ('error' in res && res.error) {
            throw new Error(res.error?.message);
          }
          // dispatch(
          //   EVENT_ADD_TO_CART({
          //     trackedProduct: getProductNeedTracking(res?.line_items?.[res?.line_items?.length - 1]),
          //     cartLineItems: currentOrderData?.line_items || [],
          //     qtyIncrements: data?.min_sale_qty || 1,
          //     itemTotal: toPrice(String(price), true),
          //     atcType: '1click',
          //   })
          // );
          setPendingAtcToastStatus(true);
        } catch (error) {
          logger.error('recommendation carousel product item v2 add to cart error', { error });
          setPendingAtcToastStatus(false);
        }
      } else {
        setPendingAtcToastStatus(false);
      }
    } catch (error) {
      logger.error('recommendation carousel product item v2 get product error', { error });
      setPendingAtcToastStatus(false);
    } finally {
      setWaitingAddToCart(false);
    }
  };

  const handleClickWishlist = async () => {
    if (wishlistLoading) {
      return;
    }
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
    setWishlistLoading(true);
    try {
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
        dispatch(
          EVENT_ADD_TO_WISHLIST({
            variant: {
              name: spuName,
              sku: sku,
              price: toPrice(String(price), true),
            },
          })
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (inWishlistPage) {
      onToastOpen?.('temp_remove', {
        id: Number(variantId),
        name: spuName,
      });
      return;
    }
    setWishlistLoading(true);
    try {
      await dispatch(deleteWishlist.initiate(variantId));
      onToastOpen?.('remove');
      setIsSelected(false);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleProductClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    if (!inWishlistPage) {
      dispatch(
        EVENT_STORYBLOK({ action: 'detailed_product_listing_click', label: name, method: document?.title || '' })
      );
    }
    if (slotId && onClickSuccess && !inWishlistPage) {
      onClickSuccess({
        slotId,
      });
    }
    window.setTimeout(() => {
      window.location.href = url;
    }, 1000);
  };

  const renderImagePart = () => {
    if (desktop) {
      return (
        <Stack
          sx={(theme) => ({
            position: 'relative',
            width: imageRealSize.width,
            height: imageRealSize.height,
            backgroundColor: bgColor || theme.palette.brand.warmLinen[200],
            justifyContent: 'flex-end',
            mb: '16px',
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <FortressImage
            src={usualImageSrc}
            alt={name}
            ratio={1}
            // ratio={imageRealSize.width / imageRealSize.height}
            objectFit="contain"
            imageWidth={imageRealSize.width}
            imageHeight={imageRealSize.height}
            sx={{
              '--AspectRatio-paddingBottom': 0,
            }}
          />
          {openHover && lifestyle !== '' && (
            <FortressImage
              src={lifestyle}
              alt={name}
              ratio={1}
              objectFit="contain"
              imageWidth={imageRealSize.width}
              imageHeight={imageRealSize.height}
              sx={{
                position: 'absolute',
                opacity: isHover ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                '--AspectRatio-paddingBottom': 0,
              }}
            />
          )}
          {badges.length > 0 && badges[0] !== '' && (
            <Typography
              level="caption2"
              sx={(theme) => ({
                position: 'absolute',
                top: theme.spacing(4),
                left: theme.spacing(4),
                backgroundColor: theme.palette.brand.terracotta[500],
                color: theme.palette.brand.warmLinen[500],
                padding: theme.spacing(1),
                fontSize: 12,
              })}
            >
              {badges[0]}
            </Typography>
          )}
        </Stack>
      );
    }
    if (lifestyle !== '' && openHover) {
      return (
        <Stack
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          sx={(theme) => ({
            position: 'relative',
            width: imageSize.width,
            height: imageSize.height,
            overflow: 'hidden',
            mb: theme.spacing(4),
            '.slick-track': {
              display: 'flex',
            },
            '.slick-list': {
              overflow: 'hidden',
              touchAction: 'pan-y pinch-zoom',
            },
            '.slick-slide': {
              div: {
                position: 'relative',
              },
            },
            '.slick-dots': {
              position: 'absolute',
              bottom: '8px',
              width: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex !important',
              padding: 0,
              margin: 0,
              '.slick-active': {
                backgroundColor: (theme) => theme.palette.brand.sage[500],
              },
              li: {
                minWidth: '8px',
                minHeight: '8px',
                borderRadius: '50%',
                backgroundColor: '#CCC',
                'list-style-type': 'none',
                marginRight: '8px',
              },
              button: {
                display: 'none',
              },
            },
          })}
        >
          <Slider arrows={false} dots={true} slidesToShow={1} slidesToScroll={1} infinite={false}>
            <Stack
              sx={{
                position: 'absolute',
                zIndex: 1,
                left: 0,
                top: 0,
                width: imageRealSize.width + 2,
                height: imageRealSize.height,
                overflow: 'hidden',
              }}
            >
              <FortressImage
                src={usualImageSrc}
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
            <Stack
              sx={{
                position: 'absolute',
                zIndex: 2,
                left: 0,
                top: 0,
                width: imageRealSize.width,
                height: imageRealSize.height,
                overflow: 'hidden',
              }}
            >
              <FortressImage
                src={lifestyle}
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
          </Slider>
          {badges.length > 0 && badges[0] !== '' && (
            <Typography
              level="caption2"
              sx={(theme) => ({
                position: 'absolute',
                top: theme.spacing(4),
                left: theme.spacing(4),
                backgroundColor: theme.palette.brand.terracotta[500],
                color: theme.palette.brand.warmLinen[500],
                padding: theme.spacing(1),
                fontSize: 12,
              })}
            >
              {badges[0]}
            </Typography>
          )}
        </Stack>
      );
    }
    return (
      <Stack sx={{ position: 'relative', height: imageRealSize.height }} justifyContent="flex-end">
        <FortressImage
          src={usualImageSrc}
          alt={name}
          ratio={imageRealSize.width / imageRealSize.height}
          objectFit="contain"
          imageWidth={imageRealSize.width}
          imageHeight={imageRealSize.height}
          sx={{
            '--AspectRatio-paddingBottom': 0,
          }}
        />
        {badges.length > 0 && badges[0] !== '' && (
          <Typography
            sx={(theme) => ({
              position: 'absolute',
              top: theme.spacing(4),
              left: theme.spacing(4),
              backgroundColor: theme.palette.brand.terracotta[500],
              color: theme.palette.brand.warmLinen[500],
              padding: theme.spacing(1),
              fontSize: 12,
            })}
            level="caption2"
          >
            {badges[0]}
          </Typography>
        )}
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
              mb: '16px',
            })}
          >
            <Typography
              sx={(theme) => ({
                color: theme.palette.brand.maroonVelvet[500],
                fontSize: 20,
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                ...(!desktop && {
                  fontSize: '18px !important',
                }),
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
              mb: '16px',
            })}
          >
            <Typography
              level="h5"
              sx={(theme) => ({
                color: theme.palette.brand.terracotta[500],
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
                  ml: '12px',
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
            mb: '16px',
          })}
        >
          <Typography
            level="h5"
            sx={(theme) => ({
              color: theme.palette.brand.maroonVelvet[500],
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
            })}
          >
            {toPrice(String(price), true)}
          </Typography>
        </Stack>
      );
    }
  };

  const isAtcLoading = useMemo(() => {
    return atcActionId === sku && (atcLoading || waitingAddToCart);
  }, [atcActionId, atcLoading, waitingAddToCart, sku]);

  // Trigger toast after loading ends
  useEffect(() => {
    if (pendingAtcToastStatus !== null && !isAtcLoading && atcActionId === sku) {
      onAtcToastOpen?.(pendingAtcToastStatus);
      setPendingAtcToastStatus(null);
      setAtcActionId('');
    }
  }, [isAtcLoading, pendingAtcToastStatus, atcActionId, sku, onAtcToastOpen]);

  return (
    <Stack
      sx={(theme) => ({
        justifyContent: 'space-between',
        height: '100%',
        ...(needMargin && {
          marginRight: desktop ? '24px' : '12px',
        }),
        ...(length && {
          marginBottom: desktop ? '40px' : '32px',
        }),
        a: {
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
            [`& .spu-name`]: {
              color: 'inherit !important',
            },
          },
        },
      })}
    >
      <CustomLink href={url} onClick={(e) => handleProductClick(e, url)}>
        {renderImagePart()}
        <Typography
          level="h5"
          className={'spu-name'}
          sx={(theme) => ({
            mb: '8px',
            color: theme.palette.brand.maroonVelvet[500],
            ...(!desktop && {
              mb: '4px',
            }),
          })}
        >
          {spuName}
        </Typography>
      </CustomLink>
      <Typography
        level="caption1"
        sx={(theme) => ({
          mb: '16px',
          ...(!desktop && {
            mb: '12px',
          }),
          color: theme.palette.brand.mono[700],
        })}
      >
        {productShortDescription || productOptionsPresentation}
      </Typography>
      {renderPricePart()}
      {applyATCAndWishlist && (
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {productType === 'bundle' && desktop ? (
            <Button
              variant="outlined"
              onClick={handleViewDetails}
              sx={(theme) => ({
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
                minHeight: theme.spacing(10),
                maxHeight: theme.spacing(10),
                border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                backgroundColor: 'transparent',
                color: theme.palette.brand.maroonVelvet[500],
                '&:hover': {
                  border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                  backgroundColor: '#63404B',
                  color: '#f6f3e7',
                },
                mr: theme.spacing(3),
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
                border: isAdded
                  ? `1px solid ${theme.palette.brand.maroonVelvet[500]}`
                  : `1px solid ${theme.palette.brand.mono[300]}`,
                mr: theme.spacing(3),
                backgroundColor: isAdded ? theme.palette.brand.maroonVelvet[500] : 'transparent',
                '&:hover': {
                  border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                  backgroundColor: theme.palette.brand.warmLinen[300],
                },
                cursor: isAdded || isAtcLoading ? 'default' : 'pointer',
              })}
              onClick={handleAddToCart}
            >
              {isAdded ? (
                <Check
                  sx={(theme) => ({
                    fill: theme.palette.brand.warmLinen[500],
                    width: '16px',
                    height: '16px',
                  })}
                />
              ) : isAtcLoading ? (
                <Loading
                  sx={(theme) => ({
                    width: '16px',
                    height: '16px',
                    fill: theme.palette.brand.maroonVelvet[500],
                    '@keyframes rotate': {
                      from: {
                        transform: 'rotate(0deg)',
                      },
                      to: {
                        transform: 'rotate(360deg)',
                      },
                    },
                    animation: 'rotate .5s linear infinite',
                  })}
                />
              ) : (
                <ShoppingBag
                  sx={(theme) => ({
                    fill: theme.palette.brand.maroonVelvet[500],
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
              backgroundColor: isSelected ? theme.palette.brand.maroonVelvet[500] : 'transparent',
              '&:hover': {
                border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                backgroundColor: isSelected
                  ? theme.palette.brand.maroonVelvet[500]
                  : theme.palette.brand.warmLinen[300],
              },
              cursor: wishlistLoading ? 'default' : 'pointer',
            })}
            onClick={handleClickWishlist}
          >
            {wishlistLoading ? (
              <Loading
                sx={(theme) => ({
                  width: '16px',
                  height: '16px',
                  fill: isSelected ? theme.palette.brand.warmLinen[500] : theme.palette.brand.maroonVelvet[500],
                  '@keyframes rotate': {
                    from: {
                      transform: 'rotate(0deg)',
                    },
                    to: {
                      transform: 'rotate(360deg)',
                    },
                  },
                  animation: 'rotate .5s linear infinite',
                })}
              />
            ) : isSelected ? (
              <Favorite
                sx={(theme) => ({
                  fill: theme.palette.brand.warmLinen[500],
                  width: '16px',
                  height: '16px',
                })}
              />
            ) : (
              <Favorite
                sx={(theme) => ({ fill: theme.palette.brand.maroonVelvet[500], width: '16px', height: '16px' })}
              />
            )}
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
};

export { ProductItemDataPropsV2, SingleProductItemV2 };
