'use client';

import { Box, Button, NiceModal, useBreakpoints } from '@castlery/fortress';
import { selectLeadtimeShippingFee, selectProductLoadingStatus } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
// import { webServerSideRefreshToken } from '@castlery/utils';
import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { WebLongLeadTimeSheet } from '../web-product-option/web-long-lead-time-sheet/web-long-lead-time-sheet';
import { EcEnv, OnlineAddCartSource } from '@castlery/config';
import { usePhAtcProperities } from './useAtcProperities';
import { addToCartCommandV2 } from '@castlery/modules-cart-services';

export { usePhAtcProperities } from './useAtcProperities';
export interface WebAddToCartProps {
  buttonSlot?: React.ReactElement<{
    onCustomClick?: (e?: any) => void;
    loading?: boolean;
    disabled?: boolean;
    sx?: any;
  }>;
  buttonText?: string;
  isCmsComponent?: boolean;
  isModalOpen?: boolean;
}

export function WebAddToCart(props: WebAddToCartProps) {
  const { buttonSlot, buttonText, isCmsComponent = false, isModalOpen = false } = props;
  const dispatch = useAppDispatch();
  const leadtimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const productLoadingStatus = useAppSelector(selectProductLoadingStatus);
  const [isLongLeadTimeModalOpen, setIsLongLeadTimeModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const longLeadTimeRef = useRef(null);
  const { mobile, desktop } = useBreakpoints();
  const phProps = usePhAtcProperities();
  const [
    {
      loading: atcLoading,
      //  error
    },
    addToOrder,
  ] = useAsyncFn(async () => {
    try {
      // return await dispatch(addToCartCommand()).unwrap();
      return await dispatch(addToCartCommandV2({ scene: 'pdp-web', source: OnlineAddCartSource.PLA })).unwrap();
    } catch (error: Error | any) {
      return null;
    }
  });

  const handleAddToCart = useCallback(
    async (e: any) => {
      e?.preventDefault();
      if (leadtimeShippingFee?.show_leadtime_explanation) {
        setIsLongLeadTimeModalOpen(true);
      } else {
        const res = await addToOrder();
        if (res) {
          if (isModalOpen) {
            setIsAddToCartModalOpen(true);
          } else {
            setTimeout(() => {
              window.location.href = `${
                EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
              }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`;
            }, 200);
          }
        }
      }

      // addToOrder();
    },
    [addToOrder, isModalOpen, leadtimeShippingFee?.show_leadtime_explanation]
  );

  const enhancedButtonSlot = useMemo(() => {
    return buttonSlot && isValidElement(buttonSlot)
      ? cloneElement(buttonSlot, {
          onCustomClick: handleAddToCart,
          loading: productLoadingStatus === 'loading' || atcLoading,
          disabled: leadtimeShippingFee?.stock_state === 'OUT_OF_STOCK',
          ...(!isCmsComponent && {
            onClick: handleAddToCart,
          }),
        })
      : null;
  }, [atcLoading, buttonSlot, handleAddToCart, isCmsComponent, leadtimeShippingFee?.stock_state, productLoadingStatus]);

  useEffect(() => {
    if (seconds > 0 && isAddToCartModalOpen) {
      const timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsAddToCartModalOpen(false);
      setSeconds(5);
    }
  }, [seconds, isAddToCartModalOpen]);

  const LongLeadTimeTitle = () => {
    return (
      <Box>
        The estimated delivery time for this product is&nbsp;
        <Box
          sx={{
            fontWeight: 'bold',
            display: 'inline',
          }}
        >
          {leadtimeShippingFee?.delivery_lead_time_presentation?.replace('Within ', '')}
        </Box>
        . Would you like to proceed with your purchase?
      </Box>
    );
  };

  return (
    <>
      {enhancedButtonSlot ? (
        enhancedButtonSlot
      ) : (
        <Button
          sx={{
            width: '100%',
            marginBottom: 2,
          }}
          {...phProps}
        >
          {buttonText}
        </Button>
      )}
      <NiceModal
        title={'This might take a while'}
        desc={<LongLeadTimeTitle />}
        dialogSx={{
          // border: 'none',
          zIndex: 10000,
        }}
        modalRef={longLeadTimeRef}
        showDefaultFooter={false}
        children={
          <WebLongLeadTimeSheet
            sx={{
              marginTop: '8px',
            }}
            confirmLoadingStatus={atcLoading}
            onConfirm={async () => {
              const res = await addToOrder();
              if (res) {
                setIsLongLeadTimeModalOpen(false);
                if (isModalOpen) {
                  setIsAddToCartModalOpen(true);
                } else {
                  setTimeout(() => {
                    window.location.href = `${
                      EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
                    }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`;
                  }, 200);
                }
              }
            }}
          />
        }
        open={isLongLeadTimeModalOpen}
        onClose={() => {
          setIsLongLeadTimeModalOpen(false);
        }}
      />
      <NiceModal
        title={'Success! Your product has been added to your cart.'}
        dialogSx={{
          '#modal-modal-footer': {
            marginTop: '-24px',
            flexDirection: desktop ? 'row' : 'column',
            gap: 2,
          },
          ...(mobile && {
            padding: '16px',
          }),
        }}
        open={isAddToCartModalOpen}
        onClose={() => {
          setIsAddToCartModalOpen(false);
        }}
        onConfirm={() => {
          window.location.href = `${
            EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
          }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`;
        }}
        confirmText={'Proceed to cart'}
        cancelText={`Continue shopping (0:0${seconds})`}
      />
    </>
  );
}

export default WebAddToCart;
