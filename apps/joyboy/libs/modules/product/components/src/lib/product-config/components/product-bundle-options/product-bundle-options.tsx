'use client';

import { Link, Sheet, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { BundleOption, selectCurrentBundleVariants, selectProduct } from '@castlery/modules-product-domain';
import { FortressImage } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useState } from 'react';
import { ProductBundleDrawer } from './product-bundle-drawer';
import ArrowUp from '@castlery/fortress/Icons/svg/ArrowUp';

export const ProductBundleOptions = () => {
  const product = useAppSelector(selectProduct);
  const currentBundleVariant = useAppSelector(selectCurrentBundleVariants);
  const [open, setOpen] = useState(false);
  const { desktop, mobile, tablet } = useBreakpoints();
  const [currentBundleOption, setCurrentBundleOption] = useState<BundleOption | undefined>();
  return (
    <Stack gap={4} mt={6} px={mobile ? 6 : tablet ? 6 : undefined}>
      {product?.bundle_options &&
        product?.bundle_options?.map((option) => {
          return (
            <Sheet
              variant="solid"
              sx={{
                // px: mobile ? 4 : 6,
                px: 4,
                py: mobile ? 4 : 2,
              }}
            >
              <Stack key={option?.id} direction={'row'} justifyContent={'center'} alignItems={'center'} gap={2}>
                <FortressImage
                  src={currentBundleVariant?.[String(option?.id)]?.images[0]?.links?.feed || ''}
                  alt={currentBundleVariant?.[String(option?.id)]?.name || ''}
                  ratio={2}
                  sx={{
                    flex: 1,
                  }}
                  sizes={['0.3-md', '0.5-sm', '0.5-xs']}
                />
                <Stack flex={1} py={desktop ? 2 : undefined}>
                  <Typography
                    level="h4"
                    variant="plain"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentBundleVariant?.[String(option?.id)]?.variantName}
                  </Typography>
                  <Typography level="body2" variant="plain">
                    {currentBundleVariant?.[String(option?.id)]?.variantInfo}
                  </Typography>
                  {(currentBundleVariant?.[String(option?.id)]?.variant_option_values?.length ?? 0) > 0 && (
                    <Link
                      role="button"
                      variant="primary"
                      component="button"
                      onClick={() => {
                        setCurrentBundleOption(option);
                        setOpen(true);
                      }}
                      endDecorator={
                        <ArrowUp
                          sx={{
                            transform: 'rotate(90deg)',
                          }}
                        />
                      }
                    >
                      {'Select'}
                    </Link>
                  )}
                </Stack>
              </Stack>
            </Sheet>
          );
        })}
      <ProductBundleDrawer
        open={open}
        onClose={() => setOpen(false)}
        bundleOption={currentBundleOption}
        bundleOptions={product?.bundle_options}
        currentBundleVariant={currentBundleVariant?.[String(currentBundleOption?.id)]}
      />
    </Stack>
  );
};
