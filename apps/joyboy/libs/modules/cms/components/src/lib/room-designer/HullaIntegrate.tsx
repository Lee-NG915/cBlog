'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Loading, NiceModal, Stack, Typography } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { addWishlist, deleteWishlist, getWishList } from '@castlery/modules-user-domain';
import { selectOrder } from '@castlery/modules-order-domain';
import { addToWishlist, removeFromWishlist } from '@castlery/modules-cms-services';
import { addToCartCommandByParams } from '@castlery/modules-product-services';
import { getVariantByVariantId, Variant } from '@castlery/modules-product-domain';
import { EcEnv } from '@castlery/config';
import { hintegrateLoader } from '@castlery/utils';

type HullaIntegrateProps = {
  folder: string;
  id: string;
};

const HullaIntegrate = ({ folder, id }: HullaIntegrateProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const bucketUrl = 'https://castlery.hulla-cdn.com';
  const hullaDivRef = useRef<HTMLDivElement>(null);

  const order = useAppSelector(selectOrder);
  const [isAddToCartToastOpen, setIsAddToCartToastOpen] = useState(false);
  const [successVariant, setSuccessVariant] = useState<Variant | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Unable to add product to wishlist');
  const [failedItems, setFailedItems] = useState<{ id: string; name: string; quantity: number; error: string }[]>([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // 使用统一的脚本加载器，确保只加载一次
    hintegrateLoader
      .load()
      .then(() => {
        setIsLoaded(true);

        // 检查并初始化 HIntegrate
        if (window?.HIntegrate) {
          window.HIntegrate?.checkStartupHullabalook?.();
          window.HIntegrate?.initialiseExperience(folder, `#${id}`);
        }
      })
      .catch((err) => {
        console.error('Failed to load HIntegrate script', err);
        setIsLoaded(true);
      });

    return () => {
      if (!window.hintegrate) window.hintegrate = window.Hulla;
    };
  }, [folder, id]);

  const handleGetWishlist = useCallback(() => {
    let currentWishlist = [];
    dispatch(getWishList.initiate(undefined, { forceRefetch: true }))
      .then((result) => {
        if (result.status === 'fulfilled') {
          const wishlist = result.data;
          currentWishlist = wishlist.map((item) => ({
            product: {
              ident: (item?.id || 0).toString(),
            },
          }));
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        const message = {
          messageType: 'current_wishlist',
          items: currentWishlist,
        };
        hullaDivRef.current?.firstChild?.contentWindow?.postMessage(message, bucketUrl);
      });
  }, [dispatch]);

  const handleGetCart = useCallback(() => {
    let currentCart = [];
    if (order?.line_items) {
      currentCart = order.line_items.map((item) => ({
        product: {
          ident: item.variant?.id,
        },
        quantity: item.quantity,
      }));
    }
    const message = {
      messageType: 'current_cart',
      items: currentCart,
    };
    console.log('🚀 ~ HullaIntegrate ~ message:', message);

    hullaDivRef.current?.firstChild?.contentWindow?.postMessage(message, bucketUrl);
  }, [order]);

  const handleWishlistUpdate = useCallback(
    async (items, type) => {
      const failedItems: { name: string }[] = [];
      const updateFunc = (id) =>
        type === 'add' ? dispatch(addWishlist.initiate(id)) : dispatch(deleteWishlist.initiate(id));
      const updatePromises = items.map((item) =>
        updateFunc(item?.product?.ident)
          .then((variant) => {
            console.log('🚀 ~ HullaIntegrate ~ variant:', variant);
          })
          .catch((error) => {
            failedItems.push({
              name: item.product?.name,
              error: error?.errors?.[0]?.detail || error,
            });
          })
      );
      await Promise.all(updatePromises);
      if (failedItems.length > 0) {
        setModalOpen(true);
        setModalTitle('Unable to add product to wishlist');
        setFailedItems([]);
        // const errorMessages = failedItems.map((item) => `${item.name}`);
      }
      window.setTimeout(() => {
        handleGetWishlist();
      }, 500);
    },
    [dispatch, handleGetWishlist]
  );

  const handleAddToCart = async (items) => {
    const failedItems: { id: string; name: string; quantity: number; error: string }[] = [];
    const successItems: { variant: Variant }[] = [];
    setFailedItems([]);
    setIsAddToCartToastOpen(false);
    setModalOpen(false);

    for (const item of items) {
      const { quantity, product } = item || {};
      try {
        await dispatch(
          addToCartCommandByParams({
            variant_id: product?.ident,
            quantity: quantity,
            suppressDefaultErrorModal: true,
            suppressTracking: true,
          })
        ).unwrap();
        // 等待获取商品详情完成
        const variantResult = await dispatch(getVariantByVariantId.initiate(product?.ident));
        if (variantResult.status === 'fulfilled') {
          successItems.push({ variant: variantResult.data });
        }
      } catch (e: any) {
        failedItems.push({
          id: product?.ident,
          name: product?.name,
          quantity: quantity,
          error: e?.data?.errors?.[0]?.detail || 'Unable to add to cart',
        });
      }
    }

    // 在循环结束后设置所有失败的项
    if (failedItems.length > 0) {
      setFailedItems(failedItems);
      setModalOpen(true);
      setModalTitle('Unable to add to cart');
    }

    // 只有在没有失败项时才显示成功弹窗
    if (failedItems.length === 0 && successItems.length > 0) {
      setSuccessVariant(successItems[0].variant);
      setIsAddToCartToastOpen(true);
    }

    const message = {
      messageType: 'add_to_cart_response',
      items: items.map((item) => {
        item.status = failedItems.find((failItem) => failItem?.id === item?.product?.ident) ? 'failure' : 'success';
        return item;
      }),
    };
    hullaDivRef.current?.firstChild?.contentWindow?.postMessage(message, bucketUrl);
  };

  const handleMessage = useCallback(
    (event) => {
      const { messageType, items } = event?.data || {};
      if (event.origin !== bucketUrl || !messageType) return;

      switch (messageType) {
        case 'hulla_get_wishlist':
          handleGetWishlist();
          break;
        case 'hulla_get_cart':
          handleGetCart();
          break;
        case 'hulla_add_to_wishlist':
          handleWishlistUpdate(items, 'add');
          break;
        case 'hulla_remove_from_wishlist':
          handleWishlistUpdate(items, 'remove');
          break;
        case 'hulla_add_to_cart':
          handleAddToCart(items);
          break;
        default:
          break;
      }
    },
    [bucketUrl, handleGetCart, handleGetWishlist]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return (
    <>
      {!isLoaded && (
        <Stack
          sx={{
            width: '100%',
            height: 'calc(100vh - 150px)',
            justifyContent: 'center',
            alignItems: 'center',
            span: {
              transform: 'scale(2)',
            },
          }}
        >
          <Loading />
        </Stack>
      )}
      <Container
        ref={hullaDivRef}
        className="hulla"
        id={id}
        sx={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          minHeight: 'calc(100vh - 150px)',
        }}
      />
      <NiceModal
        open={isAddToCartToastOpen}
        onClose={() => setIsAddToCartToastOpen(false)}
        title="Item(s) have been added to your cart!"
        confirmText="VIEW CART"
        cancelText="CLOSE"
        success={true}
        onConfirm={() => {
          window.location.href = `${
            EcEnv.NEXT_PUBLIC_ONEPIECE_HOST
          }/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`;
        }}
        onCancel={() => setIsAddToCartToastOpen(false)}
      />
      <NiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        showCancelBtn={false}
        confirmText="GOT IT"
        warning={true}
        onConfirm={() => setModalOpen(false)}
      >
        <Stack alignItems="center" sx={(theme) => ({ mb: theme.spacing(6) })}>
          {failedItems.map((item) => (
            <Typography level="body2" key={item.id}>
              · {item.quantity} x {item.name}
            </Typography>
          ))}
        </Stack>
      </NiceModal>
    </>
  );
};

export { HullaIntegrate };
