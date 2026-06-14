'use client';

import {
  BundleVariants,
  Product,
  toPrice,
  useLazyGetProductInstalmentQuery,
  Variant,
} from '@castlery/modules-product-domain';
import { usePrice } from '../../../../hooks/use-price';
import { Box, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { accessInAU, accessInUS, EcEnv } from '@castlery/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProductPaymentMethod } from '../product-payment-method/product-payment-method';
import { useAffirm } from '../../../../hooks/use-affirm';
import { ProductInstalmentDrawer } from './product-instalment-drawer';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';

interface ProductPriceProps {
  product: Product;
  variant: Variant;
  bundleVariant?: BundleVariants;
}

export const ProductPrice = (props: ProductPriceProps) => {
  const { product, variant, bundleVariant } = props;
  const dispatch = useAppDispatch();
  const [instalmentOpen, setInstalmentOpen] = useState(false);
  const { mobile } = useBreakpoints();
  const { variantPrice, variantListPrice, numberVariantPrice = 0 } = usePrice({ product, variant, bundleVariant });
  const showSalePrice = useMemo(
    () => variantPrice && variantListPrice && variantPrice !== variantListPrice,
    [variantListPrice, variantPrice]
  );
  const [getProductInstalment, { data: instalment, isLoading }] = useLazyGetProductInstalmentQuery();
  useAffirm();

  const handleTrackBnplEvent = useCallback(
    async (open: boolean) => {
      await dispatch(
        EVENT_PDP_DETAILS({
          action: 'bnpl',
          label: open ? 'expand' : 'close',
        })
      );
    },
    [dispatch]
  );

  const showInstalment = useCallback(() => {
    setInstalmentOpen(true);
    handleTrackBnplEvent(true);
  }, [handleTrackBnplEvent]);

  useEffect(() => {
    // tracking bnpl open and close
    const popupObserver = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        const addedNode = mutation.addedNodes?.[0] as HTMLElement;
        const removedNode = mutation.removedNodes?.[0] as HTMLElement;

        if (
          addedNode?.className === 'affirm-sandbox-container' ||
          addedNode?.className === 'zip-widget__popup__overlay'
        ) {
          handleTrackBnplEvent(true);
        }
        if (
          removedNode?.className === 'affirm-sandbox-container' ||
          removedNode?.className === 'zip-widget__popup__overlay'
        ) {
          handleTrackBnplEvent(false);
        }
      });
    });

    popupObserver.observe(document.body, { childList: true });
    return () => popupObserver.disconnect();
  }, [handleTrackBnplEvent]);

  useEffect(() => {
    if (EcEnv.NEXT_PUBLIC_INSTALMENT_ENABLED) {
      getProductInstalment({});
    }
  }, [getProductInstalment]);

  return (
    <>
      <Stack>
        <Stack direction={'row'} alignItems={'center'}>
          {variantPrice && (
            <Typography
              level="h3"
              sx={{
                ...(showSalePrice && {
                  fontWeight: 700,
                  color: 'var(--fortress-palette-brand-terracotta-500)',
                }),
              }}
            >
              {variantPrice}
            </Typography>
          )}
          {showSalePrice && (
            <Typography
              level="h3"
              ml={mobile ? 2 : 3}
              sx={{
                color: 'var(--fortress-palette-brand-mono-500)',
                textDecoration: 'line-through',
              }}
            >
              {variantListPrice}
            </Typography>
          )}
        </Stack>
        {accessInAU && <ProductPaymentMethod price={numberVariantPrice} />}
        {accessInUS && EcEnv.NEXT_PUBLIC_AFFIRM_ENABLED && (
          <Box mt={2}>
            <Typography
              level="caption1"
              className="affirm-as-low-as"
              data-page-type="product"
              data-amount={Math.floor(Number((numberVariantPrice * 100).toFixed(2)))}
              sx={{
                a: {
                  // 基础样式 - 对应 secondary color
                  color: 'var(--fortress-palette-neutral-500)',
                  'text-decoration': 'underline',
                  'text-decoration-color': 'var(--fortress-palette-neutral-500)',

                  // hover 状态
                  ':hover': {
                    color: 'var(--fortress-palette-neutral-600)',
                    'text-decoration-color': 'var(--fortress-palette-neutral-600)',
                  },

                  // active 状态
                  ':active': {
                    color: 'var(--fortress-palette-neutral-800)',
                    'text-decoration-color': 'var(--fortress-palette-neutral-800)',
                  },

                  // focus-visible 状态
                  ':focus-visible': {
                    color: 'var(--fortress-palette-neutral-600)',
                    'text-decoration-color': 'var(--fortress-palette-neutral-600)',
                    outline: '2px solid var(--fortress-palette-neutral-600)',
                    'outline-offset': '2px',
                  },

                  // disabled 状态
                  '&:disabled, &[disabled]': {
                    color: 'var(--fortress-palette-brand-mono-500)',
                    'text-decoration-color': 'var(--fortress-palette-brand-mono-500)',
                    cursor: 'not-allowed',
                  },
                },
              }}
            />
          </Box>
        )}
        {EcEnv.NEXT_PUBLIC_INSTALMENT_ENABLED && numberVariantPrice && numberVariantPrice >= 500 && instalment && (
          <Link
            component="button"
            variant="secondary"
            level="caption1"
            data-selenium="installment_expand"
            onClick={showInstalment}
            my={mobile ? 1 : 2}
            sx={{
              alignSelf: 'flex-start',
            }}
          >
            As low as&nbsp;
            {toPrice(
              numberVariantPrice /
                Math.max(
                  ...instalment.ipp_options.map((bank: any) => Math.max(...bank.options.map((o: any) => o?.period)))
                ) +
                '',
              true
            )}
            /month
          </Link>
        )}
        {product?.min_sale_qty >= 2 && (
          <Typography level="body2">
            The above price is the price of {product.min_sale_qty} chairs. Sold only in multiples of{' '}
            {product.min_sale_qty}
          </Typography>
        )}
      </Stack>
      <ProductInstalmentDrawer
        open={instalmentOpen}
        onClose={() => {
          setInstalmentOpen(false);
          handleTrackBnplEvent(false);
        }}
        instalment={instalment}
        price={numberVariantPrice}
      />
    </>
  );
};
