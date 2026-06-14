'use client';

import { EcEnv } from '@castlery/config';
import { IconButton, NiceModal, Stack, Toast, useBreakpoints } from '@castlery/fortress';
import { CheckCircleFilled, Close, Favorite, Loading, ShoppingBag } from '@castlery/fortress/Icons';
import FavoriteFilled from '@castlery/fortress/Icons/svg/FavoriteFilled';
import { getProductBySKU } from '@castlery/modules-cms-services';
import { addToCartCommandByParams } from '@castlery/modules-product-services';
import { toPrice } from '@castlery/modules-product-domain';
import {
  addWishlist,
  deleteWishlist,
  selectedWishList,
  setWishList,
  updateWishlistActionRecord,
} from '@castlery/modules-user-domain';
import { CustomLink, FortressImage, ScrollWrapper } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
import { Typography } from '@mui/joy';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Slider from 'react-slick';
import { ProductItemDataProps } from '@castlery/shared-components';

interface ProductItemProps {
  product: ProductItemDataProps;
  openHover?: boolean;
  imageType?: 'base_image' | 'lifestyle_image';
  bgColor?: string;
  needMargin?: boolean;
  length?: number;
  onModalOpen?: (value: boolean, type: 'success' | 'error', detail?: string) => void;
  onToastOpen?: (status: 'add' | 'remove') => void;
  applyATCAndWishlist?: boolean;
}

const ProductItem = ({
  product,
  openHover = false,
  imageType,
  bgColor,
  length,
  needMargin,
  onModalOpen,
  onToastOpen,
  applyATCAndWishlist,
}: ProductItemProps) => {
  const { sku, badges, images, name, price, salePrice, productShortDescription, spuName, url, variantId } = product;
  const wishList = useAppSelector(selectedWishList);
  const [isSelected, setIsSelected] = useState(false);
  const [waitingAddToCart, setWaitingAddToCart] = useState(false);
  const dispatch = useAppDispatch();

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
          width: 350,
          height: 350,
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
          width: 350,
          height: 350,
        };
      }
      return {
        width: 202,
        height: 202,
      };
    }
    if (desktop) {
      return {
        width: 350,
        height: 235,
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
    if (waitingAddToCart) return;
    setWaitingAddToCart(true);
    try {
      const data = await getProductBySKU(sku);
      if (!data?.variants?.[0]?.id) return;
      await dispatch(
        addToCartCommandByParams({
          variant_id: Number(variantId),
          quantity: data?.min_sale_qty || 1,
          suppressDefaultErrorModal: true,
        })
      ).unwrap();
      onModalOpen?.(true, 'success', undefined);
    } catch {
      onModalOpen?.(true, 'error', 'Unable to add item to cart');
    } finally {
      setWaitingAddToCart(false);
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
    }
  };

  const handleRemoveFromWishlist = async () => {
    const res = await dispatch(deleteWishlist.initiate(variantId));
    // const res = await removeFromWishlist(removeFromWishlistData);
    if (res) {
      setIsSelected(false);
      dispatch(updateWishlistActionRecord('remove'));
      const newWishList = [...wishList];
      if (newWishList.find((item) => item.id === Number(variantId))) {
        newWishList.splice(
          newWishList.findIndex((item) => item.id === Number(variantId)),
          1
        );
      }
      await dispatch(setWishList(newWishList));
      onToastOpen?.('remove');
    }
  };

  const handleProductClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    dispatch(EVENT_STORYBLOK({ action: 'detailed_product_listing_click', label: name, method: document?.title || '' }));
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
            ...(!desktop && {
              mb: '12px',
            }),
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <FortressImage
            src={usualImageSrc}
            alt={name}
            ratio={350 / 235}
            // ratio={imageRealSize.width / imageRealSize.height}
            objectFit="contain"
            imageWidth={imageRealSize.width}
            imageHeight={imageRealSize.height * (235 / 350)}
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
              }}
            />
          )}
          {badges.length > 0 && badges[0] !== '' && (
            <Typography
              sx={(theme) => ({
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: theme.palette.brand.terracotta[500],
                color: theme.palette.brand.warmLinen[500],
                padding: '6.5px 8px',
                fontSize: 14,
              })}
            >
              {badges[0]}
            </Typography>
          )}
        </Stack>
      );
    }
    if (lifestyle !== '') {
      return (
        <Stack
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          sx={(theme) => ({
            position: 'relative',
            width: imageSize.width + 2,
            height: imageSize.height,
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
                left: 0,
                top: 0,
              }}
            >
              <FortressImage
                src={baseChangeColor}
                alt={name}
                ratio={imageRealSize.width / imageRealSize.height}
                objectFit="contain"
                imageWidth={imageRealSize.width}
                imageHeight={imageRealSize.height}
              />
            </Stack>
            <Stack
              sx={{
                position: 'absolute',
                zIndex: 2,
                left: 0,
                top: 0,
              }}
            >
              <FortressImage
                src={lifestyle}
                alt={name}
                ratio={imageRealSize.width / imageRealSize.height}
                objectFit="contain"
                imageWidth={imageRealSize.width}
                imageHeight={imageRealSize.height}
              />
            </Stack>
          </Slider>
        </Stack>
      );
    }
    return (
      <FortressImage
        src={baseChangeColor}
        alt={name}
        ratio={imageRealSize.width / imageRealSize.height}
        objectFit="contain"
        imageWidth={imageRealSize.width}
        imageHeight={imageRealSize.height}
      />
    );
  };

  return (
    <Stack
      sx={(theme) => ({
        ...(needMargin && {
          marginRight: desktop ? '24px' : '12px',
        }),
        ...(length && {
          marginBottom: desktop ? '40px' : '32px',
        }),
        a: {
          textDecoration: 'none',
        },
      })}
    >
      <CustomLink href={url} onClick={(e) => handleProductClick(e, url)}>
        {renderImagePart()}
        <Typography
          sx={(theme) => ({
            fontSize: 24,
            color: theme.palette.brand.maroonVelvet[500],
            mb: '8px',
            ...(!desktop && {
              fontSize: '18px !important',
              mb: '4px',
            }),
          })}
        >
          {spuName}
        </Typography>
      </CustomLink>
      <Typography
        sx={(theme) => ({
          color: theme.palette.brand.mono[700],
          mb: '16px',
          ...(!desktop && {
            fontSize: '16px !important',
            mb: '12px',
          }),
        })}
      >
        {productShortDescription}
      </Typography>
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
            ...(!desktop && {
              fontSize: '18px !important',
            }),
          })}
        >
          {toPrice(showLineThroughPrice ? salePrice : String(price), true)}
        </Typography>
        {showLineThroughPrice && (
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.mono[500],
              fontSize: 20,
              textDecoration: 'line-through',
              ml: '12px',
              ...(!desktop && {
                fontSize: '18px !important',
              }),
            })}
          >
            {toPrice(String(price), true)}
          </Typography>
        )}
      </Stack>
      {applyATCAndWishlist && (
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <IconButton
            size="md"
            text="Add to Cart"
            sx={(theme) => ({
              borderRadius: '50%',
              border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
              mr: '12px',
              backgroundColor: theme.palette.brand.warmLinen[500],
            })}
            onClick={handleAddToCart}
          >
            {waitingAddToCart ? (
              <Loading
                sx={{
                  '@keyframes rotate': {
                    from: {
                      transform: 'rotate(0deg)',
                    },
                    to: {
                      transform: 'rotate(360deg)',
                    },
                  },
                  animation: 'rotate .5s linear infinite',
                }}
              />
            ) : (
              <ShoppingBag
                sx={(theme) => ({
                  fill: theme.palette.brand.maroonVelvet[500],
                })}
              />
            )}
          </IconButton>
          <IconButton
            size="md"
            text="Add to Wishlist"
            sx={(theme) => ({
              borderRadius: '50%',
              border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
              backgroundColor: isSelected ? theme.palette.brand.maroonVelvet[500] : theme.palette.brand.warmLinen[500],
            })}
            onClick={handleClickWishlist}
          >
            {isSelected ? (
              <FavoriteFilled
                sx={(theme) => ({
                  fill: theme.palette.brand.warmLinen[500],
                  width: '24px',
                  height: '24px',
                })}
              />
            ) : (
              <Favorite sx={(theme) => ({ fill: theme.palette.brand.maroonVelvet[500] })} />
            )}
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
};

interface ProductListProps {
  imageType?: 'base_image' | 'lifestyle_image';
  openHover?: boolean;
  products: ProductItemDataProps[];
  bgColor?: string;
  needSliderDisplay?: boolean;
  applyATCAndWishlist?: boolean;
}

const ProductList = ({
  imageType = 'base_image',
  openHover = false,
  products,
  bgColor,
  needSliderDisplay,
  applyATCAndWishlist,
}: ProductListProps) => {
  const { desktop } = useBreakpoints();
  const [listWidth, setListWidth] = useState(1728);
  const stackRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastStatus, setToastStatus] = useState<'add' | 'remove'>('add');
  const [modalInfo, setModalInfo] = useState<{
    title: string;
    type: 'success' | 'error';
    confirmText?: string;
    cancelText: string;
    desc?: string;
  }>({
    title: 'Item has been added into your cart!',
    type: 'success',
    confirmText: 'VIEW CART',
    cancelText: 'CLOSE',
  });
  useEffect(() => {
    const updateWidth = () => {
      if (stackRef.current) {
        const width = stackRef.current.offsetWidth;
        setListWidth(width);
      }
    };

    requestAnimationFrame(() => {
      updateWidth();

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setListWidth(entry.contentRect.width);
        }
      });

      if (stackRef.current) {
        resizeObserver.observe(stackRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    });
  }, []);

  const handleModalOpen = (value: boolean, type: 'success' | 'error', detail?: string) => {
    if (type === 'success') {
      setModalOpen(value);
      setModalInfo({
        title: 'Item has been added into your cart!',
        type: 'success',
        confirmText: 'VIEW CART',
        cancelText: 'CLOSE',
      });
    } else {
      setModalOpen(value);
      setModalInfo({
        title: 'Unable to add item to cart',
        desc:
          detail ||
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'error',
        confirmText: 'CLOSE',
        cancelText: 'CLOSE',
      });
    }
  };

  const renderModal = () => {
    return (
      <NiceModal
        title={modalInfo.title}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        success={modalInfo.type === 'success'}
        danger={modalInfo.type === 'error'}
        confirmText={modalInfo.confirmText}
        cancelText={modalInfo.cancelText}
        desc={modalInfo.desc}
        showCancelBtn={modalInfo.type === 'success'}
        onConfirm={() => {
          if (modalInfo.type === 'success') {
            window.location.href = `${
              EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
            }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`;
          } else {
            setModalOpen(false);
          }
        }}
        onCancel={() => {
          setModalOpen(false);
        }}
      />
    );
  };

  const handleToastOpen = (status: 'add' | 'remove') => {
    setToastStatus(status);
    setToastOpen(true);
  };

  const renderToast = () => {
    if (!desktop) {
      return (
        <Toast
          open={toastOpen}
          theme="dark"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          sx={{
            width: '342px',
          }}
          startDecorator={<CheckCircleFilled />}
          endDecorator={toastStatus === 'remove' ? <Close onClick={() => setToastOpen(false)} /> : null}
        >
          {toastStatus === 'remove' && (
            <Stack>
              <Typography
                sx={(theme) => ({
                  color: theme.palette.brand.warmLinen[500],
                  fontSize: '16px',
                })}
              >
                Removed from wishlist!
              </Typography>
            </Stack>
          )}
          {toastStatus === 'add' && (
            <Stack
              sx={{
                width: '80%',
              }}
            >
              <Stack
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  sx={(theme) => ({
                    color: theme.palette.brand.warmLinen[500],
                    marginRight: '8px',
                  })}
                >
                  Added to wishlist!
                </Typography>
                <Close onClick={() => setToastOpen(false)} />
              </Stack>
              <Stack
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
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
              </Stack>
            </Stack>
          )}
        </Toast>
      );
    }
  };

  if (!needSliderDisplay && desktop) {
    return (
      <Stack
        direction="row"
        sx={{
          width: '100%',
          padding: '40px 32px',
          flexWrap: 'wrap',
        }}
        ref={stackRef}
      >
        {products.map((product, index) => {
          return (
            <Stack
              key={index}
              sx={{
                flex: '0 0 25%',
                ...(!desktop && {
                  flex: '0 0 50%',
                }),
                alignItems: 'center',
              }}
            >
              <ProductItem
                length={(listWidth - (desktop ? 100 : 12)) / (desktop ? 4 : 2)}
                product={product}
                openHover={openHover}
                imageType={imageType}
                bgColor={bgColor}
                needMargin={index % (desktop ? 4 : 2) !== (desktop ? 3 : 1) ? true : false}
                onModalOpen={handleModalOpen}
                applyATCAndWishlist={applyATCAndWishlist}
              />
            </Stack>
          );
        })}
        {renderModal()}
        {renderToast()}
      </Stack>
    );
  }
  return (
    <Stack
      sx={(theme) => ({
        mt: '32px',
        width: '100%',
        ...(!desktop && {
          mt: '16px',
        }),
      })}
    >
      <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true}>
        <Stack
          direction="row"
          sx={{
            width: 'fit-content',
            minWidth: '100%',
            gap: desktop ? 6 : 3,
          }}
        >
          {products.map((product, index) => {
            return (
              <ProductItem
                key={index}
                product={product}
                openHover={openHover}
                imageType={imageType}
                bgColor={bgColor}
                onModalOpen={handleModalOpen}
                onToastOpen={handleToastOpen}
              />
            );
          })}
        </Stack>
      </ScrollWrapper>
      {renderModal()}
      {renderToast()}
    </Stack>
  );
};

export { ProductList };
