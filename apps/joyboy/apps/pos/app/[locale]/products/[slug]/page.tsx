/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  selectLeadtimeShippingFee,
  selectProductLoadingStatus,
  useLazyGetProductByIdOrSlugQuery,
  selectVariant,
  selectProduct,
  Product,
  Variant,
  Taxon,
  ProductOptionTypeName,
} from '@castlery/modules-product-domain';
import {
  Card,
  Stack,
  Typography,
  Box,
  ListItem,
  useBreakpoints,
  AspectRatio,
  Divider,
  RadioGroup,
  Sheet,
  Radio,
  Backdrop,
} from '@castlery/fortress';
import {
  ATCButton,
  BundleProduct,
  ConfigurableProduct,
  DeliveryOption,
  ImageGallery,
  ProductBadge,
  ProductModelOptions,
  ProductOptionLabel,
  ProductPropertyMixedGroup,
  StockLocationSelector,
  VariantPrice,
  BundleVariantPrice,
  VariantQuantity,
  OptionsValue,
  WarrantyGuardsmanInfo,
  WarrantyInfo,
  ContentListItem,
  PosProductExtraInfo,
} from '@castlery/modules-product-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useSearchParams } from 'next/navigation';
import {
  currentDefaultCity,
  EcEnv,
  enableAuStudios,
  enableWarranty,
  enableSgStudios,
  enableShowroom,
  enableZipCode,
  globalDefaultCity,
} from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { sharedFeatureService } from '@castlery/shared-services';

const combineProperties = (pArr1: ContentListItem[], pArr2: ContentListItem[]) => {
  const finalArr = pArr1.slice();

  pArr2.forEach((p) => {
    const index = finalArr.findIndex((_p) => _p.name === p.name);
    if (index > -1) {
      finalArr.splice(index, 1, p);
    } else {
      finalArr.push(p);
    }
  });

  return finalArr;
};

export { combineProperties };

// TODO bundle 类型 http://localhost:6061/sg/products/R427281938/vincent-dining-table-with-2-chairs-walnut-and-doris-bench
export default function Page({
  params,
}: // searchParams,
{
  params: { slug: string; orderNumber: string };
  // searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;
  const searchParams = useSearchParams();
  const showGuardsmanWarranty = sharedFeatureService.isGuardsmanEnabled();
  const showMulberryWarranty = sharedFeatureService.isMulberryEnabled() && Boolean(enableWarranty);
  const selectCurrentProduct = useAppSelector(selectProduct);
  const [productData, setProductData] = useState<Product | undefined>();
  const [getProductByIdOrSlugQuery, { isLoading, currentData: productDataByApi, isError }] =
    useLazyGetProductByIdOrSlugQuery({});
  const { city, retailId } = makePersistenceHandles();
  useEffect(() => {
    if (selectCurrentProduct) {
      setProductData(selectCurrentProduct);
    } else {
      if (productDataByApi) {
        setProductData(productDataByApi);
      }
    }
  }, [selectCurrentProduct, productDataByApi]);
  const leadtimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const productLoadingStatus = useAppSelector(selectProductLoadingStatus);
  const variant = useAppSelector(selectVariant);
  const [cityInfo, setCityInfo] = useState<{
    city: string;
    state: string;
    zipcode: string;
  }>();

  const fetchProduct = async (info?: { fixedZipcode?: string; currentStockId?: string }) => {
    const cityInfo = await city.getItem();
    if (enableSgStudios || (enableAuStudios && info?.currentStockId)) {
      getProductByIdOrSlugQuery({
        idOrSlug: slug + `?${searchParams?.toString()}`,
        stockId: info?.currentStockId || '',
        zipCode: info?.fixedZipcode || JSON.parse(cityInfo || '{}')?.zipcode,
      });
    } else {
      if (cityInfo !== null) {
        getProductByIdOrSlugQuery({
          idOrSlug: slug + `?${searchParams?.toString()}`,
          zipCode: info?.fixedZipcode || JSON.parse(cityInfo || '{}').zipcode,
        });
      } else {
        let initCity = currentDefaultCity;
        const retailIdValue = await retailId.getItem();
        // 设置 Brisbane 的默认 zipcode
        if (retailIdValue === '69' && EcEnv.NEXT_PUBLIC_COUNTRY === 'AU') {
          initCity = {
            city: 'Brisbane',
            state: 'QLD',
            zipcode: '4000',
          };
        }
        if (retailIdValue === '3' && EcEnv.NEXT_PUBLIC_COUNTRY === 'US') {
          initCity = {
            city: 'New York',
            state: 'NY',
            zipcode: '10011',
          };
        }
        getProductByIdOrSlugQuery({
          idOrSlug: slug + `?${searchParams?.toString()}`,
          zipCode: info?.fixedZipcode || initCity.zipcode,
        });
      }
    }

    // if (cityInfo !== null) {
    //   getProductByIdOrSlugQuery({
    //     idOrSlug: slug + `?${searchParams?.toString()}`,
    //     zipCode: info?.fixedZipcode || JSON.parse(cityInfo).zipcode,
    //   });
    // }
  };

  useEffect(() => {
    if (slug !== selectCurrentProduct?.slug) {
      if (enableZipCode) {
        fetchProduct();
      } else {
        getProductByIdOrSlugQuery({
          idOrSlug: slug + `?${searchParams?.toString()}`,
        });
      }
    }
    // eslint-disable-next-line
  }, [slug, selectCurrentProduct, getProductByIdOrSlugQuery, searchParams]);

  const needShowCustomized = useMemo(() => {
    let showCustomized = false;
    if (variant) {
      showCustomized = variant.is_customized;
    } else if (productData?.variants[0]) {
      showCustomized = productData.variants[0].is_customized;
    }
    return showCustomized;
  }, [variant, productData]);

  const renderImageGallery = () => {
    if (variant?.images.length === 0 && productData?.variants[0].images.length === 0) {
      return (
        <ImageGallery
          images={[
            {
              position: 1,
              links: {
                feed: 'https://res.cloudinary.com/castlery/image/upload/w_720/v1477990685/static/default.png',
                large: 'https://res.cloudinary.com/castlery/image/upload/w_720/v1477990685/static/default.png',
                large_gray: 'https://res.cloudinary.com/castlery/image/upload/w_720/v1477990685/static/default.png',
              },
              type: 'image',
            },
          ]}
          product={productData?.product_type === 'configurable' ? variant : productData?.variants[0]}
          bundleOptions={[]}
          assets={[]}
        />
      );
    }
    if (productData?.product_type === 'configurable') {
      if (variant?.images) {
        return (
          <ImageGallery
            images={variant.images}
            product={variant}
            bundleOptions={productData?.bundle_options || []}
            assets={variant?.assets || []}
          />
        );
      }
      if (productData?.variants[0].images) {
        return (
          <ImageGallery
            images={productData.variants[0].images}
            product={productData.variants[0]}
            bundleOptions={productData?.bundle_options || []}
            assets={productData.variants[0]?.assets || []}
          />
        );
      }
    }
    // 后续修改增加 Image 类型，考虑迁移到 redux 中
    if (productData?.product_type === 'bundle') {
      if (productData?.variants[0].images) {
        return (
          <ImageGallery
            images={productData.variants[0].images}
            product={productData.variants[0]}
            bundleOptions={productData?.bundle_options || []}
            assets={productData.variants[0]?.assets || []}
          />
        );
      }
      if (variant?.images) {
        return (
          <ImageGallery
            images={variant.images}
            product={variant}
            bundleOptions={productData?.bundle_options || []}
            assets={variant?.assets || []}
          />
        );
      }
    }
    return null;
  };

  if (isError) {
    return <Typography>Failed to load product</Typography>;
  }
  // if (productData?.slug !== slug){ // 为了 fix variant 的更新晚于 url 上 slug 的问题
  //   return null;
  // }
  return (
    <>
      {isLoading && (
        <Backdrop
          open={true}
          sx={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            position: 'absolute',
            zIndex: 10000,
            span: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            },
          }}
        />
      )}
      <Stack gap={2} sx={{ pt: 4 }}>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} sx={{ px: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <Typography level="h3">
              {productData?.name}
              <ProductBadge badgeList={variant?.badges || productData?.variants[0]?.badges || []} hasUsedInPDP />
            </Typography>
          </Box>
          {productData?.product_type === 'bundle' && productData.bundle_options ? (
            <BundleVariantPrice
              key={productData?.variants[0].sku}
              variant={productData?.variants[0]}
              bundleOption={productData.bundle_options}
            />
          ) : (
            <VariantPrice
              textLevel="h5"
              key={productData?.variants[0].sku}
              variant={variant || productData?.variants[0]}
              minSaleQty={productData?.min_sale_qty || 1}
            />
          )}
        </Stack>
        {productData?.option_types || productData?.bundle_options ? (
          <>
            <Card sx={{ py: 2 }}>
              <Stack key={productData?.slug}>
                <ProductModelOptions productData={productData} />
                <Stack
                  sx={{
                    display:
                      productData.variants[0].variant_option_values.length === 0 &&
                      productData.product_type !== 'bundle'
                        ? 'none'
                        : 'auto',
                  }}
                >
                  {productData.product_type === 'bundle' && productData.bundle_options ? (
                    <BundleProduct productData={productData} />
                  ) : (
                    <ConfigurableProduct productData={productData} />
                  )}
                </Stack>
                <ListItem
                  sx={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    minHeight: 40,
                    py: 4,
                  }}
                >
                  <ProductOptionLabel text="Quantity" />
                  <VariantQuantity
                    disabled={leadtimeShippingFee?.stock_state === 'OUT_OF_STOCK'}
                    currentVariantId={variant?.id}
                  />
                </ListItem>
                <DeliveryOption
                  productData={variant || productData.variants[0]}
                  needShowCustomized={needShowCustomized}
                  onRefreshProductInfo={(cityInfo) => {
                    setCityInfo(cityInfo);
                    fetchProduct();
                  }}
                />
                {showMulberryWarranty && <WarrantyInfo variant={variant || productData.variants[0]} />}
                {showGuardsmanWarranty && <WarrantyGuardsmanInfo />}
                <Stack direction={{ xs: 'column', md: 'row' }}>
                  <StockLocationSelector
                    productData={productData}
                    onReFetchProductData={({ inShowroom, currentStockLocation }) => {
                      if (inShowroom && enableShowroom) {
                        fetchProduct({
                          // fixedZipcode: '2033',
                          fixedZipcode: currentStockLocation?.zipcode,
                          currentStockId: currentStockLocation?.id,
                        });
                      } else {
                        fetchProduct({
                          currentStockId: currentStockLocation?.id,
                        });
                      }
                    }}
                  />
                  <ATCButton
                    loading={productLoadingStatus === 'loading'}
                    disabled={leadtimeShippingFee?.stock_state === 'OUT_OF_STOCK'}
                  />
                </Stack>
                <PosProductExtraInfo
                  variant={variant || productData.variants[0]}
                  leadtimeShippingFee={leadtimeShippingFee}
                />
              </Stack>
            </Card>
            <Card>{renderImageGallery()}</Card>
            <ProductPropertyMixedGroup
              comfort_ratings={combineProperties(
                productData?.product_properties?.comfort_ratings || [],
                variant?.variant_properties?.comfort_ratings || []
              )}
              delivery_returns={combineProperties(
                productData?.product_properties?.delivery_returns || [],
                variant?.variant_properties?.delivery_returns || []
              )}
              product_details={combineProperties(
                productData?.product_properties?.product_details || [],
                variant?.variant_properties?.product_details || []
              )}
              product_dimensions={combineProperties(
                productData?.product_properties?.product_dimensions || [],
                variant?.variant_properties?.product_dimensions || []
              )}
              dimension_image={variant?.dimension_image || productData?.dimension_image}
            />
          </>
        ) : (
          ''
        )}
      </Stack>
    </>
  );
}
