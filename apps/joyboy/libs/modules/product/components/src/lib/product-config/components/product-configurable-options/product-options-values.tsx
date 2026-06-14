'use client';

import { Box, Divider, Link, RadioButton, RadioGroup, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';
import {
  Combination,
  OptionType,
  Product,
  Variant,
  WarrantyOffer,
  selectAssemblyAiData,
  selectHasWarrantyPlans,
  selectWarrantyList,
} from '@castlery/modules-product-domain';

import { ArrowForwardIos } from '@castlery/fortress/Icons';
import { FortressImage, OptionSelector } from '@castlery/shared-components';
import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { sharedFeatureService } from '@castlery/shared-services';
import { useCombination } from '../../../../hooks/use-combination';
import { useProductOptionValues } from '../../../../hooks/use-product-option-values';
import { ProductDetailsDrawer } from '../../../product-details/components/product-details-drawer';
import { ProductFabricTooltip } from './product-fabrc-tooltip';
import { ProductFabricDrawer } from './product-fabric-drawer';
import { ProductFreeSwatchDrawer } from './product-free-swatch-drawer';
import { ProductFreeSwatchDrawerV2 } from './product-free-swatch-drawer.v2';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;

interface ProductOptionsValuesProps {
  sortOptionType: OptionType;
  product: Product;
  variant: Variant | undefined;
}

// Display mode configuration
export const displayMode = {
  material: 'square',
  leg_color: 'square',
  wood: 'square',
  color_option: 'square',
  colour_option: 'square',
  frame: 'square',
  orientation: 'rectangle',
};

export const ProductOptionsValues = (props: ProductOptionsValuesProps) => {
  const { sortOptionType, product, variant } = props;
  const { desktop } = useBreakpoints();
  const [openFabricDrawer, setOpenFabricDrawer] = useState(false);
  const [openFreeSwatchDrawer, setOpenFreeSwatchDrawer] = useState(false);
  const [openDimensionDrawer, setOpenDimensionDrawer] = useState(false);
  const warrantyList = useAppSelector(selectWarrantyList) as WarrantyOffer[] | undefined;
  const hasWarrantyPlans = useAppSelector(selectHasWarrantyPlans);
  const assemblyAiData = useAppSelector(selectAssemblyAiData);
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const isMulberryEnabled = sharedFeatureService.isMulberryEnabled();
  const warrantyProvider = isGuardsmanEnabled ? 'guardsman' : isMulberryEnabled ? 'mulberry' : undefined;
  const showComfort = useMemo(
    () =>
      (variant?.variant_properties?.comfort_ratings?.length || 0) > 0 ||
      (product?.product_properties?.comfort_ratings?.length || 0) > 0,
    [variant, product]
  );
  const showAssembly = useMemo(() => {
    return (
      (variant?.variant_properties?.assembly?.length || 0) > 0 ||
      (product?.product_properties?.assembly?.length || 0) > 0 ||
      (assemblyAiData?.aiDocs?.length || 0) > 0 ||
      (assemblyAiData?.aiVideos?.length || 0) > 0 ||
      EcEnv.NEXT_PUBLIC_COUNTRY === 'US'
    );
  }, [variant, product, assemblyAiData]);

  const targetLinks = useMemo(() => {
    return variant?.dimension_image?.links || product?.dimension_image?.links;
  }, [product, variant]);
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

  return (
    <>
      {sortOptionType.name === 'material' && (
        <Stack>
          {stockedOptions.length > 0 && (
            <Stack>
              <Typography level="caption1" my={3}>
                Stocked fabrics:
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
                size={64}
                variant="square"
              />
            </Stack>
          )}
          {customOptions.length > 0 && (
            <Stack>
              <Typography level="caption1" mt={3} mb={1}>
                Custom fabrics:
              </Typography>
              <Typography level="caption2" mb={3}>
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
                size={64}
                variant="square"
              />
            </Stack>
          )}
          <Stack direction="row" mt={4}>
            <Link component="button" level="body1" variant="secondary" onClick={() => setOpenFabricDrawer(true)}>
              View fabric details
            </Link>
            {freeSwatch && (
              <>
                <Divider orientation="vertical" sx={{ mx: 3 }} />
                <Link
                  component="button"
                  level="body1"
                  variant="secondary"
                  data-selenium="open_swatch"
                  onClick={() => setOpenFreeSwatchDrawer(true)}
                >
                  Get free swatches
                </Link>
              </>
            )}
          </Stack>
          <ProductFabricDrawer
            open={openFabricDrawer}
            onClose={() => setOpenFabricDrawer(false)}
            options={sortOptionValues || []}
            selectedOption={sortOptionValues?.find((option) => option.isSelected)}
          />
          {enableOrderV2 ? (
            <ProductFreeSwatchDrawerV2 open={openFreeSwatchDrawer} onClose={() => setOpenFreeSwatchDrawer(false)} />
          ) : (
            <ProductFreeSwatchDrawer open={openFreeSwatchDrawer} onClose={() => setOpenFreeSwatchDrawer(false)} />
          )}
        </Stack>
      )}

      {sortOptionType.name !== 'material' && (
        <>
          {(() => {
            const currentDisplayMode = displayMode[sortOptionType.name as keyof typeof displayMode] || 'rectangle';
            const isOrientation = sortOptionType.name === 'orientation';

            if (currentDisplayMode === 'square') {
              return (
                <OptionSelector
                  options={sortOptionValues || []}
                  onSelect={handleSelect}
                  maxDisplay={sortOptionValues?.length || 0}
                  showAdditionalCount={false}
                  sx={{
                    flexWrap: 'wrap',
                    mt: 3,
                  }}
                  isProductPage={true}
                  variant={currentDisplayMode}
                  size={64}
                />
              );
            } else {
              return (
                <RadioGroup
                  name="configurable-options"
                  value={sortOptionValues?.find((option) => option.isSelected)?.id || ''}
                  onChange={(event) => {
                    const selectedOption = sortOptionValues?.find((option) => option.id === event.target.value);
                    selectedOption?.onSelect();
                  }}
                >
                  <Stack direction="row" flexWrap="wrap" mt={3} gap={3}>
                    {sortOptionValues?.map((option) => (
                      <RadioButton
                        key={option.id}
                        label={
                          option.image ? (
                            <FortressImage
                              src={option.image}
                              alt={option.label}
                              sx={{
                                width: 101,
                                height: 40,
                                '--AspectRatio-paddingBottom': 0,
                                filter:
                                  isOrientation && option.isSelected
                                    ? 'brightness(0) invert(1) sepia(1) brightness(0.97)'
                                    : 'none',
                              }}
                              sizes={101 + 'px'}
                            />
                          ) : (
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
                              {option.label?.toLowerCase()}
                            </Box>
                          )
                        }
                        value={option.id}
                        sx={{
                          ...(option.image && {
                            '& .MuiRadio-label': {
                              px: 2,
                              py: 1,
                            },
                          }),
                          ...(option.image &&
                            isOrientation && {
                              '@media (hover: hover)': {
                                '&:hover img': {
                                  filter: 'brightness(0) invert(1) sepia(1) brightness(0.97) !important',
                                },
                              },
                              '@media (hover: none)': {
                                '&:active img': {
                                  filter: 'brightness(0) invert(1) sepia(1) brightness(0.97) !important',
                                },
                              },
                            }),
                        }}
                      />
                    ))}
                  </Stack>
                </RadioGroup>
              );
            }
          })()}
          {sortOptionType.presentation === 'Size' && (
            <>
              {targetLinks && (
                <Link
                  component="button"
                  variant="secondary"
                  level="body1"
                  mt={3}
                  py={2}
                  onClick={() => setOpenDimensionDrawer(true)}
                  endDecorator={
                    <ArrowForwardIos
                      sx={{
                        width: '20px',
                        height: '20px',
                      }}
                    />
                  }
                >
                  Size guide
                </Link>
              )}
            </>
          )}
          <ProductDetailsDrawer
            open={openDimensionDrawer}
            onClose={() => setOpenDimensionDrawer(false)}
            initialSection="dimensions"
            product={product}
            variant={variant}
            warrantyList={warrantyList}
            hasWarrantyPlans={hasWarrantyPlans}
            warrantyProvider={warrantyProvider}
            showAssembly={showAssembly}
            showComfort={showComfort}
            assemblyAiData={assemblyAiData}
          />
        </>
      )}
    </>
  );
};
