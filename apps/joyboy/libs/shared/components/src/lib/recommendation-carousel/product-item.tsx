'use client';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { Button, IconButton, Stack, Typography, useBreakpoints, Loading } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Check, Favorite, ShoppingBag } from '@castlery/fortress/Icons';
import { getProductBySKU } from '@castlery/modules-cms-services';
import { selectOrder } from '@castlery/modules-order-domain';
import { toPrice, Variant } from '@castlery/modules-product-domain';
import { addToCartCommandByParams } from '@castlery/modules-product-services';
import { EVENT_ADD_TO_WISHLIST, EVENT_RECOMMENDATIONS, EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
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

interface ProductItemDataProps {
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
}

interface ProductItemProps {
  product: ProductItemDataProps;
  openHover?: boolean;
  imageType?: 'base_image' | 'lifestyle_image';
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
  inWishlistPage?: boolean;
}

const getCanonicalUrl = (url: string) => {
  return url.split('?')[0];
};

const SingleProductItem = ({
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
  } = product;
  const canonicalUrl = useMemo(() => getCanonicalUrl(url), [url]);
  const currentOrderData = useAppSelector(selectOrder);
  const wishList = useAppSelector(selectedWishList);
  const [isSelected, setIsSelected] = useState(false);
  const [waitingAddToCart, setWaitingAddToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const highlightBadgeList = ['Sale', 'Clearance', 'Extra 5% Off'];

  /** 内部链接路径（不含 query），用于 CustomLink 与客户端跳转 */
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

  const objectFit = useMemo(() => {
    if (openHover) {
      return 'contain';
    }
    if (imageType === 'lifestyle_image') {
      return lifestyle !== '' ? 'cover' : 'contain';
    }
    return 'contain';
  }, [imageType, lifestyle, openHover]);

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
    if (waitingAddToCart || addToCartSuccess) return;
    setWaitingAddToCart(true);
    try {
      const data = await getProductBySKU(sku);
      if (!data?.variants?.[0]?.id) return;
      await dispatch(
        addToCartCommandByParams({
          variant_id: Number(variantId),
          quantity: data?.min_sale_qty || 1,
          source: '1click',
          suppressDefaultErrorModal: true,
        })
      ).unwrap();
      setAddToCartSuccess(true);
      dispatch(
        EVENT_RECOMMENDATIONS({
          pageComponent: 'regular',
          category: 'recommendation_add_to_cart',
          action: 'add_to_cart',
          tag: 'target_sku',
          tagValue: sku,
        })
      );
      onModalOpen?.(true, 'success', undefined, {
        variant: data?.variants?.[0],
        price: String(price),
        listPrice: String(salePrice),
      });
    } catch {
      onModalOpen?.(true, 'error', 'Unable to add item to cart');
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
          EVENT_RECOMMENDATIONS({
            pageComponent: 'regular',
            category: 'recommendation_wishlist',
            action: 'add_to_wishlist',
            tag: 'target_sku',
            tagValue: sku,
          })
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleViewDetails = () => {
    router.push(internalPath);
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
      if (!inWishlistPage) {
        dispatch(
          EVENT_RECOMMENDATIONS({
            pageComponent: 'regular',
            category: 'recommendation_wishlist',
            action: 'remove_from_wishlist',
            tag: 'target_sku',
            tagValue: sku,
          })
        );
      }
      onToastOpen?.('remove');
      setIsSelected(false);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleProductClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (!inWishlistPage) {
      dispatch(
        EVENT_RECOMMENDATIONS({
          pageComponent: 'regular',
          category: 'recommendation_click',
          action: 'click',
          label: 'product_card',
          tag: 'target_sku',
          tagValue: sku,
        })
      );
      // dispatch(
      //   EVENT_STORYBLOK({ action: 'detailed_product_listing_click', label: name, method: document?.title || '' })
      // );
    }
    if (slotId && onClickSuccess && !inWishlistPage) {
      onClickSuccess({
        slotId,
      });
    }
    window.setTimeout(() => {
      router.push(path);
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
            objectFit={objectFit}
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
              objectFit="cover"
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
                backgroundColor: highlightBadgeList.includes(badges[0])
                  ? theme.palette.brand.burntOrange[400]
                  : theme.palette.brand.terracotta[500],
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
                objectFit={objectFit}
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
                objectFit="cover"
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
          objectFit={objectFit}
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

  return (
    <Stack
      sx={(theme) => ({
        justifyContent: 'space-between',
        height: '100%',
        maxWidth: 256,
        ...(needMargin && {
          marginRight: desktop ? '24px' : '12px',
        }),
        ...(length && {
          marginBottom: desktop ? '40px' : '32px',
        }),
        ...(!desktop && {
          maxWidth: 202,
        }),
        a: {
          textDecoration: 'none',
        },
      })}
    >
      <CustomLink href={canonicalUrl} onClick={(e) => handleProductClick(e, internalPath)}>
        {renderImagePart()}
        <Typography
          level="h5"
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
        })}
      >
        {productShortDescription}
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
                border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                mr: theme.spacing(2),
                minWidth: theme.spacing(6),
                minHeight: theme.spacing(6),
                maxWidth: theme.spacing(6),
                maxHeight: theme.spacing(6),
                backgroundColor: theme.palette.brand.warmLinen[500],
                '&:hover': {
                  border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                  backgroundColor: '#F9F7F3',
                },
                cursor: addToCartSuccess || waitingAddToCart ? 'default' : 'pointer',
              })}
              onClick={handleAddToCart}
            >
              {addToCartSuccess ? (
                <Check
                  sx={(theme) => ({
                    fill: theme.palette.brand.maroonVelvet[500],
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
                      stroke: theme.palette.brand.maroonVelvet[500],
                    },
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
              border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
              backgroundColor: isSelected ? theme.palette.brand.maroonVelvet[500] : theme.palette.brand.warmLinen[500],
              minWidth: theme.spacing(6),
              minHeight: theme.spacing(6),
              maxWidth: theme.spacing(6),
              maxHeight: theme.spacing(6),
              '&:hover': {
                border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
                backgroundColor: isSelected ? theme.palette.brand.maroonVelvet[500] : '#F9F7F3',
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

export { ProductItemDataProps, SingleProductItem };
