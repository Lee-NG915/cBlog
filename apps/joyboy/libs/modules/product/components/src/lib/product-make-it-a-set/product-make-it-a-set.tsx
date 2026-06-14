'use client';

import { Link, NiceModal, Stack, Typography } from '@castlery/fortress';
import { useGetDyCampaignsQuery, DYPageTypes } from '@castlery/modules-dy-domain';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DYProduct, ScrollWrapper } from '@castlery/shared-components';
import { ProductItemMakeItASet } from './product-item-make-it-a-set';
import { EcEnv } from '@castlery/config';
import { selectVariant, Variant, toPrice } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ProductCartToast } from '@castlery/shared-components';
import { RightArrow } from '@castlery/fortress/Icons';
import { useBreakpoints } from '@castlery/fortress/hooks';

const ProductMakeItASet = () => {
  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';
  const variant = useAppSelector(selectVariant);
  const [products, setProducts] = useState<DYProduct[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState<{
    title: string;
    type: 'success' | 'error';
    desc?: string;
    confirmText?: string;
    cancelText?: string;
  }>({
    title: 'Item has been added into your cart!',
    type: 'success',
    desc: '',
    confirmText: 'View Cart',
    cancelText: 'Close',
  });
  const [productInfo, setProductInfo] = useState<{ variant: Variant; price: string; listPrice: string } | null>(null);
  const [isAddToCartToastOpen, setIsAddToCartToastOpen] = useState(false);

  const queryParams = useMemo(() => {
    return {
      campaignNames: ['Add On Recommendation'],
      recommendationContext: {
        type: DYPageTypes.PRODUCT,
        data: variant?.sku ? [variant.sku] : [],
      },
      query: { dyApiPreview },
    };
  }, [variant?.sku, dyApiPreview]);

  const campaign = useGetDyCampaignsQuery(queryParams, {
    skip: !variant?.sku,
    refetchOnMountOrArgChange: true,
  });
  const handleModalOpen = (
    open: boolean,
    type: 'success' | 'error',
    message?: string,
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
      setModalOpen(open);
      setModalInfo({
        title: 'Unable to add item to cart',
        desc: message || 'Something went wrong, please try again later.',
        type: 'error',
        confirmText: 'Close',
      });
    }
  };
  useEffect(() => {
    // 当 variant 变化时，清空 products
    setProducts([]);
  }, [variant?.id]);

  useEffect(() => {
    if (campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots) {
      if (campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots.length > 0) {
        const dyProducts = campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots;
        const groupIds: string[] = [];
        const tempProducts: DYProduct[] = [];
        dyProducts.forEach((product: DYProduct) => {
          const { productData } = product;
          if (!groupIds.includes(productData.group_id)) {
            groupIds.push(productData.group_id);
            tempProducts.push(product);
          }
        });
        setProducts(tempProducts);
      }
    }
  }, [campaign]);
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

  const { desktop } = useBreakpoints();

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
  if (products.length === 0) return null;
  return (
    <>
      <Stack
        sx={(theme) => ({
          borderTop: `1px solid ${theme.palette.brand.mono[300]}`,
          paddingTop: theme.spacing(8),
          marginTop: theme.spacing(8),
          gap: theme.spacing(3),
        })}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="h5">
            {campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom?.title ||
              'Complete your look with these picks'}
          </Typography>
          {campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom?.linkText &&
            campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom?.link && (
              <Link
                href={campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom?.link}
                sx={(theme) => ({
                  textDecoration: 'underline',
                  textDecorationColor: theme.palette.brand.burntOrange[500],
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  color: theme.palette.brand.burntOrange[500],
                })}
                endDecorator={
                  <RightArrow
                    sx={(theme) => ({
                      width: '14px',
                      height: '14px',
                      ...(!desktop && {
                        width: '12px',
                        height: '12px',
                      }),
                    })}
                    fill="#D25C1B"
                  />
                }
              >
                <Typography
                  sx={(theme) => ({
                    color: theme.palette.brand.burntOrange[500],
                    fontSize: '14px !important',
                    mr: '4px',
                    ...(!desktop && {
                      fontSize: '12px !important',
                    }),
                  })}
                >
                  {campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom?.linkText}
                </Typography>
              </Link>
            )}
        </Stack>
        <ScrollWrapper hideTrack={false} hideDesktopAction={true} hideBottomAction={true}>
          <Stack
            sx={(theme) => ({
              gap: theme.spacing(3),
              flexDirection: 'row',
            })}
          >
            {products.map((product) => {
              const { productData, slotId } = product;
              return <ProductItemMakeItASet key={slotId} product={product} onModalOpen={handleModalOpen} />;
            })}
          </Stack>
        </ScrollWrapper>
      </Stack>
      {renderModal()}
      {renderProductCartToast()}
    </>
  );
};

export { ProductMakeItASet };
