'use client';

import { Loading, Sheet, Stack, Tag, Typography, withBrandColor } from '@castlery/fortress';
import { CheckCircle, OOS, StandardInfo } from '@castlery/fortress/Icons';
import { selectCurrentProductStockState, selectLeadtimeShippingFee } from '@castlery/modules-product-domain';
import { refreshWebLeadTimeCommand } from '@castlery/modules-product-services';
import {
  selectedErrorInfo,
  selectedIsOpenZipcodeFailureModal,
  updateIsOpenZipcodeFailureModal,
} from '@castlery/modules-user-domain';
import { ZipcodeFailureModal } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { STOCK_STATE } from '@castlery/utils';
import { useEffect, useMemo } from 'react';
import { ProductKeepUpdated } from './components/product-keep-updated/product-keep-updated';
import { ProductStockShowroom } from './components/product-stock-showroom/product-stock-showroom';
import { ProductUSP } from './components/product-usp/product-usp';
import { trackingFeatureService } from '@castlery/modules-tracking-services';
import { ProductMakeItASet } from '../product-make-it-a-set';
import LazyLoad from 'react-lazyload';
import { ProductShippingInfo } from './components/product-shipping-info/product-shipping-info';

const StockState = () => {
  const stockState = useAppSelector(selectCurrentProductStockState);
  switch (stockState) {
    case STOCK_STATE.OUT_OF_STOCK:
      return (
        <>
          <Tag
            variant="solid"
            color="danger"
            startDecorator={
              <OOS
                sx={{
                  width: '20px',
                  height: '20px',
                }}
              />
            }
          >
            <Typography level="caption2">Out of stock</Typography>
          </Tag>
        </>
      );
    case STOCK_STATE.LOW_IN_STOCK:
      //   if (accessInUK) {
      //     return <Tag>SELLING FAST</Tag>;
      //   }
      return (
        <>
          <Tag
            variant="solid"
            color="warning"
            startDecorator={
              <StandardInfo
                sx={{
                  width: '20px',
                  height: '20px',
                }}
              />
            }
          >
            <Typography level="caption2">Low in stock</Typography>
          </Tag>
        </>
      );
    default:
      return (
        <>
          <Tag
            sx={{ ...withBrandColor('leafGreen', { variant: 'solid' }) }}
            variant="solid"
            startDecorator={
              <CheckCircle
                sx={{
                  width: '20px',
                  height: '20px',
                  '& svg': {
                    '& path': {
                      fill: 'currentColor !important',
                    },
                  },
                }}
              />
            }
          >
            <Typography level="caption2">In stock</Typography>
          </Tag>
        </>
      );
  }
};

interface ProductShippingProps {
  finalSlug: string;
}

export const ProductShipping = (props: ProductShippingProps) => {
  const { finalSlug } = props;
  // const isFetching = useAppSelector(selectedLeadtimeShippingFeeIsFetching);
  const leadTimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const dispatch = useAppDispatch();
  const isOpenZipcodeFailureModal = useAppSelector(selectedIsOpenZipcodeFailureModal);
  const handleCloseZipcodeFailureModal = () => {
    dispatch(updateIsOpenZipcodeFailureModal(false));
  };
  const errorInfo = useAppSelector(selectedErrorInfo);
  const { stockState, deliveryLeadTimeDisplay, warehouseName, showLongLeadTime } = useMemo(() => {
    return {
      stockState: leadTimeShippingFee?.stock_state || '',
      deliveryLeadTimeDisplay: leadTimeShippingFee?.delivery_lead_time_presentation || '',
      warehouseName: leadTimeShippingFee?.warehouse_name || '',
      showLongLeadTime: leadTimeShippingFee?.show_leadtime_explanation || false,
    };
  }, [leadTimeShippingFee]);

  useEffect(() => {
    dispatch(refreshWebLeadTimeCommand({}));
  }, [dispatch]);

  return (
    <>
      <Stack px={{ xs: 6, md: 0 }} data-section="product-shipping">
        {leadTimeShippingFee ? (
          <Stack>
            {stockState !== STOCK_STATE.OUT_OF_STOCK && (
              <>
                {deliveryLeadTimeDisplay && (
                  <>
                    <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
                      <Typography level="body2">
                        {'Reaches your home:'}&nbsp;{deliveryLeadTimeDisplay?.replace('Within', '')}
                      </Typography>
                    </Stack>
                    {showLongLeadTime && <ProductKeepUpdated />}
                  </>
                )}
              </>
            )}
          </Stack>
        ) : (
          <Loading theme="dark" />
        )}
        <Sheet variant="solid" sx={{ mt: 4, mb: { xs: 4, sm: 8, md: 4 }, py: { xs: 4, sm: 5, md: 6 }, px: 4 }}>
          <ProductUSP finalSlug={finalSlug} stockState={stockState} warehouseName={warehouseName} />
        </Sheet>
        <Stack gap={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography level="h5">How to get it</Typography>
            {leadTimeShippingFee ? <StockState /> : <Loading theme="dark" />}
          </Stack>
          <Sheet variant="solid" sx={{ py: 2, px: 4 }}>
            <ProductShippingInfo
              stockState={stockState}
              warehouseName={warehouseName}
              finalSlug={finalSlug}
              leadTimeShippingFee={leadTimeShippingFee}
            />
            {leadTimeShippingFee ? (
              <>{trackingFeatureService.enabledDisplayShowroom && <ProductStockShowroom />}</>
            ) : (
              <Loading theme="dark" />
            )}
          </Sheet>
        </Stack>
        <LazyLoad offset={300} once>
          <ProductMakeItASet />
        </LazyLoad>
      </Stack>
      <ZipcodeFailureModal
        open={isOpenZipcodeFailureModal}
        onClose={handleCloseZipcodeFailureModal}
        zipcode={errorInfo?.errorZipcode}
      />
    </>
  );
};
