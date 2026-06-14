'use client';

import { RadioGroup, Stack, SxProps, useBreakpoints } from '@castlery/fortress';
import { Product, ProductOptionTypeName, RelatedProduct } from '@castlery/modules-product-domain';
import { OptionsValue } from '../../variant-selector/variant-selector';
import { Variant } from '@testing-library/react';
import {
  useParams,
  // useRouter
} from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useMemo } from 'react';
import { WebProductOptionModuleName } from '../config';

interface WebProductOptionModelProps {
  productData: Product | undefined;
  variant: Variant | undefined;
  sx?: SxProps | undefined;
  anchorId?: string;
}

export function WebProductOptionModel(props: WebProductOptionModelProps) {
  const {
    productData,
    // variant
    sx,
    anchorId,
  } = props;
  const params = useParams();
  const router = useRouter();
  const { mobile } = useBreakpoints();
  const selectName = useMemo(() => {
    return productData?.related_products?.filter(
      (relatedProduct: RelatedProduct) => relatedProduct.product_slug === params?.slug
    )[0]?.product_slug;
  }, [params?.slug, productData?.related_products]);
  const handleClick = useCallback(
    (relatedProductSlug: string) => {
      const isPlaPage = window?.location?.pathname?.includes('pla');
      const routeLink = `/${params?.region}/${isPlaPage ? 'pla' : 'products'}/${relatedProductSlug}${
        anchorId ? `#${anchorId}` : '#product_options'
      }`;
      router.push(routeLink);
    },
    [anchorId, params?.region, router]
  );

  return (
    <Stack
      sx={{
        ...sx,
      }}
    >
      {!!selectName! && (
        <RadioGroup
          orientation="horizontal"
          sx={{
            width: '100%',
          }}
          defaultValue={selectName}
        >
          <Stack
            flexDirection={'row'}
            justifyContent={'flex-start'}
            alignItems={'center'}
            gap={mobile ? '12px' : '16px'}
            useFlexGap
            flexWrap={'nowrap'}
            sx={{
              width: '100%',
              maxWidth: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              padding: '10px 2px',
            }}
          >
            {productData?.related_products?.map((relatedProduct, index) => (
              <OptionsValue
                outerModuleName={WebProductOptionModuleName}
                key={index}
                sx={{
                  textWrap: 'nowrap',
                  '--variant-borderWidth': '-50px',
                  borderRadius: '50px',
                  color: 'var(--fortress-palette-brand-wheat-700)',
                  '.MuiRadio-action': {
                    borderColor: 'var(--fortress-palette-brand-wheat-700) !important',
                    '--variant-borderWidth': '1px !important',
                    '&:hover': {
                      borderColor: 'var(--fortress-palette-brand-wheat-700)  !important',
                      backgroundColor: 'var(--fortress-palette-brand-wheat-200) !important',
                    },
                  },
                  label: {
                    color: 'var(--fortress-palette-brand-wheat-700) !important',
                    textWrap: 'nowrap',
                    whiteSpace: 'nowrap',
                  },
                  '.Mui-checked': {
                    backgroundColor: 'var(--fortress-palette-brand-wheat-200) !important',
                  },
                }}
                value={{
                  id: relatedProduct.id,
                  name: relatedProduct.product_slug,
                  presentation: relatedProduct.label,
                }}
                option={{
                  name: relatedProduct.label as ProductOptionTypeName,
                }}
                disabled={false}
                onAfterClick={() => {
                  handleClick(relatedProduct?.product_slug);
                }}
              />
            ))}
          </Stack>
        </RadioGroup>
      )}
    </Stack>
  );
}

export default WebProductOptionModel;
