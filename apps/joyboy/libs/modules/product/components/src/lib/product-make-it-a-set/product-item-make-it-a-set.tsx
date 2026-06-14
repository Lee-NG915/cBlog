'use client';

import { Button, IconButton, Stack, Typography, useBreakpoints, Loading } from '@castlery/fortress';
import { ShoppingBag } from '@castlery/fortress/Icons';
import { getProductBySKU } from '@castlery/modules-cms-services';
import { EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT, trackDy } from '@castlery/modules-tracking-services';
import { addToCartCommandByParams } from '@castlery/modules-product-services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DYProduct, FortressImage, NextFortressLink } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { toPrice } from '@castlery/utils';
import { useEffect, useState, useRef } from 'react';
import { Variant } from '@castlery/modules-product-domain';

interface ProductItemMakeItASetProps {
  product: DYProduct;
  onModalOpen: (
    open: boolean,
    type: 'success' | 'error',
    message?: string,
    productInfo?: { variant: Variant; price: string; listPrice: string }
  ) => void;
}

const ProductItemMakeItASet = ({ product, onModalOpen }: ProductItemMakeItASetProps) => {
  const { productData, slotId, sku } = product;
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [waitingAddToCart, setWaitingAddToCart] = useState(false);
  const isImpressionSentRef = useRef(false);

  useEffect(() => {
    if (!slotId || isImpressionSentRef.current) return;
    trackDy('Add-on Recommendations Impression', { value: 0 });
    isImpressionSentRef.current = true;
  }, [slotId]);

  const renderPrice = (price: number, salePrice: string) => {
    if (salePrice !== '') {
      if (Number(price) !== Number(salePrice)) {
        return (
          <Stack direction="row" alignItems="center" gap={mobile ? 1 : 2}>
            <Typography level="h5" sx={(theme) => ({ color: theme.palette.brand.terracotta[500] })}>
              {toPrice(Number(salePrice), true)}
            </Typography>
            <Typography
              level="h5"
              sx={(theme) => ({ color: theme.palette.brand.mono[500], textDecoration: 'line-through' })}
            >
              {toPrice(price, true)}
            </Typography>
          </Stack>
        );
      }
    }
    return (
      <Typography level="h5" sx={(theme) => ({ color: theme.palette.brand.maroonVelvet[500] })}>
        {toPrice(price, true)}
      </Typography>
    );
  };
  const handleAddToCart = async () => {
    if (waitingAddToCart) return;
    setWaitingAddToCart(true);
    try {
      const data = await getProductBySKU(sku);
      if (!data?.variants?.[0]?.id) return;
      await dispatch(
        addToCartCommandByParams({
          variant_id: Number(data?.variants?.[0]?.id),
          quantity: data?.min_sale_qty || 1,
          source: '1click',
          suppressDefaultErrorModal: true,
        })
      ).unwrap();
      onModalOpen(true, 'success', undefined, {
        variant: data?.variants?.[0],
        price: String(productData.price),
        listPrice: String(productData.sale_price || productData.price),
      });
    } catch {
      onModalOpen(true, 'error', 'Unable to add item to cart');
    } finally {
      setWaitingAddToCart(false);
    }
  };
  const handleLinkClick = () => {
    dispatch(EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT({ slotId }));
    trackDy('Add-on Recommendations Click', { value: 0 });
  };
  return (
    <Stack
      sx={(theme) => ({
        backgroundColor: theme.palette.brand.warmLinen[300],
        minWidth: theme.spacing(45),
        maxWidth: theme.spacing(45),
        ...(mobile && {
          minWidth: theme.spacing(50.5),
          maxWidth: theme.spacing(50.5),
        }),
      })}
      key={slotId}
    >
      <Stack
        sx={(theme) => ({
          width: '100%',
          backgroundColor: theme.palette.brand.warmLinen[200],
        })}
      >
        <NextFortressLink key={slotId} href={productData.url} onClick={handleLinkClick}>
          <FortressImage sx={{ width: '100%' }} src={productData.image_url} alt={productData.name} />
        </NextFortressLink>
      </Stack>
      <Stack
        sx={(theme) => ({
          padding: theme.spacing(4),
        })}
      >
        <Stack
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2),
            width: '100%',
            mb: theme.spacing(2),
          })}
        >
          <NextFortressLink
            key={slotId}
            sx={{ textDecoration: 'none' }}
            href={productData.url}
            onClick={handleLinkClick}
          >
            <Typography
              level="h5"
              sx={(theme) => ({
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: theme.palette.brand.maroonVelvet[500],
                maxWidth: '100%',
                ...(mobile && {
                  WebkitLineClamp: 2,
                }),
              })}
            >
              {productData.spu_name}
            </Typography>
          </NextFortressLink>
          <Typography
            level="caption1"
            sx={(theme) => ({
              color: theme.palette.brand.mono[700],
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            })}
          >
            {productData.product_short_description}
          </Typography>
          {renderPrice(productData.price, productData.sale_price)}
        </Stack>
        <IconButton
          size="md"
          aria-label="Cart Action"
          sx={(theme) => ({
            borderRadius: '50%',
            border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
            backgroundColor: theme.palette.brand.warmLinen[500],
            padding: `0 !important`,
            maxWidth: theme.spacing(6),
            maxHeight: theme.spacing(6),
            minWidth: theme.spacing(6),
            minHeight: theme.spacing(6),
            '&:hover': {
              border: `1px solid ${theme.palette.brand.maroonVelvet[500]}`,
              backgroundColor: '#F9F7F3',
            },
          })}
          onClick={handleAddToCart}
        >
          {waitingAddToCart ? (
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
                width: `${theme.spacing(3.5)} !important`,
                height: `${theme.spacing(3.5)} !important`,
              })}
            />
          )}
        </IconButton>
      </Stack>
    </Stack>
  );
};

export { ProductItemMakeItASet };
