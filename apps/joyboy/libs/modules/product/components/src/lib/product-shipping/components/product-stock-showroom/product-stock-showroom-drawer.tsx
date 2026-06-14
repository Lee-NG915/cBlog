'use client';

import { accessInSG } from '@castlery/config';
import {
  Box,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Link,
  Loading,
  ModalClose,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { CancelFilled, CheckCircleFilled, LocalParking, OpenInNew, ScheduleFilled } from '@castlery/fortress/Icons';
import {
  BundleVariants,
  LeadTimeShippingFeeReq,
  selectVariantQuantity,
  useLazyGetWebLeadTimeShippingFeeQuery,
  Variant,
} from '@castlery/modules-product-domain';
import { selectShippingCityInfo } from '@castlery/modules-user-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { useAppSelector } from '@castlery/shared-redux-store';
import { STOCK_STATE } from '@castlery/utils';
import { useEffect, useMemo } from 'react';

interface ProductStockShowroomDrawerProps {
  open: boolean;
  onClose: () => void;
  variant?: Variant;
  bundleVariants?: BundleVariants;
}

export const ProductStockShowroomDrawer = ({
  open,
  onClose,
  variant,
  bundleVariants,
}: ProductStockShowroomDrawerProps) => {
  const { zipcode, city, state } = useAppSelector(selectShippingCityInfo);
  const quantity = useAppSelector(selectVariantQuantity);
  const { desktop, mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.SHARED);
  const [getWebLeadTimeShippingFee, { isFetching, data: retailDetails }] = useLazyGetWebLeadTimeShippingFeeQuery();

  useEffect(() => {
    if (!variant?.id || !open || !quantity) return;
    const params: LeadTimeShippingFeeReq = {
      quantity,
      variant_id: variant?.id,
      zipcode,
      city,
      state,
    };
    if (bundleVariants && Object.keys(bundleVariants).length > 0) {
      params.options = {
        bundle_options: bundleVariants?.bundle_options,
      };
    }
    const getRetailDetails = async () => {
      await getWebLeadTimeShippingFee(params);
    };
    getRetailDetails();
  }, [bundleVariants, city, getWebLeadTimeShippingFee, open, quantity, state, variant?.id, zipcode]);

  const retailDetailsData = useMemo(() => {
    if (retailDetails) {
      const { retail_details = [] } = retailDetails;
      const inStockRetailDetails = retail_details?.filter((a) => a.stock_state !== STOCK_STATE.OUT_OF_STOCK) || [];
      const outOfStockRetailDetails = retail_details?.filter((a) => a.stock_state === STOCK_STATE.OUT_OF_STOCK) || [];
      return [...inStockRetailDetails, ...outOfStockRetailDetails];
    }
    return [];
  }, [retailDetails]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={desktop ? 'right' : 'bottom'}
      size="md"
      sx={{
        ...(!desktop && {
          '--Drawer-verticalSize': '80vh',
        }),
      }}
    >
      <DialogTitle component={Box}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="h3">Visit our showroom</Typography>
          <ModalClose />
        </Stack>
      </DialogTitle>
      <DialogContent>
        {isFetching ? (
          <Loading
            theme="dark"
            sx={{
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          retailDetailsData?.map((item, index) => (
            <Box key={item?.id || index}>
              <article>
                <Stack px={6} pb={4}>
                  <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mb={2}>
                    <Typography level="h4">{item?.name}</Typography>
                    <Link
                      href={item?.map_url}
                      variant="primary"
                      target="_blank"
                      level="body2"
                      sx={{
                        textDecorationLine: 'underline',
                        flexShrink: 0,
                      }}
                      endDecorator={
                        <OpenInNew
                          sx={{
                            width: '20px',
                            height: '20px',
                          }}
                        />
                      }
                    >
                      Get Directions
                    </Link>
                  </Stack>
                  <Typography
                    level="caption1"
                    sx={{
                      i: {
                        fontStyle: 'normal',
                      },
                    }}
                  >
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: item?.address,
                      }}
                    />
                  </Typography>
                  <Box mb={2} mt={mobile ? 4 : 5}>
                    <Typography level="h5" startDecorator={<ScheduleFilled />}>
                      Opening Hours
                    </Typography>
                  </Box>
                  <Typography level="body2">
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: item?.operating_hours,
                      }}
                    />
                  </Typography>
                  <Box mt={mobile ? 4 : 5} mb={2}>
                    <Typography level="h5" startDecorator={<LocalParking />}>
                      {t('common.parkingInfo')}
                    </Typography>
                  </Box>
                  <Typography level="body2">
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: item?.parking_info,
                      }}
                    />
                  </Typography>
                  <Stack gap={2} mt={mobile ? 4 : 5}>
                    <Typography
                      level="h5"
                      startDecorator={
                        item?.stock_state === STOCK_STATE.OUT_OF_STOCK ? <CancelFilled /> : <CheckCircleFilled />
                      }
                      sx={{
                        color: 'var(--fortress-palette-brand-mono-700)',
                        ...(item?.stock_state === STOCK_STATE.OUT_OF_STOCK
                          ? {
                              '& svg': {
                                path: {
                                  fill: 'var(--fortress-palette-brand-rosewood-500)',
                                },
                              },
                            }
                          : {
                              '& svg': {
                                path: {
                                  fill: 'var(--fortress-palette-brand-leafGreen-500)',
                                },
                              },
                            }),
                      }}
                    >
                      {item?.stock_state === STOCK_STATE.OUT_OF_STOCK
                        ? 'Item is not available for viewing'
                        : 'Item is available for viewing'}
                    </Typography>
                    <Typography
                      level="h5"
                      startDecorator={
                        item?.pickup_state === STOCK_STATE.OUT_OF_STOCK ? <CancelFilled /> : <CheckCircleFilled />
                      }
                      sx={{
                        color: 'var(--fortress-palette-brand-mono-700)',
                        ...(item?.pickup_state === STOCK_STATE.OUT_OF_STOCK
                          ? {
                              '& svg': {
                                path: {
                                  fill: 'var(--fortress-palette-brand-rosewood-500)',
                                },
                              },
                            }
                          : {
                              '& svg': {
                                path: {
                                  fill: 'var(--fortress-palette-brand-leafGreen-500)',
                                },
                              },
                            }),
                      }}
                    >
                      {item?.pickup_state === STOCK_STATE.OUT_OF_STOCK
                        ? 'Item is not ready for pickup'
                        : 'Item is ready for pickup'}
                    </Typography>
                  </Stack>
                </Stack>
              </article>
              {index !== (retailDetailsData?.length || 0) - 1 && (
                <Divider
                  sx={{
                    my: mobile ? 3 : 4,
                  }}
                />
              )}
            </Box>
          ))
        )}
      </DialogContent>
    </Drawer>
  );
};
