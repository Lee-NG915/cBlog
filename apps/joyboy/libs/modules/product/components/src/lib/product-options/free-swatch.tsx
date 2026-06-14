'use client';

import { Add, Delete } from '@castlery/fortress/Icons';
import { Button, Drawer, Link, Stack, Typography, Card, AspectRatio, CardOverflow } from '@castlery/fortress';
import { selectProduct, useGetSwatchesByProductIdQuery } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import Image from 'next/image';
import * as React from 'react';
import { useFreeSwatchCart } from './use-free-swatch-cart';

export const FreeSwatch = () => {
  const [open, setOpen] = React.useState(false);
  const [hadShowMore, setHadShowMore] = React.useState<{ id: number; hadShow: boolean }[]>([]);

  const productId = useAppSelector(selectProduct)?.id;
  const {
    isInCart,
    addSwatchToCart,
    removeSwatchFromCart,
    getAddToCartButtonState,
    getRemoveFromCartButtonState,
    canShowEmptyState,
  } = useFreeSwatchCart();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { currentData, isLoading, isFetching } = useGetSwatchesByProductIdQuery(productId as number, {
    skip: !open,
  });

  const handleClickShowMore = (id: number) => {
    setHadShowMore((prev) => [...prev, { id, hadShow: true }]);
  };

  const judgeIfShow = (id: number, isText: boolean) => {
    let canShow = isText ? false : true;
    hadShowMore.forEach((item) => {
      if (item.id === id) {
        canShow = isText ? true : false;
      }
    });
    return canShow;
  };

  return (
    <>
      <Link
        onClick={() => {
          setOpen(true);
        }}
        level="caption2"
      >
        Free Fabric Swatch
      </Link>
      <Drawer
        title="Add Free Fabric Swatches"
        showCloseButton
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Typography level="body2">
          Want to view the fabric before your purchase? Not a problem, we will send you up to 3 fabric swatches for
          free.
        </Typography>

        <Stack gap={2}>
          {currentData?.map((swatch) => {
            return (
              <Card key={swatch.id}>
                <Stack>
                  <Typography level="subh2">{swatch.presentation}</Typography>
                  <Typography level="caption2">{swatch.description}</Typography>
                  {judgeIfShow(swatch.id, false) && (
                    <Typography
                      sx={{
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'none',
                          color: (theme) => theme.palette.brand.wheat[700],
                        },
                      }}
                      onClick={() => handleClickShowMore(swatch.id)}
                    >
                      Show More
                    </Typography>
                  )}
                  {judgeIfShow(swatch.id, true) &&
                    swatch.product_properties.map((property) => {
                      return (
                        <Stack key={property.presentation}>
                          <Typography level="caption1">{property.presentation}</Typography>
                          <Typography level="caption2">{property.value}</Typography>
                        </Stack>
                      );
                    })}
                  {swatch.variants.map((variant) => {
                    const isVariantInCart = isInCart(variant.id);
                    const addButtonState = getAddToCartButtonState(variant.id);
                    const removeButtonState = getRemoveFromCartButtonState();

                    return (
                      <Card key={variant.id}>
                        <CardOverflow>
                          <AspectRatio>
                            <Image src={variant.images[0]?.links.large} layout="fill" alt={variant.name} />
                          </AspectRatio>
                        </CardOverflow>
                        <Typography level="caption1">{variant.name}</Typography>
                        <CardOverflow>
                          {isVariantInCart ? (
                            <Button
                              fullWidth
                              loading={removeButtonState.loading}
                              disabled={removeButtonState.disabled}
                              size="sm"
                              variant="outlined"
                              onClick={() => {
                                removeSwatchFromCart(variant.id);
                              }}
                            >
                              <>
                                <Delete fill="#fff" />
                                Tap to Remove
                              </>
                            </Button>
                          ) : (
                            <Button
                              fullWidth
                              loading={addButtonState.loading}
                              disabled={addButtonState.disabled}
                              size="sm"
                              variant="outlined"
                              onClick={() => {
                                addSwatchToCart(variant);
                              }}
                            >
                              <>
                                <Add fill="#fff" />
                                Add to Cart
                              </>
                            </Button>
                          )}
                        </CardOverflow>
                      </Card>
                    );
                  })}
                </Stack>
              </Card>
            );
          })}
          {open && canShowEmptyState && currentData?.length === 0 && (
            <Typography
              sx={{
                mt: 4,
              }}
              level="body2"
            >
              No available swatches for this product.
            </Typography>
          )}
        </Stack>
      </Drawer>
    </>
  );
};
