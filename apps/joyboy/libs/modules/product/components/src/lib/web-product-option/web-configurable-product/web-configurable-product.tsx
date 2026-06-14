'use client';

import {
  changeVariant,
  Combination,
  Product,
  useLazyGetVariantByVariantIdQuery,
} from '@castlery/modules-product-domain';
import { useState } from 'react';
import { OptionsValue } from '../../variant-selector/variant-selector';
import { useCombination } from '../../../hooks/use-combination';
import {
  // Box,
  RadioGroup,
  Stack,
  useBreakpoints,
} from '@castlery/fortress';
import cloneDeep from 'lodash.clonedeep';
import { ProductOptionLabel } from '../../product-options/product-option-label';
import {
  usePathname,
  // useRouter
  useSearchParams,
} from 'next/navigation';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { createUrl } from '@castlery/utils';
// import { ShadowDot } from '@castlery/fortress/Icons';
import { WebProductOptionModuleName } from '../config';

interface WebConfigurableProductProps {
  productData: Product | undefined;
  pageType: string;
}

interface WebNormalConfigurableProductProps {
  productData: Product | undefined;
  pageType: string;
}

interface WebBundleConfigurableProductProps {
  productData: Product | undefined;
}

export function WebConfigurableProduct(props: WebConfigurableProductProps) {
  const { productData, pageType } = props;
  if (productData?.product_type === 'bundle' && productData?.bundle_options) {
    return <WebBundleConfigurableProduct productData={productData} />;
  }
  return <WebNormalConfigurableProduct productData={productData} pageType={pageType} />;
}

const WebNormalConfigurableProduct = (props: WebNormalConfigurableProductProps) => {
  const { productData, pageType } = props;
  const { desktop, mobile } = useBreakpoints();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const defaultVariant = productData?.variants[0];
  const [currentVariant, setCurrentVariant] = useState(defaultVariant);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getVariantByVariantId, { isFetching }] = useLazyGetVariantByVariantIdQuery();
  const combinations: Combination[] = useCombination({
    customizations: productData?.customizations,
    optionTypes: productData?.option_types,
  });

  return (
    <Stack
      spacing={3}
      sx={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: mobile ? '24px' : '32px',
      }}
    >
      {productData?.option_types?.map((optionType) => {
        const sortOptionType = cloneDeep(optionType);
        return (
          <Stack
            key={sortOptionType.id}
            direction="column"
            style={{
              width: '100%',
            }}
          >
            <ProductOptionLabel
              option={sortOptionType}
              variant={currentVariant}
              showFreeSwatch={false}
              sx={{
                maxWidth: '100%',
              }}
            />
            <RadioGroup
              orientation="horizontal"
              sx={{
                marginTop: desktop ? '16px' : '8px',
              }}
              value={
                currentVariant?.variant_option_values?.find(({ option_type_name }) => {
                  return optionType.name === option_type_name;
                })?.name
              }
            >
              <Stack
                spacing={1}
                direction="row"
                // flexWrap={desktop ? 'wrap' : 'nowrap'}
                flexWrap={'wrap'}
                useFlexGap
                gap={'12px'}
                style={{
                  // ...(!desktop && {
                  //   overflowX: 'auto',
                  //   overflowY: 'hidden',
                  //   '&::-webkit-scrollbar': {
                  //     display: 'none',
                  //   },
                  //   padding: !desktop ? '10px 2px' : undefined,
                  // }),
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                }}
              >
                {sortOptionType?.values
                  .filter(({ name }) => combinations?.find((combination) => combination[sortOptionType.name] === name))
                  .map((optionValue) => {
                    const optionNameLowerCase = sortOptionType?.name?.toLowerCase();
                    const optionSearchParams = new URLSearchParams(searchParams?.toString());
                    if (currentVariant) {
                      for (const { option_type_name, name } of currentVariant.variant_option_values) {
                        optionSearchParams.set(option_type_name.toLowerCase(), name);
                      }
                    }
                    optionSearchParams.set(optionNameLowerCase, optionValue?.name);
                    const filtered = Array.from(optionSearchParams?.entries())?.filter(([key, value]) =>
                      productData?.option_types.find(
                        (option) =>
                          option.name.toLowerCase() === key && option.values.find(({ name }) => name === value)
                      )
                    );
                    const currentOptionVariantCombination = combinations?.find((combination) =>
                      filtered?.every(([key, value]) => combination[key] === value && combination.availableForSale)
                    );
                    let currentOptionVariantId = currentOptionVariantCombination?.id;
                    const clickHandler = async () => {
                      if (!currentOptionVariantId) {
                        currentOptionVariantId = combinations.find((combination) => {
                          return combination[sortOptionType?.name] === optionValue?.name;
                        })?.id;
                        if (!currentOptionVariantId) return;
                      }
                      try {
                        const res = await getVariantByVariantId(currentOptionVariantId, false).unwrap();
                        setCurrentVariant(res);
                        dispatch(changeVariant(res));
                        if (pageType !== 'pla') {
                          const optionSearchParams = new URLSearchParams(searchParams.toString());
                          if (res) {
                            for (const { option_type_name, name } of res.variant_option_values) {
                              optionSearchParams.set(option_type_name.toLowerCase(), name);
                            }
                          }
                          optionSearchParams.set(optionNameLowerCase, optionValue?.name);
                          const optionUrl = createUrl(pathname, optionSearchParams);
                          window.history.replaceState(null, '', optionUrl);
                        }
                      } catch (error) {
                        console.log('🚀 ~ clickHandler ~ error:', error);
                      }
                    };
                    // return sortOptionType?.name === 'material' && currentOptionVariantCombination?.is_customized ? (
                    //   <Box
                    //     sx={{
                    //       position: 'relative',
                    //     }}
                    //   >
                    //     <ShadowDot
                    //       sx={{
                    //         position: 'absolute',
                    //         right: '-5px',
                    //         top: '-5px',
                    //         width: '16px',
                    //         height: '16px',
                    //         zIndex: 2,
                    //       }}
                    //     />
                    //     <OptionsValue
                    //       key={optionValue?.id}
                    //       value={optionValue}
                    //       option={sortOptionType}
                    //       onAfterClick={clickHandler}
                    //     />
                    //   </Box>
                    // ) : (
                    //   <OptionsValue
                    //     key={optionValue?.id}
                    //     value={optionValue}
                    //     option={sortOptionType}
                    //     onAfterClick={clickHandler}
                    //   />
                    // );
                    return (
                      <OptionsValue
                        outerModuleName={WebProductOptionModuleName}
                        sx={{
                          '.Mui-checked': {
                            borderWidth: '1px !important',
                          },
                          ...(!optionValue?.image_url && {
                            padding: '12px 24px',
                          }),
                        }}
                        isWebUse={true}
                        key={optionValue?.id}
                        value={optionValue}
                        option={sortOptionType}
                        onAfterClick={clickHandler}
                      />
                    );
                  })}
              </Stack>
            </RadioGroup>
          </Stack>
        );
      })}
    </Stack>
  );
};

const WebBundleConfigurableProduct = (props: WebBundleConfigurableProductProps) => {
  return <div></div>;
};
