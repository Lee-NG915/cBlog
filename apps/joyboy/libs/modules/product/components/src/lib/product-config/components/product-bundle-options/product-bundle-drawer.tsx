'use client';
import {
  Button,
  Drawer,
  Stack,
  IconButton,
  Box,
  Typography,
  useBreakpoints,
  DialogTitle,
  ModalClose,
} from '@castlery/fortress';
import { ArrowLeft, ArrowRight } from '@castlery/fortress/Icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  BundleOption,
  BundleVariants,
  Combination,
  selectBundleVariants,
  toPrice,
  Variant,
} from '@castlery/modules-product-domain';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductOptionsLabel } from '../product-configurable-options/product-options-label';
import { ProductBundleValues } from './product-bundle-values';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { DynamicDialogContent } from '@castlery/shared-fortress-client';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { usePathname, useSearchParams } from 'next/navigation';
import { createUrl, useScrollLock } from '@castlery/utils';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { changeBundleVariantsCommand, getVariantLink } from '@castlery/modules-product-services';

interface ProductBundleDrawerProps {
  open: boolean;
  onClose: () => void;
  bundleOption?: BundleOption;
  bundleOptions?: BundleOption[];
  currentBundleVariant?: Variant;
}

export const ProductBundleDrawer = (props: ProductBundleDrawerProps) => {
  const { open, onClose, bundleOption, bundleOptions, currentBundleVariant } = props;
  const [drawerBundleVariant, setDrawerBundleVariant] = useState<Variant | undefined>(currentBundleVariant);
  const bundleVariant = useAppSelector(selectBundleVariants);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const swiperRef = useRef<SwiperType>();
  const [hasOpened, setHasOpened] = useState(false);
  const { desktop, mobile } = useBreakpoints();
  const { variants, optionTypes } = useMemo(() => {
    return {
      variants: bundleOption?.variants,
      optionTypes: bundleOption?.option_types,
    };
  }, [bundleOption]);

  const combinations: Combination[] | undefined = variants?.map((variant) => ({
    id: variant.id,
    availableForSale: !variant.discontinued,
    is_customized: false,
    ...variant.variant_option_values.reduce((accumulator, option) => {
      const item = optionTypes?.find(({ id }) => id === option.option_type_id);
      const val = item?.values?.find(({ id }) => id === option.option_value_id);
      if (!item || !val) return { ...accumulator };
      return { ...accumulator, [item.name]: val.name };
    }, {}),
  }));

  const handleConfirm = useCallback(() => {
    if (!bundleVariant) return;

    const newBundleVariants: BundleVariants = {
      ...bundleVariant,
      bundle_options:
        bundleVariant?.bundle_options?.map((option) => {
          if (option.bundle_option_id === bundleOption?.id + '' && drawerBundleVariant?.id) {
            return { ...option, bundle_option_variant_id: drawerBundleVariant?.id };
          }
          return option;
        }) || [],
    };
    dispatch(changeBundleVariantsCommand({ bundleVariants: newBundleVariants }));
    const bundleVariantSearchParams = new URLSearchParams(searchParams.toString());
    if (bundleOption) {
      bundleOptions?.forEach((option) => {
        if (option.id === bundleOption?.id) {
          bundleVariantSearchParams.set(option.name, String(drawerBundleVariant?.id));
        } else {
          const otherBundleOption = newBundleVariants?.bundle_options?.find(
            ({ bundle_option_id }) => bundle_option_id === option.id + ''
          );
          bundleVariantSearchParams.set(option.name, otherBundleOption?.bundle_option_variant_id + '');
        }
      });
    }
    const optionUrl = createUrl(pathname, bundleVariantSearchParams);
    window.history.replaceState(null, '', optionUrl);

    onClose();
  }, [bundleOption, bundleOptions, bundleVariant, dispatch, drawerBundleVariant?.id, onClose, pathname, searchParams]);

  useEffect(() => {
    setDrawerBundleVariant(currentBundleVariant);
  }, [currentBundleVariant]);

  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
    }
  }, [open, hasOpened]);

  useScrollLock(open);

  const variantLink = useMemo(() => getVariantLink(drawerBundleVariant), [drawerBundleVariant]);

  return (
    <Drawer open={open} onClose={onClose} anchor={desktop ? 'right' : 'bottom'} size={desktop ? 'md' : 'lg'}>
      <DialogTitle>
        <ModalClose />
      </DialogTitle>
      <DynamicDialogContent
        sx={{
          px: 6,
          position: 'relative',
        }}
      >
        {hasOpened && (
          <>
            <Stack
              flex={1}
              mb={8}
              sx={{
                overflow: 'auto',
              }}
            >
              {drawerBundleVariant?.images?.length && drawerBundleVariant?.images?.length > 0 ? (
                <Box
                  sx={{
                    position: 'relative',
                    mb: 4,
                    '.swiper-bundle-drawer': {
                      '.swiper-pagination': {
                        bottom: '10px',
                        textAlign: 'center',
                      },
                      '.swiper-pagination-bullet': {
                        width: '8px',
                        height: '8px',
                        display: 'inline-block',
                        borderRadius: '50%',
                        bgcolor: 'var(--fortress-palette-brand-mono-200)',
                        mx: '4px',
                        cursor: 'pointer',
                      },
                      '.swiper-pagination-bullet-active': {
                        bgcolor: 'var(--fortress-palette-brand-mono-600)',
                      },
                    },
                  }}
                >
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    pagination={{
                      enabled: true,
                      clickable: true,
                      bulletClass: 'swiper-pagination-bullet',
                      bulletActiveClass: 'swiper-pagination-bullet-active',
                      horizontalClass: 'swiper-pagination-horizontal',
                    }}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    className="swiper-bundle-drawer"
                  >
                    {drawerBundleVariant?.images?.map((image) => (
                      <SwiperSlide key={image.position}>
                        {/* <Box sx={{ aspectRatio: '16/9', position: 'relative' }}> */}
                        <FortressImage
                          src={image.links.feed}
                          alt={`${drawerBundleVariant?.name} - ${image.position} - image`}
                          ratio={1.5}
                          sizes={['0.3-md', '0.8-sm', '0.8-xs']}
                        />
                        {/* </Box> */}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <IconButton
                    variant="image"
                    onClick={() => {
                      swiperRef.current?.slidePrev();
                    }}
                    sx={{
                      position: 'absolute',
                      left: 2,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      '&.swiper-button-prev::after': {
                        display: 'none',
                      },
                      '--Icon-fontSize': '40px',
                    }}
                  >
                    <ArrowLeft />
                  </IconButton>
                  <IconButton
                    variant="image"
                    onClick={() => {
                      swiperRef.current?.slideNext();
                    }}
                    sx={{
                      position: 'absolute',
                      right: 2,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      '&.swiper-button-next::after': {
                        display: 'none',
                      },
                      '--Icon-fontSize': '40px',
                    }}
                  >
                    <ArrowRight />
                  </IconButton>
                </Box>
              ) : (
                <FortressImage src={''} alt={`${drawerBundleVariant?.name} - default image`} ratio={1.5} />
              )}
              <Typography
                component={CustomLink}
                level="h4"
                {...{ href: variantLink, target: '_blank', rel: 'noopener' }}
                sx={{
                  textDecoration: 'none',
                  mt: mobile ? 6 : 8,
                }}
              >
                {drawerBundleVariant?.product_name}
              </Typography>
              <Typography
                level="h5"
                component={'span'}
                sx={{
                  mt: 2,
                }}
              >
                {toPrice(drawerBundleVariant?.price, true)}
              </Typography>
              {optionTypes?.map((optionType) => {
                return (
                  <Stack key={optionType.id} mt={6} spacing={3}>
                    <ProductOptionsLabel optionType={optionType} variant={drawerBundleVariant} />
                    <ProductBundleValues
                      optionType={optionType}
                      variant={drawerBundleVariant}
                      combinations={combinations}
                      bundleVariants={variants}
                      onOptionClick={(tempBundleVariant) => {
                        setDrawerBundleVariant(tempBundleVariant);
                      }}
                    />
                  </Stack>
                );
              })}
            </Stack>
            <Button variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </>
        )}
      </DynamicDialogContent>
    </Drawer>
  );
};
