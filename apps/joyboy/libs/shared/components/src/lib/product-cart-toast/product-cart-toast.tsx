'use client';

import { EcEnv } from '@castlery/config';
import { Box, Button, Stack, Toast, Typography, useBreakpoints } from '@castlery/fortress';
import { CheckCircle, Close } from '@castlery/fortress/Icons';
import { selectOrder } from '@castlery/modules-order-domain';
import { Product, Variant } from '@castlery/modules-product-domain';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { useHeaderVisibility } from '../../hooks/use-header-visibility';
import { useAppSelector } from '@castlery/shared-redux-store';
// import { Order } from '@castlery/types';
import { useMemo } from 'react';

interface ProductCartToastProps {
  open: boolean;
  onClose: () => void;
  variant?: Variant;
  price?: string;
  listPrice?: string;
  numberPrice?: number;
  numberListPrice?: number;
}

// price 计算与 op 完全不同，因为 cart toast 只展示当前加车后的商品信息，所以购物车中若存在多个当前商品时不能展示接口中的所有 price 等信息

export const ProductCartToast = (props: ProductCartToastProps) => {
  const { open, onClose, variant, price, listPrice, numberPrice, numberListPrice } = props;
  const orderData = useAppSelector(selectOrder);
  const { desktop, mobile } = useBreakpoints();
  const { isHeaderVisible, headerBottom } = useHeaderVisibility();

  const showSalePrice = useMemo(() => {
    return numberPrice !== numberListPrice;
  }, [numberPrice, numberListPrice]);

  const addToCartVariantLineItem = useMemo(() => {
    if (!variant?.id) return null;
    return orderData?.line_items?.find((item) => item.variant.id === variant.id) || null;
  }, [orderData?.line_items, variant?.id]);

  const productImage = addToCartVariantLineItem?.variant?.images?.[0]?.links?.feed || '';
  const productName = addToCartVariantLineItem?.variant?.product_name || '';

  const productOverlayList = useMemo(() => {
    return (
      addToCartVariantLineItem?.bundle_line_items
        ?.map((item) => {
          if (item?.bundle_option?.bundle_option_type !== 'simple' && item?.variant) {
            return item?.variant?.overlay?.links?.large_overlay || null;
          } else {
            return null;
          }
        })
        .filter((item): item is string => item !== null) || []
    );
  }, [addToCartVariantLineItem?.bundle_line_items]);

  const renderProductOptions = () => {
    if (addToCartVariantLineItem?.product_type === 'bundle') {
      const bundleNames =
        addToCartVariantLineItem?.bundle_line_items
          ?.map((item) => item.variant?.product_name)
          .filter(Boolean)
          .join(', ') || '';
      return (
        <Typography
          level="body2"
          sx={{
            color: 'var(--fortress-palette-brand-mono-700)',
          }}
        >
          {bundleNames}
        </Typography>
      );
    }

    const optionValues =
      addToCartVariantLineItem?.variant?.variant_option_values
        ?.map((item) => item.presentation)
        .filter(Boolean)
        .join(', ') || '';
    return (
      <Typography
        level="body2"
        sx={{
          color: 'var(--fortress-palette-brand-mono-700)',
        }}
      >
        {optionValues}
      </Typography>
    );
  };

  return (
    <Toast
      theme="light"
      anchorOrigin={{ vertical: 'top', horizontal: mobile ? 'center' : 'right' }}
      open={open}
      onClose={onClose}
      sx={{
        px: 5,
        py: mobile ? 4 : 6,
        boxShadow: (theme) => theme.shadow.md,
        '--Snackbar-inset': (theme) => (isHeaderVisible ? `${headerBottom}px` : theme.spacing(6)),
        ...(desktop && {
          width: '560px',
          right: (theme) => theme.spacing(6),
        }),
        ...(mobile && {
          width: '90%',
        }),
      }}
    >
      <Stack
        gap={6}
        sx={{
          width: '100%',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <CheckCircle />
            <Typography level="h4">Item has been added into your cart!</Typography>
          </Stack>
          <Close
            onClick={onClose}
            sx={{
              cursor: 'pointer',
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="center" alignItems="center" gap={4}>
          <Box
            sx={{
              width: '40%',
              alignSelf: 'stretch',
              position: 'relative',
            }}
          >
            <>
              <FortressImage
                src={productImage}
                alt={`${addToCartVariantLineItem?.variant?.product_name} cart image`}
                sx={{
                  height: '100%',
                  '--AspectRatio-paddingBottom': 0,
                }}
              />
              {addToCartVariantLineItem?.product_type === 'bundle' &&
                productOverlayList?.map((item, index) => {
                  return (
                    <FortressImage
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: index + 10,
                        height: '100%',
                        '--AspectRatio-paddingBottom': 0,
                      }}
                      key={item + index}
                      src={item?.split('-test').join('')}
                      alt=""
                      sizes={['0.2-md', '0.3-sm', '0.3-xs']}
                    />
                  );
                })}
            </>
          </Box>
          <Stack
            sx={{
              width: '60%',
            }}
          >
            <Stack>
              <Typography
                level="body1"
                sx={{
                  mb: 1,
                }}
              >
                {productName}
              </Typography>
              {renderProductOptions()}
            </Stack>
            <Stack direction="row" justifyContent="flex-start" alignItems="center" mt={mobile ? 2 : 3} spacing={2}>
              <Typography
                level="h5"
                component={'span'}
                sx={{
                  ...(showSalePrice
                    ? {
                        fontWeight: 700,
                        color: 'var(--fortress-palette-brand-terracotta-500)',
                      }
                    : {
                        color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                      }),
                }}
              >
                {price}
              </Typography>
              {showSalePrice && (
                <Typography
                  level="h5"
                  component={'span'}
                  style={{ color: 'var(--fortress-palette-brand-mono-500)', textDecoration: 'line-through' }}
                >
                  {listPrice}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
        <Button
          variant="primary"
          component={CustomLink}
          href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/cart`}
          isExternal={true}
          prefetch={false}
        >
          View Cart
        </Button>
      </Stack>
    </Toast>
  );
};
