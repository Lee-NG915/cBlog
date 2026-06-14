/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import {
  Box,
  ListItem,
  Radio,
  RadioGroup,
  Sheet,
  ListItemContent,
  useBreakpoints,
  AspectRatio,
  Typography,
  Tooltip,
  Badge,
  Divider,
  Stack,
  SxProps,
} from '@castlery/fortress';
import {
  searchVariantByVariantId,
  selectProduct,
  useGetVariantByVariantIdQuery,
  useLazyGetVariantByVariantIdQuery,
  useLazySearchVariantByVariantIdQuery,
} from '@castlery/modules-product-domain';
import type {
  BundleOption,
  Combination,
  OptionType,
  OptionValue,
  Product,
  Variant,
} from '@castlery/modules-product-domain';
import Image from 'next/image';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ProductOptionLabel } from '../product-options/product-option-label';
import { useMount } from 'react-use';
import { createUrl } from '@castlery/utils';
import { ShadowDot, Warning } from '@castlery/fortress/Icons';
import { deepClone } from '../utils';
import { FortressImage } from '@castlery/shared-components';
import { logger } from '@castlery/observability/client';
import { useCombination } from '../../hooks/use-combination';
import { useTrackingTags } from '@castlery/modules-tracking-components';

const moveValueToFirst = (arr: { name: string }[], value: string) => {
  const index = arr.findIndex((obj) => obj.name === value);
  if (index !== -1) {
    const obj = arr.splice(index, 1)[0];
    arr.unshift(obj);
  }
  return arr;
};

export const OptionsValue = ({
  value,
  option,
  onAfterClick,
  disabled,
  sx,
  isWebUse,
  outerModuleName = '',
}: {
  value: Pick<OptionValue, 'id' | 'name' | 'presentation'> & { image_url?: string };
  option: Pick<OptionValue, 'name'>;
  disabled?: boolean;
  onAfterClick: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  sx?: SxProps | undefined;
  isWebUse?: boolean;
  outerModuleName?: string;
}) => {
  const showImage = value?.image_url;
  const isOrientation = option.name.startsWith('orientation');

  const trackingTags = useTrackingTags({
    moduleName: outerModuleName,
    elementName: option.name,
    content: {
      selectorName: option.name,
      selectorValue: value.name,
    },
  });
  return (
    <Sheet
      key={value.id}
      sx={{
        ...{
          // height: 'auto',
          ...(showImage
            ? {
                width: 52,
                height: 52,
                ...(isOrientation && {
                  width: 104,
                }),
              }
            : {
                height: 'auto',
                paddingX: 2,
                paddingY: 1,
              }),
          borderRadius: 0,
        },
        ...sx,
      }}
    >
      {value.image_url ? (
        // <AspectRatio ratio={isOrientation ? 2 / 1 : 1} sx={{ p: '2px' }}>
        <FortressImage
          sx={{ p: '2px' }}
          src={value.image_url}
          alt={value.name}
          imageWidth={isOrientation ? 104 : 52}
          ratio={isOrientation ? 2 / 1 : 1}
          lazy={isWebUse ? true : false}
        />
      ) : (
        // <Image src={value.image_url} layout="fill" alt={value.name} />
        // </AspectRatio>
        ''
      )}

      <Radio
        disabled={disabled}
        onClick={(event) => {
          onAfterClick(event);
        }}
        overlay
        disableIcon
        value={value.name}
        label={showImage ? null : value.presentation}
        color="primary"
        aria-disabled={disabled}
        slotProps={{
          label: ({ checked, disabled }) => ({
            sx: {
              // fontWeight: 'lg',
              fontSize: 'md',
              color: (theme) =>
                checked
                  ? `${isWebUse ? theme.palette.brand.charcoal[800] : theme.palette.brand.terracotta[700]} !important`
                  : theme.palette.brand.charcoal[800],
              ...(isWebUse && {
                color: '#877445',
              }),
            },
          }),
          action: ({ checked }) => ({
            sx: (theme) => ({
              borderColor: theme.palette.brand.charcoal[300],
              ...(checked && {
                '--variant-borderWidth': '2px',
                '&&': {
                  // && to increase the specificity to win the base :hover styles
                  borderColor: (theme) =>
                    isWebUse
                      ? value.image_url
                        ? `${theme.palette.brand.charcoal[800]} !important`
                        : `${theme.palette.brand.wheat[500]} !important`
                      : `${theme.palette.brand.terracotta[700]} !important`,
                  color: theme.palette.brand.terracotta[700],
                  ...(isWebUse &&
                    !value.image_url && {
                      bgcolor: theme.palette.brand.wheat[200],
                    }),
                },
              }),
              ...(isWebUse &&
                !value.image_url && {
                  borderColor: `${theme.palette.brand.wheat[500]} !important`,
                }),
              '&:hover': {
                bgcolor: 'transparent',
                '--variant-borderWidth': '1px',
                '&&': {
                  // && to increase the specificity to win the base :hover styles
                  borderColor: (theme) =>
                    isWebUse
                      ? value.image_url
                        ? `${theme.palette.brand.charcoal[800]} !important`
                        : `${theme.palette.brand.wheat[500]} !important`
                      : `${theme.palette.brand.terracotta[600]} !important`,
                  color: theme.palette.brand.terracotta[600],
                  ...(isWebUse &&
                    !value.image_url && {
                      bgcolor: theme.palette.brand.wheat[10],
                    }),
                },
              },
            }),
          }),
          input: { ...trackingTags },
        }}
      />
    </Sheet>
  );
};

/**
 *
 * @param {String} str eg: 9:328;12:284;15:353
 * @returns {Array}
 */
export function optionTypesStrToObj(str: string) {
  if (typeof str !== 'string') return str;
  return str.split(';').map((item) => {
    const [option_type_id, option_value_id] = item.split(':');
    return {
      option_type_id: +option_type_id,
      option_value_id: +option_value_id,
    };
  });
}

export type Money = {
  amount: string;
  currencyCode: string;
};

type VariantSelectorProps = {
  customizations: Product['customizations'];
  options: Product['option_types'];
  defaultVariant?: Variant;
  onVariantChange?: (variant: Variant) => void;
  showCustomized?: boolean;
};

// TODO 记得处理 customizations 的情况
export function VariantSelector({
  customizations,
  options,
  defaultVariant,
  onVariantChange = (variant) => {
    return;
  },
  showCustomized = false,
}: VariantSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useMount(() => {
    if (defaultVariant) {
      onVariantChange(defaultVariant);
    }
  });

  const [currentVariant, setCurrentVariant] = useState(defaultVariant);

  const [getVariantByVariantId, { isFetching }] = useLazyGetVariantByVariantIdQuery();

  useEffect(() => {
    setCurrentVariant(defaultVariant);
  }, [defaultVariant]);

  // const combinations: Combination[] = customizations.map((variant) => ({
  //   id: variant.variant_id,
  //   availableForSale: !variant.discontinued,
  //   is_customized: variant.is_customized,
  //   // Adds key / value pairs for each variant (ie. "color": "Black" and "size": 'M").
  //   ...optionTypesStrToObj(variant.option_types).reduce((accumulator, optionId) => {
  //     const item = options.find(({ id }) => id === optionId.option_type_id);
  //     const val = item?.values.find(({ id }) => id === optionId.option_value_id);
  //     if (!item || !val) return { ...accumulator };
  //     return { ...accumulator, [item.name]: val.name };
  //   }, {}),
  // }));
  const combinations: Combination[] = useCombination({ customizations, optionTypes: options });

  return (
    <Box>
      {options.map((optionType) => {
        const defaultValue = defaultVariant?.variant_option_values.find(({ option_type_name }) => {
          return option_type_name === optionType.name;
        })?.name;
        const sortOptionType = deepClone(optionType);
        // sortOptionType.values = moveValueToFirst(sortOptionType.values, defaultValue);
        // sortOptionType.values = sortOptionType.values;

        return (
          <>
            <Stack
              key={sortOptionType.id}
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              sx={{
                boxSizing: 'border-box',
                minHeight: '56px',
                py: 4,
                ':first-child': {
                  marginTop: 0,
                },
              }}
            >
              {/* label */}
              <ProductOptionLabel option={sortOptionType} variant={currentVariant} />
              <RadioGroup
                orientation="horizontal"
                sx={{
                  gap: 1,
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingY: 1,
                }}
                // defaultValue={defaultValue}
                value={
                  currentVariant?.variant_option_values.find(({ option_type_name }) => {
                    return optionType.name === option_type_name;
                  })?.name
                }
              >
                <Stack gap={2}>
                  <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
                    {sortOptionType.values
                      .filter(({ name }) =>
                        combinations.find((combination) => combination[sortOptionType.name] === name)
                      )
                      .map((optionValue) => {
                        const optionNameLowerCase = sortOptionType.name.toLowerCase();

                        // Base option params on current params so we can preserve any other param state in the url.
                        const optionSearchParams = new URLSearchParams(searchParams.toString());
                        if (currentVariant) {
                          for (const { option_type_name, name } of currentVariant.variant_option_values) {
                            optionSearchParams.set(option_type_name.toLowerCase(), name);
                          }
                        }
                        // // Update the option params using the current option to reflect how the url *would* change,
                        // // if the option was clicked.
                        optionSearchParams.set(optionNameLowerCase, optionValue.name);
                        // const optionUrl = createUrl(pathname, optionSearchParams);

                        // In order to determine if an option is available for sale, we need to:
                        //
                        // 1. Filter out all other param state
                        // 2. Filter out invalid options
                        // 3. Check if the option combination is available for sale
                        //
                        // This is the "magic" that will cross check possible variant combinations and preemptively
                        // disable combinations that are not available. For example, if the color gray is only available in size medium,
                        // then all other sizes should be disabled.

                        /**
                         * eg filtered = [["orientation", "right_facing"],["material", "fumo_grey"],["leg_color", "brass_cap"]]
                         */
                        const filtered = Array.from(optionSearchParams.entries()).filter(([key, value]) =>
                          options.find(
                            (option) =>
                              option.name.toLowerCase() === key && option.values.find(({ name }) => name === value)
                          )
                        );
                        const currentOptionVariantCombination = combinations.find((combination) =>
                          filtered.every(([key, value]) => combination[key] === value && combination.availableForSale)
                        );

                        return {
                          optionValue,
                          currentOptionVariantCombination,
                        };
                      })
                      .sort((a, b) => {
                        // is_customized 为 true 的在前，为 false 的在后
                        const aIsCustomized = a.currentOptionVariantCombination?.is_customized ?? false;
                        const bIsCustomized = b.currentOptionVariantCombination?.is_customized ?? false;
                        if (aIsCustomized === bIsCustomized) return 0;
                        return aIsCustomized ? 1 : -1;
                      })
                      .map(({ optionValue, currentOptionVariantCombination }) => {
                        const optionNameLowerCase = sortOptionType.name.toLowerCase();

                        const isActive = searchParams.get(optionNameLowerCase) === optionValue.name;

                        let currentOptionVariantId = currentOptionVariantCombination?.id;
                        // if (!currentOptionVariantCombination) return null;
                        const afterClickFunc = async () => {
                          if (!currentOptionVariantId) {
                            currentOptionVariantId = combinations.find((combination) => {
                              return combination[sortOptionType.name] === optionValue.name;
                            })?.id;
                          }
                          console.log(
                            '🚀 ~ file: variant-selector.tsx:327 ~ currentOptionVariantId=combinations.find ~ combination:',
                            combinations
                          );
                          console.log(
                            '🚀 ~ file: variant-selector.tsx:327 ~ currentOptionVariantId=combinations.find ~ sortOptionType.name:',
                            sortOptionType.name
                          );
                          if (!currentOptionVariantId) {
                            logger.error('Current option variant ID not found in combinations', {
                              combinations,
                              optionName: sortOptionType.name,
                            });

                            return;
                          }
                          try {
                            const res = await getVariantByVariantId(currentOptionVariantId, false).unwrap();
                            setCurrentVariant(res);
                            onVariantChange(res);
                            const optionSearchParams = new URLSearchParams(searchParams.toString());
                            if (res) {
                              for (const { option_type_name, name } of res.variant_option_values) {
                                optionSearchParams.set(option_type_name.toLowerCase(), name);
                              }
                            }
                            optionSearchParams.set(optionNameLowerCase, optionValue.name);
                            const optionUrl = createUrl(pathname, optionSearchParams);
                            router.replace(optionUrl, { scroll: false });
                          } catch (error) {
                            logger.error('Failed to change variant selection', { error });
                          }
                        };

                        return sortOptionType.name === 'material' && currentOptionVariantCombination?.is_customized ? (
                          <Box
                            sx={{
                              position: 'relative',
                            }}
                          >
                            <ShadowDot
                              sx={{
                                position: 'absolute',
                                right: '-5px',
                                top: '-5px',
                                width: '16px',
                                height: '16px',
                                zIndex: 2,
                              }}
                            />
                            <OptionsValue
                              key={optionValue?.id}
                              value={optionValue}
                              option={sortOptionType}
                              // disabled={!currentOptionVariantCombination}
                              onAfterClick={afterClickFunc}
                            />
                          </Box>
                        ) : (
                          <OptionsValue
                            key={optionValue.id}
                            value={optionValue}
                            option={sortOptionType}
                            // disabled={!currentOptionVariantCombination}
                            onAfterClick={afterClickFunc}
                          />
                        );
                      })}
                  </Stack>
                </Stack>
              </RadioGroup>
            </Stack>
            {/* <Divider /> */}
          </>
        );
      })}
    </Box>
  );
}

type BundleVariantSelectorProps = {
  bundle_option: BundleOption;
  customizations?: never;
  // variants: Variant[];
  // options: Product['option_types'];
  defaultVariant: Variant;
  onVariantChange?: (variant: Variant) => void;
  onRouteChange?: (url: string) => void;
  onCanClickConfirm?: (canClick: boolean) => void;
};
// vincent-dining-table-with-2-chairs-walnut-and-doris-bench
export function BundleVariantSelector({
  bundle_option,
  defaultVariant,
  onVariantChange = (variant) => {
    return variant;
  },
  onRouteChange,
  onCanClickConfirm,
}: BundleVariantSelectorProps) {
  const variants = bundle_option.variants;
  const optionTypes = bundle_option.option_types;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onInterRouteChange = onRouteChange
    ? onRouteChange
    : (optionUrl: string) => {
        router.replace(optionUrl, { scroll: false });
      };

  useMount(() => {
    onVariantChange(defaultVariant);
  });
  const [currentVariant, setCurrentVariant] = useState(defaultVariant);
  const [getVariantByVariantId, { isFetching }] = useLazyGetVariantByVariantIdQuery();
  const [searchVariantByVariantId, { isFetching: isSearchFetching }] = useLazySearchVariantByVariantIdQuery();
  useEffect(() => {
    if (onCanClickConfirm) {
      onCanClickConfirm(!isSearchFetching);
    }
  }, [isSearchFetching, onCanClickConfirm]);

  useEffect(() => {
    setCurrentVariant(defaultVariant);
  }, [defaultVariant]);

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: !variant.discontinued,
    is_customized: false,
    // Adds key / value pairs for each variant (ie. "color": "Black" and "size": 'M").
    ...variant.variant_option_values.reduce((accumulator, optionId) => {
      const item = optionTypes.find(({ id }) => id === optionId.option_type_id);
      const val = item?.values.find(({ id }) => id === optionId.option_value_id);
      if (!item || !val) return { ...accumulator };
      return { ...accumulator, [item.name]: val.name };
    }, {}),
  }));

  return (
    <Box
      sx={{
        marginBottom: 2,
      }}
    >
      {optionTypes.map((optionType) => {
        const defaultValue = defaultVariant.variant_option_values.find(
          ({ option_type_name }) => option_type_name === optionType.name
        )?.name;
        return (
          <ListItem key={optionType.id}>
            {/* TODO 后续再处理 bundle 里的 FreeSwatch 问题 */}
            <Stack>
              <ProductOptionLabel option={optionType} showFreeSwatch={false} variant={currentVariant} />
              <RadioGroup
                orientation="horizontal"
                sx={{
                  gap: 1,
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingY: 1,
                }}
                defaultValue={defaultValue}
              >
                {optionType.values.map((optionValue) => {
                  // Update the option params using the current option to reflect how the url *would* change,
                  // if the option was clicked.

                  // In order to determine if an option is available for sale, we need to:
                  //
                  // 1. Filter out all other param state
                  // 2. Filter out invalid options
                  // 3. Check if the option combination is available for sale
                  //
                  // This is the "magic" that will cross check possible variant combinations and preemptively
                  // disable combinations that are not available. For example, if the color gray is only available in size medium,
                  // then all other sizes should be disabled.

                  const variantOptionsWithThisOption = new Map(
                    bundle_option.variants
                      .find((v) => v.id === currentVariant.id)
                      ?.variant_option_values.map((optionValue) => {
                        return [optionValue.option_type_name, optionValue.name];
                      }) || []
                  );
                  variantOptionsWithThisOption.set(optionType.name, optionValue.name);

                  const currentOptionCombination = Array.from(variantOptionsWithThisOption.entries());
                  const isAvailableForSale = combinations.find((combination) => {
                    return currentOptionCombination.every(
                      ([key, value]) =>
                        combination[key as keyof typeof combination].toString() === value &&
                        combination.availableForSale
                    );
                  });
                  const currentOptionVariantId = isAvailableForSale?.id;
                  // The option is active if it's in the url params.
                  // const isActive = searchParams.get(optionNameLowerCase) === value.name;
                  if (!isAvailableForSale) return null;
                  const afterClickFunc = async () => {
                    if (!currentOptionVariantId) return;
                    try {
                      console.log('is running in here');
                      // const res = await getVariantByVariantId(currentOptionVariantId, true).unwrap();
                      const res = await searchVariantByVariantId(currentOptionVariantId, true).unwrap();
                      setCurrentVariant(res);
                      onVariantChange(res);
                      const bundleOptionNameLowerCase = bundle_option.name.toLowerCase();

                      // Base option params on current params so we can preserve any other param state in the url.
                      const variantSearchParams = new URLSearchParams(searchParams.toString());

                      // Update the option params using the current option to reflect how the url *would* change,
                      // if the option was clicked.
                      variantSearchParams.set(bundleOptionNameLowerCase, currentOptionVariantId + '');

                      const optionUrl = createUrl(pathname, variantSearchParams);

                      onInterRouteChange(optionUrl);
                    } catch (error) {
                      logger.error('Failed to handle inter-route change', { error });
                    }
                  };
                  return (
                    <OptionsValue
                      key={isAvailableForSale.id}
                      value={optionValue}
                      option={optionType}
                      disabled={!isAvailableForSale}
                      onAfterClick={afterClickFunc}
                    />
                  );
                })}
              </RadioGroup>
            </Stack>
          </ListItem>
        );
      })}
    </Box>
  );
}
