'use client';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { NiceModal, Stack, Toast, Typography, useBreakpoints } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { CustomLink } from '../custom-link/custom-link';
import { NextFortressLink } from '../next-fortress-link/next-fortress-link';
import { ScrollWrapper } from '../scroll-wrapper/scroll-wrapper';
import { useEffect, useRef, useState } from 'react';
import { STCProductItemDataProps } from './stc-product-item';

import { EcEnv } from '@castlery/config';
import { removeFromWishlist } from '@castlery/modules-cms-services';
import {
  removeWishListItem,
  selectedTempRemoveWishListItemInfo,
  updateTempRemoveWishListItemInfo,
} from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { STCProductItem } from './stc-product-item';
import { toPrice, Variant } from '@castlery/modules-product-domain';
import { ProductCartToast } from '../product-cart-toast/product-cart-toast';

interface STCProductListProps {
  products: STCProductItemDataProps[];
  bgColor?: string;
  needSliderDisplay?: boolean;
  applyATCAndWishlist?: boolean;
  forceGridDisplay?: boolean;
  onClickSuccess?: ({ slotId }: { slotId: string }) => void;
  onTempRemoveWishlist?: ({ id, name }: { id: number; name: string }) => void;
  onTempRemoveRollback?: () => void;
  displayDescription?: boolean;
}

const STCProductList = ({
  products,
  bgColor,
  needSliderDisplay = true,
  applyATCAndWishlist = false,
  forceGridDisplay = false,
  onClickSuccess,
  onTempRemoveWishlist,
  onTempRemoveRollback,
  displayDescription = false,
}: STCProductListProps) => {
  const { desktop } = useBreakpoints();
  const [listWidth, setListWidth] = useState(1728);
  const stackRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastStatus, setToastStatus] = useState<'add' | 'temp_remove' | 'remove'>('add');
  const [modalInfo, setModalInfo] = useState<{
    title: string;
    type: 'success' | 'error';
    confirmText?: string;
    cancelText: string;
    desc?: string;
  }>({
    title: 'Item has been added into your cart!',
    type: 'success',
    confirmText: 'View Cart',
    cancelText: 'Close',
  });
  const tempRemoveWishListItemInfo = useAppSelector(selectedTempRemoveWishListItemInfo);
  const lastTempRemoveWishListItemInfoRef = useRef({
    name: '',
    id: 0,
  });

  const dispatch = useAppDispatch();

  const [productInfo, setProductInfo] = useState<{ variant: Variant; price: string; listPrice: string } | null>(null);
  const [isAddToCartToastOpen, setIsAddToCartToastOpen] = useState(false);

  const [isTempRemoveToastOpen, setIsTempRemoveToastOpen] = useState(false);
  const [countDown, setCountDown] = useState(5);
  const countDownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTempRemoveWishListItemInfoClearTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleModalOpen = (
    value: boolean,
    type: 'success' | 'error',
    detail?: string,
    productInfo?: { variant: Variant; price: string; listPrice: string }
  ) => {
    if (type === 'success') {
      // setModalOpen(value);
      setProductInfo(productInfo ?? null);
      window.setTimeout(() => {
        setIsAddToCartToastOpen(true);
      }, 500);
      // setModalInfo({
      //   title: 'Item has been added into your cart!',
      //   type: 'success',
      //   confirmText: 'View Cart',
      //   cancelText: 'Close',
      // });
    } else {
      setModalOpen(value);
      setModalInfo({
        title: 'Unable to add item to cart',
        desc:
          detail ||
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'error',
        confirmText: 'Close',
        cancelText: 'Close',
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

  const handleToastOpen = (status: 'add' | 'remove' | 'temp_remove', info?: { id: number; name: string }) => {
    if (status === 'add') {
      setToastStatus('add');
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
      }, 3000);
    } else if (status === 'remove') {
      setToastStatus('remove');
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
      }, 3000);
    } else {
      onTempRemoveWishlist?.({ id: info?.id || 0, name: info?.name || '' });
      setToastStatus('temp_remove');
      setIsTempRemoveToastOpen(true);
      if (lastTempRemoveWishListItemInfoRef.current.id !== 0) {
        removeFromWishlist({ id: lastTempRemoveWishListItemInfoRef.current.id });
        dispatch(removeWishListItem(lastTempRemoveWishListItemInfoRef.current.id));
      }
      lastTempRemoveWishListItemInfoRef.current = {
        name: info.name || '',
        id: info.id || 0,
      };
      if (countDownTimerRef.current) {
        clearInterval(countDownTimerRef.current);
        countDownTimerRef.current = null;
      }
      setCountDown(5);
      countDownTimerRef.current = setInterval(() => {
        setCountDown((prev) => {
          if (prev <= 1) {
            if (countDownTimerRef.current) {
              removeFromWishlist({ id: info.id });
              dispatch(removeWishListItem(info.id));
              setIsTempRemoveToastOpen(false);
              // lastTempRemoveWishListItemInfoRef.current = {
              //   name: '',
              //   id: 0,
              // };
              clearInterval(countDownTimerRef.current);
              countDownTimerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      lastTempRemoveWishListItemInfoClearTimerRef.current = setInterval(() => {
        lastTempRemoveWishListItemInfoRef.current = {
          name: '',
          id: 0,
        };
        clearInterval(lastTempRemoveWishListItemInfoClearTimerRef.current);
        lastTempRemoveWishListItemInfoClearTimerRef.current = null;
      }, 6000);
    }
  };

  const renderTempRemoveToast = () => {
    if (!desktop) {
      return (
        <Toast
          open={isTempRemoveToastOpen}
          theme="dark"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          sx={{
            width: '342px',
          }}
          actionSlot={
            <Typography
              sx={{
                marginLeft: '4px',
                color: '#F6F3E7',
                fontSize: '16px',
                textDecoration: 'underline',
                cursor: 'pointer',
                textDecorationColor: '#F6F3E7',
              }}
              onClick={() => {
                if (countDownTimerRef.current) {
                  clearInterval(countDownTimerRef.current);
                  countDownTimerRef.current = null;
                  setIsTempRemoveToastOpen(false);
                  setTimeout(() => {
                    lastTempRemoveWishListItemInfoRef.current = {
                      name: '',
                      id: 0,
                    };
                  }, 1000);
                  dispatch(updateTempRemoveWishListItemInfo({ name: '', id: 0 }));
                  onTempRemoveRollback?.();
                }
              }}
            >
              {`Undo (0:0${countDown})`}
            </Typography>
          }
        >
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              fontSize: '16px',
            })}
          >
            {`${lastTempRemoveWishListItemInfoRef.current.name} has been removed from your wishlist.`}
          </Typography>
        </Toast>
      );
    } else {
      return (
        <Toast
          open={isTempRemoveToastOpen}
          theme="dark"
          sx={(theme) => ({
            position: 'fixed',
            bottom: theme.spacing(15),
            width: 'fit-content',
            padding: '16px',
          })}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={(theme) => ({
              width: 'fit-content',
              a: {},
            })}
          >
            <Typography>
              {lastTempRemoveWishListItemInfoRef.current.name} has been removed from your wishlist.
            </Typography>
            <Typography
              sx={(theme) => ({
                color: theme.palette.brand.warmLinen[500],
                marginLeft: '8px',
                marginRight: '8px',
                fontSize: '16px',
                textDecorationColor: theme.palette.brand.warmLinen[500],
                textDecoration: 'underline',
                cursor: 'pointer',
              })}
              onClick={(e) => {
                if (countDownTimerRef.current) {
                  clearInterval(countDownTimerRef.current);
                  countDownTimerRef.current = null;
                }
                setIsTempRemoveToastOpen(false);
                setTimeout(() => {
                  lastTempRemoveWishListItemInfoRef.current = {
                    name: '',
                    id: 0,
                  };
                }, 1000);
                dispatch(updateTempRemoveWishListItemInfo({ name: '', id: 0 }));
                onTempRemoveRollback?.();
              }}
            >
              {`Undo (0:0${countDown})`}
            </Typography>
          </Stack>
        </Toast>
      );
    }
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
          endDecorator={<Close onClick={() => setToastOpen(false)} />}
          actionSlot={
            toastStatus === 'remove' ? null : (
              <Stack
                sx={{
                  a: {
                    textDecorationColor: '#F6F3E7 !important',
                  },
                }}
              >
                <NextFortressLink
                  href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/wishlist`}
                >
                  <Typography
                    sx={{
                      color: '#F6F3E7',
                      fontSize: '16px',
                    }}
                  >
                    View Wishlist
                  </Typography>
                </NextFortressLink>
              </Stack>
            )
          }
        >
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              fontSize: '16px',
            })}
          >
            {toastStatus === 'remove' ? 'Removed from wishlist!' : 'Added to wishlist!'}
          </Typography>
        </Toast>
      );
    }
    return (
      <Toast
        open={toastOpen}
        theme="dark"
        sx={{
          position: 'fixed',
          left: '87%',
          bottom: '83%',
          width: toastStatus === 'add' ? '368px' : '312px',
          padding: '16px',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        startDecorator={<CheckCircleFilled />}
        endDecorator={<Close onClick={() => setToastOpen(false)} sx={{ cursor: 'pointer' }} />}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={(theme) => ({
            width: 'fit-content',
            a: {
              textDecorationColor: theme.palette.brand.warmLinen[500],
            },
          })}
        >
          <Typography
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              marginRight: '8px',
              fontSize: '16px',
            })}
          >
            {toastStatus === 'add' ? 'Added to wishlist!' : 'Removed from wishlist!'}
          </Typography>
          {toastStatus === 'add' && (
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
          )}
        </Stack>
      </Toast>
    );
  };

  const renderProductCartToast = () => {
    return (
      <ProductCartToast
        open={isAddToCartToastOpen}
        onClose={() => setIsAddToCartToastOpen(false)}
        variant={productInfo?.variant}
        price={toPrice(productInfo?.price, true) as string}
        listPrice={toPrice(productInfo?.listPrice, true) as string}
        numberPrice={Number(productInfo?.price)}
        numberListPrice={Number(productInfo?.listPrice)}
      />
    );
  };

  if (forceGridDisplay || (!needSliderDisplay && desktop)) {
    return (
      <Stack
        direction="row"
        sx={{
          width: '100%',
          padding: '0 32px',
          flexWrap: 'wrap',
          alignItems: 'stretch',
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
                  maxWidth: '50%',
                }),
                alignItems: 'stretch',
                display: 'flex',
              }}
            >
              <STCProductItem
                key={index}
                length={(listWidth - (desktop ? 100 : 12)) / (desktop ? 4 : 2)}
                product={product}
                bgColor={bgColor}
                needMargin={index % (desktop ? 4 : 2) !== (desktop ? 3 : 1) ? true : false}
                onModalOpen={handleModalOpen}
                onToastOpen={handleToastOpen}
                applyATCAndWishlist={applyATCAndWishlist}
                onClickSuccess={onClickSuccess}
                displayDescription={displayDescription}
              />
            </Stack>
          );
        })}
        {renderModal()}
        {renderToast()}
        {renderTempRemoveToast()}
      </Stack>
    );
  }
  return (
    <Stack
      sx={{
        width: '100%',
      }}
    >
      {products.length === 1 && (
        <STCProductItem
          product={products[0]}
          bgColor={bgColor}
          onModalOpen={handleModalOpen}
          onToastOpen={handleToastOpen}
          applyATCAndWishlist={applyATCAndWishlist}
          onClickSuccess={onClickSuccess}
          displayDescription={displayDescription}
        />
      )}
      {products.length > 1 && (
        <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true}>
          <Stack
            direction="row"
            sx={{
              width: 'fit-content',
              minWidth: '100%',
              gap: desktop ? 7 : 3,
            }}
          >
            {products.map((product, index) => {
              return (
                <STCProductItem
                  key={index}
                  product={product}
                  bgColor={bgColor}
                  onModalOpen={handleModalOpen}
                  onToastOpen={handleToastOpen}
                  applyATCAndWishlist={applyATCAndWishlist}
                  onClickSuccess={onClickSuccess}
                  displayDescription={displayDescription}
                />
              );
            })}
          </Stack>
        </ScrollWrapper>
      )}
      {renderModal()}
      {renderToast()}
      {renderProductCartToast()}
      {renderTempRemoveToast()}
    </Stack>
  );
};

export { STCProductList };
