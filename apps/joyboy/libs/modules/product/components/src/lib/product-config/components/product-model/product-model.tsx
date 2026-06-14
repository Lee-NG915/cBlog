'use client';

import { Box, RadioButton, RadioGroup, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { selectProduct } from '@castlery/modules-product-domain';
import { useSelector } from '@castlery/shared-redux-store';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useMemo } from 'react';
import { EVENT_PDP_CONFIGURATION } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

interface ProductModelProps {
  slug: string;
  pageType: 'pdp' | 'pla';
}

export const ProductModel = (props: ProductModelProps) => {
  const dispatch = useAppDispatch();
  const { slug, pageType } = props;
  const product = useSelector(selectProduct);
  const params = useParams();
  const router = useRouter();
  const { mobile, tablet } = useBreakpoints();
  const { modelSwitch } = makePersistenceHandles();
  const selectName = useMemo(
    () => product?.related_products?.find((relatedProduct) => relatedProduct.product_slug === slug)?.product_slug,
    [product?.related_products, slug]
  );
  const selectRelatedProductOptions = useMemo(
    () =>
      product?.related_products?.map((item) => ({
        id: item.id,
        name: item.product_slug,
        presentation: item.label,
      })),
    [product?.related_products]
  );

  const selectedModelOption = useMemo(() => {
    return selectRelatedProductOptions?.find((item) => item.id === product?.id);
  }, [selectRelatedProductOptions, selectName]);

  const handleTrack = useCallback(
    async ({ label, spuName, spuId }: { label: string; spuName: string; spuId: string | number }) => {
      await dispatch(EVENT_PDP_CONFIGURATION({ action: 'model', label: label, spuName: spuName, spuId: spuId }));
    },
    [dispatch]
  );

  const handleClick = (relatedProductSlug: string) => {
    modelSwitch.setItem('true');

    const target = selectRelatedProductOptions?.find((item) => item.name === relatedProductSlug);
    if (target) {
      handleTrack({
        label: target?.presentation ?? '',
        spuName: product?.name ?? '',
        spuId: target?.id ?? '',
      });
    }
    const routeLink = `/${params?.region}/${pageType === 'pdp' ? 'products' : 'pla'}/${relatedProductSlug}`;
    router.replace(routeLink);
  };

  if (!selectRelatedProductOptions || selectRelatedProductOptions?.length <= 1) {
    return null;
  }

  return (
    <Stack mt={mobile ? 4 : 6} px={mobile ? 6 : tablet ? 6 : undefined}>
      {!!selectName && (
        <>
          <Typography level="body1" mb={3}>
            Model:
          </Typography>
          <RadioGroup
            name="model-options"
            value={selectedModelOption?.name}
            onChange={(event) => handleClick(event.target.value)}
          >
            <Stack direction="row" gap={3} flexWrap="wrap">
              {selectRelatedProductOptions?.map((item) => (
                <RadioButton
                  key={item.id}
                  label={
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        textTransform: 'lowercase',
                        '&::first-letter': {
                          textTransform: 'uppercase',
                        },
                      }}
                    >
                      {item.presentation?.toLowerCase()}
                    </Box>
                  }
                  value={item.name}
                />
              ))}
            </Stack>
          </RadioGroup>
        </>
      )}
    </Stack>
  );
};
