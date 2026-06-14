'use client';

import {
  selectBundleVariants,
  selectCurrentProductStockState,
  selectLeadtimeShippingFee,
  selectVariant,
} from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useMemo, useState } from 'react';
import { STOCK_STATE } from '@castlery/utils';
import { Box, Link, Stack, Typography } from '@castlery/fortress';
import { ArrowForwardIos, CancelFilled, CheckCircleFilled, ChevronRight, StoreFront } from '@castlery/fortress/Icons';
import { ProductStockShowroomDrawer } from './product-stock-showroom-drawer';

export const ProductStockShowroom = () => {
  const [openShowroomDrawer, setOpenShowroomDrawer] = useState(false);
  const variant = useAppSelector(selectVariant);
  const leadTimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const stockState = useAppSelector(selectCurrentProductStockState);
  const bundleVariants = useAppSelector(selectBundleVariants);

  const retailDetails = useMemo(() => {
    return leadTimeShippingFee?.retail_details;
  }, [leadTimeShippingFee]);

  const retailStockState = useMemo(() => {
    return retailDetails?.some((item) => item.stock_state !== STOCK_STATE.OUT_OF_STOCK);
  }, [retailDetails]);

  const pickupStockState = useMemo(() => {
    return retailDetails?.some((item) => item.pickup_state !== STOCK_STATE.OUT_OF_STOCK);
  }, [retailDetails]);

  return (
    <>
      {/* {retailDetails &&
        retailDetails?.length > 0 &&
        retailDetails?.some((item) => item.stock_state !== STOCK_STATE.OUT_OF_STOCK) ? (
        <Stack
          direction="row"
          alignItems="center"
          gap={2}
          sx={{
            mt: 2,
          }}
        >
          {hasAvailableShowroomStock ? (
            <Typography
              level="body2"
              sx={{
                color: 'var(--fortress-palette-neutral-plainColor)',
              }}
            >
              Item is available for viewing.
            </Typography>
          ) : null}
          {shouldShowFindShowroomLink ? (
            <Link
              variant="primary"
              component="button"
              endDecorator={
                <ArrowForwardIos
                  sx={{
                    width: '20px',
                    height: '20px',
                  }}
                />
              }
              level="caption1"
              onClick={() => {
                setOpenShowroomDrawer(true);
              }}
            >
              Find showroom
            </Link>
          ) : null}
        </Stack>
      ) : null}
      {shouldShowUnavailableText ? (
        <Typography
          level="body2"
          sx={{
            mt: 2,
            color: 'var(--fortress-palette-neutral-plainColor)',
          }}
        >
          Currently unavailable.
        </Typography>
      ) : null} */}

      <Stack direction="row" justifyContent="space-between" alignItems="center" py={4}>
        <Stack direction="row" alignItems="flex-start" gap={2}>
          <Box
            sx={{
              color: 'var(--fortress-palette-brand-mono-900)',
            }}
          >
            <StoreFront />
          </Box>
          <Stack gap={1} alignItems="flex-start" mt={'1px'}>
            <Typography
              level="h5"
              sx={{
                color: 'var(--fortress-palette-brand-maroonVelvet-500)',
              }}
            >
              Locate our showroom
            </Typography>
            {!retailStockState && stockState === STOCK_STATE.OUT_OF_STOCK ? (
              <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-rosewood-500)' }}>
                Item is not available for viewing
              </Typography>
            ) : (
              <>
                <Typography
                  level="body2"
                  startDecorator={retailStockState ? <CheckCircleFilled /> : <CancelFilled />}
                  sx={{
                    color: 'var(--fortress-palette-brand-mono-700)',
                    ...(retailStockState
                      ? {
                          '& svg': {
                            path: {
                              fill: 'var(--fortress-palette-brand-leafGreen-500)',
                            },
                          },
                        }
                      : {
                          '& svg': {
                            path: {
                              fill: 'var(--fortress-palette-brand-rosewood-500)',
                            },
                          },
                        }),
                  }}
                >
                  {retailStockState ? 'Item is available for viewing' : 'Item is not available for viewing'}
                </Typography>
                <Typography
                  level="body2"
                  startDecorator={pickupStockState ? <CheckCircleFilled /> : <CancelFilled />}
                  sx={{
                    color: 'var(--fortress-palette-brand-mono-700)',
                    ...(pickupStockState
                      ? {
                          '& svg': {
                            path: {
                              fill: 'var(--fortress-palette-brand-leafGreen-500)',
                            },
                          },
                        }
                      : {
                          '& svg': {
                            path: {
                              fill: 'var(--fortress-palette-brand-rosewood-500)',
                            },
                          },
                        }),
                  }}
                >
                  {pickupStockState ? 'Item is ready for pickup' : 'Item is not ready for pickup'}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
        <ChevronRight
          sx={{
            cursor: 'pointer',
            color: '#212121',
          }}
          onClick={() => {
            setOpenShowroomDrawer(true);
          }}
        />
      </Stack>
      <ProductStockShowroomDrawer
        open={openShowroomDrawer}
        onClose={() => setOpenShowroomDrawer(false)}
        variant={variant}
        bundleVariants={bundleVariants}
      />
    </>
  );
};
