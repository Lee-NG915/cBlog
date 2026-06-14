'use client';

// import dynamic from 'next/dynamic';
import { Stack, Typography, useBreakpoints, Box } from '@castlery/fortress';
import { selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { WebProductOptionModel } from './web-product-option-model/web-product-option-model';
import { WebConfigurableProduct } from './web-configurable-product/web-configurable-product';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { PinchZoom } from '@castlery/shared-components';
import { ProductDimension, ProductDimensionActivated, ZoomIn } from '@castlery/fortress/Icons';
import { useCallback, useMemo, useState } from 'react';
import { usePrice } from '../../hooks/use-price';
import { WebProductOptionModuleName } from './config';
import { DtStack } from '@castlery/modules-tracking-components';
import { WebAddToCart, usePhAtcProperities } from '../web-add-to-cart/web-add-to-cart';
export interface ProductOptionProps {
  titleSlot?: React.ReactNode;
  ctaSlot?: React.ReactNode;
  buttonSlot?: React.ReactElement<{
    onCustomClick?: (e?: any) => void;
    loading?: boolean;
    disabled?: boolean;
    sx?: any;
  }>;
  descriptionSlot?: React.ReactNode;
  title?: string;
  cta_text?: string;
  button_text?: string;
  description?: string;
  anchorId?: string;
  pageType: string;
}

export function WebProductOption(props: ProductOptionProps) {
  const {
    titleSlot,
    ctaSlot,
    buttonSlot,
    descriptionSlot,
    title,
    cta_text,
    button_text,
    description,
    anchorId,
    pageType,
  } = props;
  const { desktop, mobile } = useBreakpoints();
  const product = useAppSelector(selectProduct);
  const variant = useAppSelector(selectVariant);
  const { variantPrice, variantListPrice } = usePrice({ product: product!, variant: variant!, isBundle: false });
  const [isOpenDimension, setIsOpenDimension] = useState(false);
  const [isOpenPinchZoom, setIsOpenPinchZoom] = useState(false);
  const phProps = usePhAtcProperities();

  const displayImage = useMemo(() => {
    return isOpenDimension
      ? (variant?.dimension_image?.links?.large_gray as string)
      : variant?.images[0]?.links?.large_gray || (product?.variants[0]?.images[0]?.links?.large_gray as string);
  }, [isOpenDimension, product?.variants, variant?.dimension_image?.links?.large_gray, variant?.images]);
  const handleDimensionClick = useCallback(() => {
    setIsOpenDimension((state) => !state);
  }, []);

  return (
    <>
      <DtStack
        useImpression
        uid={product?.slug || 'product_option'}
        componentName={WebProductOptionModuleName}
        direction="column"
        spacing={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F3F3F3',
          padding: desktop ? '0 32px' : '0',
        }}
      >
        <Stack
          sx={{
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            padding: !desktop ? '0 24px' : 0,
          }}
        >
          {titleSlot ? (
            titleSlot
          ) : (
            <Typography
              level="h2"
              gutterBottom
              sx={{
                color: '#A45B37',
              }}
            >
              {title}
            </Typography>
          )}
          {descriptionSlot ? (
            descriptionSlot
          ) : (
            <Typography level="h3" gutterBottom>
              {description}
            </Typography>
          )}
        </Stack>
        <Stack
          flexDirection={desktop ? 'row' : 'column'}
          justifyContent={'center'}
          alignItems={'stretch'}
          gap={desktop ? '48px' : '24px'}
          style={{
            width: '100%',
          }}
        >
          {/* image model */}
          <Stack
            style={{
              flex: desktop ? 2 : undefined,
              ...(desktop && {
                maxWidth: '70%',
              }),
            }}
          >
            <Stack
              sx={{
                width: '100%',
                marginBottom: desktop ? '6px' : '16px',
                padding: !desktop ? (mobile ? '12px 24px' : '48px 24px') : '0',
              }}
              flexDirection={mobile ? 'column' : 'row'}
              justifyContent={'center'}
              gap={!mobile && variant?.dimension_image ? '32px' : undefined}
              alignItems={!mobile ? 'center' : 'auto'}
            >
              <WebProductOptionModel
                sx={{
                  flex: 1,
                  ...(!mobile &&
                    !desktop &&
                    !!variant?.dimension_image && {
                      maxWidth: '87%',
                    }),
                  ...(desktop &&
                    !!variant?.dimension_image && {
                      maxWidth: '90%',
                    }),
                  ...(!variant?.dimension_image && {
                    maxWidth: '100%',
                  }),
                }}
                productData={product}
                variant={variant || {}}
                anchorId={anchorId}
              />
              {!!variant?.dimension_image && (
                <Stack
                  flexDirection={'row'}
                  justifyContent={mobile ? 'flex-end' : 'center'}
                  alignContent={'center'}
                  sx={{
                    svg: {
                      width: mobile ? '40px' : '64px',
                      height: mobile ? '40px' : '64px',
                      cursor: 'pointer',
                    },
                    ...(mobile && {
                      marginTop: '16px',
                    }),
                  }}
                  onClick={handleDimensionClick}
                >
                  {isOpenDimension ? (
                    <ProductDimensionActivated viewBox={mobile ? '0 0 40 40' : '0 0 64 64'} />
                  ) : (
                    <ProductDimension viewBox={mobile ? '0 0 40 40' : '0 0 64 64'} />
                  )}
                </Stack>
              )}
            </Stack>
            <Box
              sx={{
                width: '100%',
                position: 'relative',
              }}
            >
              <FortressImage
                src={displayImage}
                alt="product image"
                sx={{
                  width: '100%',
                }}
                ratio={1.5}
                onClick={() => {
                  if (isOpenDimension && !desktop) {
                    setIsOpenPinchZoom(true);
                  }
                }}
              />
              {isOpenDimension && !desktop ? (
                <ZoomIn
                  sx={{
                    width: '40px',
                    height: '40px',
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    '&:hover': {
                      cursor: 'pointer',
                    },
                    zIndex: 1,
                  }}
                  viewBox="0 0 40 40"
                  // onClick={() => {
                  //   setIsOpenPinchZoom(true);
                  // }}
                />
              ) : null}
            </Box>
          </Stack>
          <Stack
            style={{
              flex: desktop ? 1 : undefined,
              padding: !desktop ? (mobile ? '0 24px' : '0 24px') : '0 0 0 2px',
              height: '100%',
              justifyContent: 'space-between',
              maxHeight: desktop ? '700px' : '578px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#F3F3F3',
                zIndex: 99,
                marginLeft: '-2px',
                width: '100%',
              }}
            >
              <Typography level={'h2'}>{product?.name}</Typography>
              <Stack flexDirection={'row'} gap={2} alignItems={'center'}>
                <Typography level={mobile ? 'h2' : 'h3'} color="primary" sx={{ mt: 1, mb: 1 }}>
                  {variantPrice}
                </Typography>
                {variantPrice !== variantListPrice && (
                  <Typography
                    level="body1"
                    sx={{
                      textDecoration: 'line-through',
                      color: (theme) => theme.palette.brand.charcoal[500],
                      fontFamily: `var(--fortress-fontFamily-display)`,
                      fontSize: '20px',
                    }}
                  >
                    {variantListPrice}
                  </Typography>
                )}
              </Stack>
              {product?.min_sale_qty && Number(product?.min_sale_qty) > 1 && (
                <Typography
                  level="caption1"
                  sx={{
                    color: 'var(--fortress-palette-brand-charcoal-500)',
                    marginBottom: 2,
                    fontSize: desktop ? '14px' : '12px',
                  }}
                >
                  {'The above price is the price of 2 chairs. Sold only in multiples of 2'}
                </Typography>
              )}
            </Box>
            <WebConfigurableProduct productData={product} pageType={pageType} />
            <Stack
              sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#F3F3F3',
                zIndex: 99,
                marginLeft: '-2px',
                width: '100%',
                paddingBottom: !desktop ? '12px' : 0,
                button: {
                  border: 'none',
                },
              }}
            >
              <WebAddToCart buttonSlot={buttonSlot} buttonText={button_text} isCmsComponent={true} {...phProps} />
              {ctaSlot ? (
                ctaSlot
              ) : (
                <CustomLink href="" isExternalFlag={true}>
                  {cta_text}
                </CustomLink>
              )}
            </Stack>
          </Stack>
        </Stack>
      </DtStack>
      <PinchZoom
        open={isOpenPinchZoom}
        setOpen={setIsOpenPinchZoom}
        slideImages={[
          {
            src: displayImage,
            alt: 'product dimension image',
            // 必传 width height，需要计算宽高比，具体数字不重要
            width: 200,
            height: 100,
          },
        ]}
        index={0}
      />
    </>
  );
}

export default WebProductOption;
