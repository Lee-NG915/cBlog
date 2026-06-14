'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Divider,
  Link,
  RadioButton,
  RadioGroup,
  Sheet,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { Combination, OptionType, Product, selectLeadtimeShippingFee, Variant } from '@castlery/modules-product-domain';
import { useCallback, useMemo, useState } from 'react';
import { useProductOptionValues } from '../../../../hooks/use-product-option-values';
import { useCombination } from '../../../../hooks/use-combination';
import { OptionSelector } from '@castlery/shared-components';
import { ProductFabricTooltip } from '../product-configurable-options/product-fabrc-tooltip';
import { ProductFabricDrawer } from '../product-configurable-options/product-fabric-drawer';
import { ProductFreeSwatchDrawer } from '../product-configurable-options/product-free-swatch-drawer';
import { CategoryGroup } from '@castlery/types';
import { useRouter } from 'nextjs-toploader/app';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { EVENT_PDP_CONFIGURATION } from '@castlery/modules-tracking-services';
import { ProductOptionsValues } from '../product-configurable-options/product-options-values';

interface ProductSelectorSectionOptionProps {
  sortOptionType: OptionType;
  product: Product;
  variant: Variant | undefined;
  categoryGroup?: CategoryGroup;
}

export const ProductSelectorSectionOption = (props: ProductSelectorSectionOptionProps) => {
  const { sortOptionType, product, variant, categoryGroup } = props;
  const leadTimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const dispatch = useAppDispatch();
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [openFabricDrawer, setOpenFabricDrawer] = useState(false);
  const [openFreeSwatchDrawer, setOpenFreeSwatchDrawer] = useState(false);
  const { desktop, mobile } = useBreakpoints();
  const router = useRouter();

  const isMaterialOptionType = useMemo(() => sortOptionType.name === 'material', [sortOptionType]);

  const optionPresentation = useMemo(() => {
    let presentation = '';
    if (variant && variant?.variant_option_values) {
      variant.variant_option_values.forEach((value) => {
        if (value.option_type_name === sortOptionType?.name) {
          presentation = value.presentation;
        }
      });
    }
    return presentation;
  }, [variant, sortOptionType]);

  const combinations: Combination[] = useCombination({
    customizations: product?.customizations,
    optionTypes: product?.option_types,
  });

  const { sortOptionValues } = useProductOptionValues({
    sortOptionType,
    product,
    variant,
    combinations,
  });

  const handleSelect = useCallback(
    (optionId: string) => {
      const selectedOption = sortOptionValues?.find((option) => option.id === optionId);
      if (selectedOption) {
        selectedOption.onSelect();
      }
    },
    [sortOptionValues]
  );

  const stockedOptions = useMemo(
    () => sortOptionValues?.filter(({ isCustomized }) => !isCustomized) || [],
    [sortOptionValues]
  );
  const customOptions = useMemo(
    () => sortOptionValues?.filter(({ isCustomized }) => isCustomized) || [],
    [sortOptionValues]
  );

  const freeSwatch = useMemo(() => product?.show_free_swatch, [product]);

  const { deliveryLeadTimeDisplay } = useMemo(() => {
    return {
      deliveryLeadTimeDisplay: leadTimeShippingFee?.delivery_lead_time_presentation || '',
    };
  }, [leadTimeShippingFee]);

  return (
    <Stack mt={mobile ? 6 : 7}>
      <Stack direction="row" justifyContent="space-between">
        {isMaterialOptionType ? (
          <Typography
            level="h5"
            sx={{
              textTransform: 'lowercase',
              display: 'inline-block',
              '&::first-letter': {
                textTransform: 'uppercase',
              },
            }}
          >
            {sortOptionType.presentation}
          </Typography>
        ) : (
          <Typography level="body1">
            <Box
              component="span"
              sx={{
                textTransform: 'lowercase',
                display: 'inline-block',
                '&::first-letter': {
                  textTransform: 'uppercase',
                },
              }}
            >
              {sortOptionType?.presentation}
            </Box>
            :{' '}
            <Typography
              component="span"
              level="body1"
              sx={{
                fontStyle: 'italic',
                textTransform: 'lowercase',
                display: 'inline-block',
                '&::first-letter': {
                  textTransform: 'uppercase',
                },
              }}
            >
              {optionPresentation}
            </Typography>
          </Typography>
        )}

        <Typography level="caption2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>{`${
          sortOptionValues?.length
        } ${sortOptionValues?.length === 1 ? 'option' : 'options'} available`}</Typography>
      </Stack>
      {isMaterialOptionType ? (
        <Sheet
          variant="solid"
          sx={{
            mt: 3,
            pt: 1,
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-300)',
          }}
        >
          <AccordionGroup variant="plain">
            <Accordion expanded={accordionOpen} onChange={(event, expanded) => setAccordionOpen(expanded)}>
              <AccordionSummary
                sx={{
                  p: 4,
                  backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
                  '& .MuiAccordionSummary-button': {
                    alignItems: 'flex-start',
                  },
                  '&:has([data-prevent-accordion-hover]:hover)': {
                    '& *': {
                      color: 'inherit !important',
                    },
                  },
                }}
                indicator={
                  <Link
                    component="span"
                    role="button"
                    tabIndex={0}
                    variant="secondary"
                    level="caption2"
                    sx={{
                      transform: accordionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    {accordionOpen ? 'Hide' : 'Select'}
                  </Link>
                }
              >
                <Stack direction="column" justifyContent="center" alignItems="flex-start">
                  <Typography
                    level="h5"
                    sx={{
                      color: 'var(--fortress-palette-brand-terracotta-500)',
                    }}
                  >
                    {optionPresentation}
                  </Typography>
                  <Typography
                    data-prevent-accordion-hover
                    level="caption1"
                    sx={{
                      mt: 2,
                      display: deliveryLeadTimeDisplay ? 'block' : 'none',
                      color: 'var(--fortress-palette-brand-maroonVelvet-500) !important',
                      pointerEvents: 'none',
                    }}
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                  >
                    Estimate arrival:&nbsp;{deliveryLeadTimeDisplay?.replace('Within', '')}
                  </Typography>
                  <Stack
                    data-prevent-accordion-hover
                    direction="row"
                    mt={4}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                  >
                    <Link
                      component="span"
                      role="button"
                      level="caption1"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenFabricDrawer(true);
                      }}
                    >
                      View fabric details
                    </Link>
                    <Divider
                      orientation="vertical"
                      sx={{
                        mx: 3,
                        display: freeSwatch ? 'flex' : 'none',
                      }}
                    />
                    <Link
                      component="span"
                      role="button"
                      level="caption1"
                      variant="secondary"
                      data-selenium="open_swatch"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenFreeSwatchDrawer(true);
                      }}
                      sx={{
                        display: freeSwatch ? 'inline-block' : 'none',
                      }}
                    >
                      Get free swatches
                    </Link>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    maxHeight: '260px',
                    overflowY: 'auto',
                  }}
                >
                  {categoryGroup?.showGroupOptions && (
                    <Stack mx={4} mt={mobile ? 4 : 6}>
                      <RadioGroup
                        name="layout-options"
                        value={categoryGroup?.activeGroupKey}
                        onChange={async (event) => {
                          const selectedGroupKey = event.target.value;
                          const selectedGroupKeyBucket = categoryGroup?.groupKeyBuckets?.find(
                            (groupKeyBucket) => groupKeyBucket.groupKey === selectedGroupKey
                          );
                          if (selectedGroupKeyBucket) {
                            dispatch(
                              EVENT_PDP_CONFIGURATION({
                                action: 'material_tab',
                                label: selectedGroupKeyBucket?.groupKey ?? '',
                              })
                            );
                            await new Promise((resolve) => setTimeout(resolve, 100));
                            router.push(`${selectedGroupKeyBucket?.defaultLink}`, { scroll: false });
                          }
                        }}
                      >
                        <Stack
                          direction="row"
                          gap={3}
                          sx={{
                            width: '100%',
                          }}
                        >
                          {categoryGroup?.groupKeyBuckets?.map((groupKeyBucket) => (
                            <RadioButton
                              key={groupKeyBucket.groupKey}
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
                                  {groupKeyBucket.groupKey?.toLowerCase()}
                                </Box>
                              }
                              value={groupKeyBucket.groupKey}
                              sx={{ flex: 1 }}
                            />
                          ))}
                        </Stack>
                      </RadioGroup>
                    </Stack>
                  )}
                  <Stack mx={4}>
                    {stockedOptions.length > 0 && (
                      <Stack>
                        <Typography level="body1" my={3}>
                          Stocked Fabrics:
                        </Typography>
                        <OptionSelector
                          options={stockedOptions}
                          onSelect={handleSelect}
                          maxDisplay={stockedOptions.length}
                          showAdditionalCount={false}
                          sx={{
                            flexWrap: 'wrap',
                          }}
                          isProductPage={true}
                          isNeedTooltip={desktop ? true : false}
                          TooltipContent={ProductFabricTooltip}
                          variant="square"
                          size={64}
                        />
                      </Stack>
                    )}
                    {customOptions.length > 0 && (
                      <Stack>
                        <Typography level="body1" mt={3} mb={1}>
                          Custom Fabrics:
                        </Typography>
                        <Typography level="body2" mb={3}>
                          Create a piece made just for you in one of our custom fabrics.
                        </Typography>
                        <OptionSelector
                          options={customOptions}
                          onSelect={handleSelect}
                          maxDisplay={customOptions.length}
                          showAdditionalCount={false}
                          sx={{
                            flexWrap: 'wrap',
                          }}
                          isProductPage={true}
                          isNeedTooltip={desktop ? true : false}
                          TooltipContent={ProductFabricTooltip}
                          variant="square"
                          size={64}
                        />
                      </Stack>
                    )}
                    <ProductFabricDrawer
                      open={openFabricDrawer}
                      onClose={() => setOpenFabricDrawer(false)}
                      options={sortOptionValues || []}
                      selectedOption={sortOptionValues?.find((option) => option.isSelected)}
                    />
                    <ProductFreeSwatchDrawer
                      open={openFreeSwatchDrawer}
                      onClose={() => setOpenFreeSwatchDrawer(false)}
                    />
                  </Stack>
                </Box>
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
        </Sheet>
      ) : (
        <ProductOptionsValues sortOptionType={sortOptionType} product={product} variant={variant} />
      )}
      <Divider
        sx={{
          mt: mobile ? 6 : 7,
        }}
      />
    </Stack>
  );
};
